/**
 * copy: reads the shared, unexpired credentials from a MongoDB collection in
 * the 2.x shape (Atlas, or a local copy for the rehearsal) and writes them to
 * a DynamoDB table through the app's own dynamodb store. See README.md.
 *
 * Never writes to the source. Prints counts only: no id, holder DID or
 * presentation content, except the sample links on staging (synthetic data).
 */
import { parseArgs } from 'node:util';

import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';
import type { Document } from 'mongodb';

import { MAX_SHARED_VP_BYTES } from '@/lib/credentials';
import { type CredentialRecord, isCredentialError } from '@/lib/credentialStore/credential-store';
import { DynamoCredentialStore } from '@/lib/credentialStore/dynamodb-store';
import type { VerifiablePresentation } from '@/types/presentation';

import {
  DAY_MS,
  type Env,
  formatBytes,
  openMongo,
  type Out,
  printRows,
  readTtlDays,
  Refusal,
  SOURCE_VARIABLES,
  UsageError,
  UUID_V4,
} from './common';

/** Both DCC accounts' tables are in us-east-1. */
export const REGION = 'us-east-1';
/** dcc-staging: the only account --sample-links prints for, because its data is synthetic. */
export const STAGING_ACCOUNT = '364323832338';
/** Writes in flight at once. The data set is small; this only keeps a run short. */
const CONCURRENCY = 10;
const MAX_SAMPLE_LINKS = 20;
/** DynamoDB Local accepts any credentials. */
const LOCAL_CREDENTIALS = { accessKeyId: 'local', secretAccessKey: 'local' };

export const copyUsage =
  'copy --table <name> --expect-account <12-digit account id | local> [--write] [--sample-links <n>]';

// ---------------------------------------------------------------------------
// Selection and mapping (pure)

export type SkipReason = 'unshared' | 'expired' | 'tooLarge' | 'malformed';

export type Selection = { copy: CredentialRecord } | { skip: SkipReason };

/**
 * Decides one source document: copy it as a record in the app's shape, or
 * skip it for one reason. Malformed is decided first (a document that cannot
 * be read as a credential), then unshared, expired and too large. Never
 * invents a value: anything missing or of the wrong type is malformed.
 */
