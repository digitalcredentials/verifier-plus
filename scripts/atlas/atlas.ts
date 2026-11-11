/**
 * Tools for moving the verifier-plus credentials collection from MongoDB Atlas
 * to DynamoDB. See README.md beside this file.
 *
 *   npx tsx scripts/atlas/atlas.ts <command> [options]
 *
 * Settings come from the environment only, never from flags, so a connection
 * string stays out of shell history:
 *
 *   scan               ATLAS_URI (required; a read-only user's connection string),
 *                      ATLAS_DB (default verifier-plus), ATLAS_COLLECTION (default credentials)
 *   copy, synthetic    SOURCE_URI (required), SOURCE_DB, SOURCE_COLLECTION, same defaults
 *
 * Aggregates go to stdout and errors to stderr. Nothing here prints a
 * credential id, a holder DID or any part of a stored presentation, except
 * copy's sample links on staging, whose data is synthetic.
 */
import type { Collection, Document } from 'mongodb';

import { MAX_SHARED_VP_BYTES } from '@/lib/credentials';
import { DEFAULT_CREDENTIAL_TTL_DAYS } from '@/lib/settings';

import {
  ATLAS_VARIABLES,
  DAY_MS,
  formatBytes,
  formatDays,
  type MongoTarget,
  openMongo,
  printRows,
  Refusal,
  UsageError,
  UUID_V4,
} from './common';
import { copy, copyUsage } from './copy';
import { synthetic, syntheticUsage } from './synthetic';

/** The age at which a shared credential expires: the app's default CREDENTIAL_TTL_DAYS. */
const TTL_DAYS = DEFAULT_CREDENTIAL_TTL_DAYS;
/** The app's limit on a shared presentation: 350 KB of UTF-8 JSON. */
const LIMIT_BYTES = MAX_SHARED_VP_BYTES;
/** DynamoDB's limit on a whole item. */
const DYNAMODB_ITEM_BYTES = 400 * 1024;

type Command = {
  summary: string;
  usage: string;
  /** Returns the exit code. */
  run: (args: string[]) => Promise<number>;
};

const out = (line = '') => process.stdout.write(`${line}\n`);

const commands: Record<string, Command> = {
  scan: {
    summary: 'Print the collection\'s indexes and aggregate counts and vp sizes. Reads only. ATLAS_URI.',
    usage: 'scan',
    run: runScan,
  },
  copy: {
    summary: 'Copy shared, unexpired credentials from SOURCE_URI to a DynamoDB table. Dry run unless --write.',
    usage: copyUsage,
    run: async (args) => (await copy(args, process.env, out)).exitCode,
  },
  synthetic: {
    summary: 'Write a generated data set in Atlas\'s shape to a MongoDB on localhost (SOURCE_URI).',
    usage: syntheticUsage,
    run: async (args) => {
      await synthetic(args, process.env, out);
      return 0;
    },
  },
};

// ---------------------------------------------------------------------------
// Connection

type Atlas = MongoTarget;

function openAtlas(): Atlas {
  return openMongo(process.env, ATLAS_VARIABLES, { readPreference: 'secondaryPreferred' });
}

// ---------------------------------------------------------------------------
// scan

/** What scan keeps per document: no id, no controller, no content. */
type Tally = {
  documents: number;
  shared: number;
  unshared: number;
  sharedNotBoolean: number;
  missingCreatedAt: number;
  oddId: number;
  missingVp: number;
  /** UTF-8 bytes of JSON.stringify(vp), every document that has a vp. */
  sizes: number[];
  sharedUnexpired: {
    documents: number;
    sizes: number[];
    oldest?: Date;
    newest?: Date;
  };
};

async function runScan(args: string[]): Promise<number> {
  if (args.length > 0) throw new UsageError('scan takes no options.');
  const atlas = openAtlas();
  out(`Reading ${atlas.db}.${atlas.collectionName} on ${atlas.host}`);
  try {
    await scan(atlas);
  } finally {
    await atlas.close();
  }
  return 0;
}

async function scan(atlas: Atlas): Promise<void> {
  const now = new Date();
  const indexes = await atlas.collection.listIndexes().toArray();
  const tally = await tallyDocuments(atlas.collection, now);
  printScan(now, indexes, tally);
}

async function tallyDocuments(collection: Collection, now: Date): Promise<Tally> {
  const tally: Tally = {
    documents: 0,
    shared: 0,
    unshared: 0,
    sharedNotBoolean: 0,
    missingCreatedAt: 0,
    oddId: 0,
    missingVp: 0,
    sizes: [],
    sharedUnexpired: { documents: 0, sizes: [] },
  };

  const cursor = collection.find({}, { projection: { _id: 0, id: 1, createdAt: 1, shared: 1, vp: 1 } });
  for await (const doc of cursor) {
    tally.documents += 1;

    if (doc.shared === true) tally.shared += 1;
    else if (doc.shared === false) tally.unshared += 1;
    else tally.sharedNotBoolean += 1;

    if (typeof doc.id !== 'string' || !UUID_V4.test(doc.id)) tally.oddId += 1;

    const createdAt = doc.createdAt instanceof Date && !Number.isNaN(doc.createdAt.getTime())
      ? doc.createdAt
      : undefined;
    if (!createdAt) tally.missingCreatedAt += 1;

    // The same measure as the app's limit on sharing.
    const json = doc.vp === undefined ? undefined : JSON.stringify(doc.vp);
    const bytes = json === undefined ? undefined : Buffer.byteLength(json, 'utf8');
    if (bytes === undefined) tally.missingVp += 1;
    else tally.sizes.push(bytes);

    const unexpired = createdAt !== undefined && createdAt.getTime() + TTL_DAYS * DAY_MS > now.getTime();
    if (doc.shared === true && unexpired) {
      const set = tally.sharedUnexpired;
      set.documents += 1;
      if (bytes !== undefined) set.sizes.push(bytes);
      if (!set.oldest || createdAt < set.oldest) set.oldest = createdAt;
      if (!set.newest || createdAt > set.newest) set.newest = createdAt;
    }
  }
  return tally;
}