export function selectRecord(doc: Document, now: Date, ttlDays: number): Selection {
  const { id, controller, createdAt, vp, shared } = doc;
  const wellFormed =
    typeof id === 'string' &&
    UUID_V4.test(id) &&
    typeof controller === 'string' &&
    controller.length > 0 &&
    createdAt instanceof Date &&
    !Number.isNaN(createdAt.getTime()) &&
    isPlainObject(vp) &&
    typeof shared === 'boolean';
  if (!wellFormed) return { skip: 'malformed' };
  if (!shared) return { skip: 'unshared' };

  const expiresAt = new Date(createdAt.getTime() + ttlDays * DAY_MS);
  // As the credential service: a credential is gone once now reaches expiresAt.
  if (expiresAt.getTime() <= now.getTime()) return { skip: 'expired' };
  // The service's own limit on sharing, with the service's own constant.
  if (Buffer.byteLength(JSON.stringify(vp), 'utf8') > MAX_SHARED_VP_BYTES) return { skip: 'tooLarge' };

  return { copy: { id, controller, createdAt, expiresAt, vp: vp as VerifiablePresentation, shared: true } };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// ---------------------------------------------------------------------------
// Options and the account guard

export type CopyOptions = {
  table: string;
  expectAccount: string;
  write: boolean;
  sampleLinks: number;
};

export function parseCopyArgs(args: string[]): CopyOptions {
  let values;
  try {
    ({ values } = parseArgs({
      args,
      strict: true,
      allowPositionals: false,
      options: {
        table: { type: 'string' },
        'expect-account': { type: 'string' },
        write: { type: 'boolean', default: false },
        'sample-links': { type: 'string' },
      },
    }));
  } catch (error) {
    throw new UsageError(`${(error as Error).message}\nUsage: ${copyUsage}`);
  }

  const table = values.table?.trim();
  if (!table) throw new UsageError(`--table is required.\nUsage: ${copyUsage}`);

  const expectAccount = values['expect-account']?.trim();
  if (!expectAccount) throw new UsageError(`--expect-account is required.\nUsage: ${copyUsage}`);
  if (expectAccount !== 'local' && !/^\d{12}$/.test(expectAccount)) {
    throw new UsageError(`--expect-account must be a 12-digit AWS account id, or local; it is '${expectAccount}'.`);
  }

  let sampleLinks = 0;
  if (values['sample-links'] !== undefined) {
    const text = values['sample-links'].trim();
    sampleLinks = /^[1-9][0-9]*$/.test(text) ? Number(text) : NaN;
    if (!(sampleLinks <= MAX_SAMPLE_LINKS)) {
      throw new UsageError(`--sample-links must be a whole number from 1 to ${MAX_SAMPLE_LINKS}.`);
    }
    if (!values.write) throw new UsageError('--sample-links needs --write: a dry run copies nothing to link to.');
  }

  return { table, expectAccount, write: values.write ?? false, sampleLinks };
}

export type Target = {
  /** The AWS account the credentials belong to, or local. */
  account: string;
  endpoint?: string;
  credentials?: typeof LOCAL_CREDENTIALS;
};

/** Which account a set of AWS credentials belongs to. Replaced in tests. */
export type AccountLookup = () => Promise<string | undefined>;

export const callerAccount: AccountLookup = async () => {
  const sts = new STSClient({ region: REGION });
  try {
    return (await sts.send(new GetCallerIdentityCommand({}))).Account;
  } finally {
    sts.destroy();
  }
};

/**
 * Refuses unless the target is the account the operator named. local means
 * DynamoDB Local, and is allowed only when DYNAMODB_ENDPOINT is set; a real
 * account is refused while DYNAMODB_ENDPOINT is set, because the writes would
 * not go to it.
 */
export async function confirmTarget(options: CopyOptions, env: Env, lookup: AccountLookup = callerAccount): Promise<Target> {
  const endpoint = env.DYNAMODB_ENDPOINT?.trim() || undefined;

  if (options.expectAccount === 'local') {
    if (!endpoint) throw new Refusal('--expect-account local is only for DynamoDB Local, and DYNAMODB_ENDPOINT is not set.');
    if (options.sampleLinks > 0) throw new Refusal(`--sample-links prints only for the staging account (${STAGING_ACCOUNT}).`);
    return { account: 'local', endpoint, credentials: LOCAL_CREDENTIALS };
  }

  if (endpoint) {
    throw new Refusal(
      `DYNAMODB_ENDPOINT is set, so writes would go to ${endpoint}, not account ${options.expectAccount}. ` +
        'Unset it, or pass --expect-account local.',
    );
  }
  const account = await lookup();
  if (account !== options.expectAccount) {
    throw new Refusal(
      `The AWS credentials are for account ${account ?? 'unknown'}, not ${options.expectAccount}. Check AWS_PROFILE.`,
    );
  }
  if (options.sampleLinks > 0 && account !== STAGING_ACCOUNT) {
    throw new Refusal(`--sample-links prints only for the staging account (${STAGING_ACCOUNT}).`);
  }
  return { account };
}

// ---------------------------------------------------------------------------
// The run

export type CopyCounts = {
  read: number;
  selected: number;
  written: number;
  alreadyPresent: number;
  skipped: Record<SkipReason, number>;
  /** Failed writes by error code or name; never by message, which can carry an id. */
  errors: Record<string, number>;
};

export type CopyReport = {
  counts: CopyCounts;
  /** Ids written or already present, up to --sample-links; printed only on staging. */
  sampleIds: string[];
  exitCode: number;
};

export async function copy(args: string[], env: Env, out: Out, lookup?: AccountLookup): Promise<CopyReport> {
  const options = parseCopyArgs(args);
  const ttlDays = readTtlDays(env);

  // Before anything else: whose table this is.
  const target = await confirmTarget(options, env, lookup);
  const source = openMongo(env, SOURCE_VARIABLES, { readPreference: 'secondaryPreferred' });

  printRows(out, [
    ['Account', target.account],
    ['Table', target.endpoint ? `${options.table} on DynamoDB Local at ${target.endpoint}` : `${options.table} in ${REGION}`],
    ['Source', `${source.db}.${source.collectionName} on ${source.host} (read only)`],
    ['Mode', options.write ? 'write' : 'dry run: reads only; pass --write to write'],
    ['TTL', `${ttlDays} days from createdAt`],
    ['Size limit', `${formatBytes(MAX_SHARED_VP_BYTES)} of vp JSON`],
  ], '');
  out();

  const store = DynamoCredentialStore({
    table: options.table,
    region: REGION,
    endpoint: target.endpoint,
    credentials: target.credentials,
  });

  try {
    try {
      await store.ping();
    } catch (error) {
      throw new Error(`Cannot read table ${options.table}: ${errorLabel(error)}.`);
    }
    const report = await copyAll(source.collection.find({}, { projection: SOURCE_FIELDS }), store, options, ttlDays);
    printCounts(out, report.counts, options.write);
    if (report.sampleIds.length > 0) {
      out();
      out('Sample links (staging; synthetic data)');
      for (const id of report.sampleIds) out(`  /credentials/${id}`);
    }
    return report;
  } finally {
    await source.close();
    await store.close();
  }
}

const SOURCE_FIELDS = { _id: 0, id: 1, controller: 1, createdAt: 1, vp: 1, shared: 1 };

async function copyAll(
  documents: AsyncIterable<Document>,
  store: DynamoCredentialStore,
  options: CopyOptions,
  ttlDays: number,
): Promise<CopyReport> {
  const now = new Date();
  const counts: CopyCounts = {
    read: 0,
    selected: 0,
    written: 0,
    alreadyPresent: 0,
    skipped: { unshared: 0, expired: 0, tooLarge: 0, malformed: 0 },
    errors: {},
  };
  const sampleIds: string[] = [];
  const keepSample = (id: string) => {
    if (sampleIds.length < options.sampleLinks) sampleIds.push(id);
  };

  // put is create-only-if-absent, so a record copied by an earlier run is
  // "already present", which is what makes a second run safe.
  const writeOne = async (record: CredentialRecord) => {
    try {
      await store.put(record);
      counts.written += 1;
      keepSample(record.id);
    } catch (error) {
      if (isCredentialError(error, 'credential-already-exists')) {
        counts.alreadyPresent += 1;
        keepSample(record.id);
      } else {
        const label = errorLabel(error);
        counts.errors[label] = (counts.errors[label] ?? 0) + 1;
      }
    }
  };

  const inFlight = new Set<Promise<void>>();
  for await (const doc of documents) {
    counts.read += 1;
    const selection = selectRecord(doc, now, ttlDays);
    if ('skip' in selection) {
      counts.skipped[selection.skip] += 1;
      continue;
    }
    counts.selected += 1;
    if (!options.write) continue;

    const write: Promise<void> = writeOne(selection.copy).finally(() => inFlight.delete(write));
    inFlight.add(write);
    if (inFlight.size >= CONCURRENCY) await Promise.race(inFlight);
  }
  await Promise.all(inFlight);

  const failed = Object.values(counts.errors).reduce((sum, n) => sum + n, 0);
  return { counts, sampleIds, exitCode: failed > 0 ? 1 : 0 };
}

/** An error's code or name: never its message, which can carry an id. */
function errorLabel(error: unknown): string {
  if (isCredentialError(error)) return error.code;
  return error instanceof Error ? error.name : 'unknown';
}

function printCounts(out: Out, counts: CopyCounts, write: boolean): void {
  const failed = Object.values(counts.errors).reduce((sum, n) => sum + n, 0);
  out('Counts');
  printRows(out, [
    ['read', counts.read],
    ['selected (shared, unexpired, within the limit)', counts.selected],
    [write ? 'written' : 'would write (dry run; already present ones not checked)', write ? counts.written : counts.selected],
    ['already present', write ? counts.alreadyPresent : 'not checked'],
    ['skipped, unshared', counts.skipped.unshared],
    ['skipped, expired', counts.skipped.expired],
    ['skipped, too large', counts.skipped.tooLarge],
    ['skipped, malformed', counts.skipped.malformed],
    ['errors', failed],
  ]);
  const labels = Object.entries(counts.errors);
  if (labels.length > 0) printRows(out, labels, '    ');
}