function printScan(now: Date, indexes: Document[], tally: Tally): void {
  out(`Scanned at ${now.toISOString()}`);
  out();
  out('Indexes');
  for (const index of indexes) {
    const { name, key, v: _v, ns: _ns, ...options } = index;
    out(`  ${name}`);
    out(`    key: ${JSON.stringify(key)}`);
    if (options.expireAfterSeconds !== undefined) {
      const seconds = Number(options.expireAfterSeconds);
      out(`    expireAfterSeconds: ${seconds} (${formatDays(seconds)})`);
    }
    const rest = Object.fromEntries(Object.entries(options).filter(([option]) => option !== 'expireAfterSeconds'));
    if (Object.keys(rest).length > 0) out(`    options: ${JSON.stringify(rest)}`);
  }
  if (indexes.length === 0) out('  none');
  out();

  out('Documents');
  const rows: [string, number][] = [
    ['total', tally.documents],
    ['shared', tally.shared],
    ['unshared', tally.unshared],
    ['shared missing or not a boolean', tally.sharedNotBoolean],
    [`shared and unexpired (createdAt within ${TTL_DAYS} days)`, tally.sharedUnexpired.documents],
    ['createdAt missing or not a date', tally.missingCreatedAt],
    ['id missing or not a v4 UUID', tally.oddId],
    ['vp missing', tally.missingVp],
  ];
  printRows(out, rows);
  out();

  printSizes(out, 'vp size, all documents with a vp', tally.sizes);
  out();
  printSizes(out, 'vp size, shared and unexpired', tally.sharedUnexpired.sizes);
  out();

  out('createdAt range, shared and unexpired');
  const { oldest, newest } = tally.sharedUnexpired;
  printRows(out, [
    ['oldest', oldest ? oldest.toISOString() : 'none'],
    ['newest', newest ? newest.toISOString() : 'none'],
  ]);
}

function printSizes(out: (line?: string) => void, title: string, sizes: number[]): void {
  const sorted = [...sizes].sort((a, b) => a - b);
  out(title);
  printRows(out, [
    ['count', sorted.length],
    ['max', formatBytes(sorted[sorted.length - 1])],
    ['p50', formatBytes(percentile(sorted, 50))],
    ['p90', formatBytes(percentile(sorted, 90))],
    ['p99', formatBytes(percentile(sorted, 99))],
    [`over ${formatBytes(LIMIT_BYTES)}`, sorted.filter((bytes) => bytes > LIMIT_BYTES).length],
    [`over ${formatBytes(DYNAMODB_ITEM_BYTES)}`, sorted.filter((bytes) => bytes > DYNAMODB_ITEM_BYTES).length],
  ]);
}

/** Nearest-rank percentile of an ascending list; undefined when it is empty. */
function percentile(sorted: number[], p: number): number | undefined {
  if (sorted.length === 0) return undefined;
  return sorted[Math.max(0, Math.ceil((p / 100) * sorted.length) - 1)];
}

// ---------------------------------------------------------------------------
// Entry point

function usage(): string {
  const names = Object.keys(commands);
  const width = Math.max(...names.map((name) => name.length));
  return [
    'Usage: npx tsx scripts/atlas/atlas.ts <command> [options]',
    '',
    'Commands:',
    ...names.map((name) => `  ${name.padEnd(width)}  ${commands[name].summary}`),
    '',
    'Options:',
    ...names.map((name) => `  ${commands[name].usage}`),
    '',
    'Settings, from the environment only:',
    '  scan             ATLAS_URI (required), ATLAS_DB, ATLAS_COLLECTION',
    '  copy, synthetic  SOURCE_URI (required), SOURCE_DB, SOURCE_COLLECTION, CREDENTIAL_TTL_DAYS',
    '  copy             AWS_PROFILE, or DYNAMODB_ENDPOINT with --expect-account local',
  ].join('\n');
}

async function main(argv: string[]): Promise<number> {
  const [name, ...args] = argv;
  const command = name === undefined ? undefined : commands[name];
  if (!command) {
    process.stderr.write(`${usage()}\n`);
    return 2;
  }
  return command.run(args);
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    if (error instanceof Refusal) process.stderr.write('Refused: nothing was written.\n');
    process.exitCode = error instanceof UsageError ? 2 : 1;
  },
);
