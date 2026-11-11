/**
 * synthetic: writes a generated data set in Atlas's 2.x record shape into a
 * MongoDB on this machine, for rehearsing copy without real data. Refuses any
 * other host. See README.md.
 */
import { randomBytes, randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';
import { crc32, deflateSync } from 'node:zlib';

import type { Document } from 'mongodb';

import { MAX_SHARED_VP_BYTES } from '@/lib/credentials';

import { getOBv3_v2 } from '../../tests/fixtures/obv3';
import { getTestVP } from '../../tests/fixtures/testVP';
import {
  DAY_MS,
  type Env,
  formatBytes,
  formatDays,
  type MongoTarget,
  openMongo,
  type Out,
  printRows,
  readTtlDays,
  Refusal,
  SOURCE_VARIABLES,
  UsageError,
} from './common';

/**
 * The TTL index on createdAt that production Atlas is assumed to have: 365
 * days. Not yet confirmed; compare it with the index scan prints for Atlas.
 */
export const ATLAS_TTL_INDEX_SECONDS = 365 * DAY_MS / 1000;

/** How far the size fixtures sit from the app's limit, either side of it. */
export const SIZE_MARGIN_BYTES = 16 * 1024;

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);
const DEFAULT_COUNT = 50;
/** The fixed records below, plus at least three spread across the ages. */
export const MIN_COUNT = 10;
const OLDEST_DAYS = 400;

export const syntheticUsage = `synthetic [--count <n>]   (default ${DEFAULT_COUNT}, at least ${MIN_COUNT})`;

// ---------------------------------------------------------------------------
// The data set (pure, apart from random ids)

export type SyntheticKind =
  | 'good'
  | 'image'
  | 'expiresSoon'
  | 'expired'
  | 'unshared'
  | 'tooLarge'
  | 'malformed';

export type SyntheticDocument = { kind: SyntheticKind; doc: Document };

/** What copy should report for this set, if it runs before validUntil. */
export type Expectation = {
  written: number;
  unshared: number;
  tooLarge: number;
  malformed: number;
  /**
   * Expired documents made. The TTL index deletes them from the source within
   * about a minute, as Atlas does, so copy counts anywhere from 0 to this many.
   */
  expiredAtMost: number;
  /** When the soonest-expiring copyable record expires, and the expectation stops holding. */
  validUntil: Date;
};

export type SyntheticSet = { documents: SyntheticDocument[]; expected: Expectation };

/**
 * The fixed records: one unshared, one over the limit, one malformed, one 364
 * days old (expires a day later), and three with embedded images under the
 * limit, the largest just under it. The rest are spread from 1 to 400 days
 * old, so the oldest have expired.
 */
export function buildSyntheticSet(count: number, now: Date, ttlDays: number): SyntheticSet {
  if (!Number.isInteger(count) || count < MIN_COUNT) throw new UsageError(`--count must be a whole number, at least ${MIN_COUNT}.`);
  const ago = (days: number) => new Date(now.getTime() - days * DAY_MS);
  const documents: SyntheticDocument[] = [];
  const add = (kind: SyntheticKind, doc: Document) => documents.push({ kind, doc });

  add('unshared', record({ createdAt: ago(10), vp: fixtureVp(0), shared: false }));
  add('tooLarge', record({ createdAt: ago(5), vp: vpWithImage(MAX_SHARED_VP_BYTES + SIZE_MARGIN_BYTES) }));
  // A string where 2.x stored a Date: unreadable, so copy must skip it rather than guess.
  add('malformed', record({ createdAt: ago(20).toISOString(), vp: fixtureVp(1) }));
  add('expiresSoon', record({ createdAt: ago(ttlDays - 1), vp: fixtureVp(0) }));
  const imageSizes = [Math.round(MAX_SHARED_VP_BYTES / 8), Math.round(MAX_SHARED_VP_BYTES / 2), MAX_SHARED_VP_BYTES - SIZE_MARGIN_BYTES];
  imageSizes.forEach((bytes, i) => add('image', record({ createdAt: ago([2, 30, 90][i]), vp: vpWithImage(bytes) })));

  const spread = count - documents.length;
  for (let i = 0; i < spread; i += 1) {
    const days = 1 + Math.round((i * (OLDEST_DAYS - 1)) / (spread - 1));
    add(days >= ttlDays ? 'expired' : 'good', record({ createdAt: ago(days), vp: fixtureVp(i) }));
  }

  // The size fixtures must sit on their side of the app's limit, whatever it is.
  for (const { kind, doc } of documents) {
    const bytes = Buffer.byteLength(JSON.stringify(doc.vp), 'utf8');
    if (kind === 'tooLarge' ? bytes <= MAX_SHARED_VP_BYTES : bytes > MAX_SHARED_VP_BYTES) {
      throw new Error(`The ${kind} fixture came to ${bytes} bytes, on the wrong side of ${MAX_SHARED_VP_BYTES}.`);
    }
  }

  const copyable = documents.filter(({ kind }) => kind === 'good' || kind === 'image' || kind === 'expiresSoon');
  const tally = (kind: SyntheticKind) => documents.filter((d) => d.kind === kind).length;
  const validUntil = new Date(Math.min(...copyable.map(({ doc }) => (doc.createdAt as Date).getTime() + ttlDays * DAY_MS)));

  return {
    documents,
    expected: {
      written: copyable.length,
      unshared: tally('unshared'),
      tooLarge: tally('tooLarge'),
      malformed: tally('malformed'),
      expiredAtMost: tally('expired'),
      validUntil,
    },
  };
}

/** A document in Atlas's 2.x shape: no expiresAt. MongoDB adds _id. */
function record({ createdAt, vp, shared = true }: { createdAt: Date | string; vp: Document; shared?: boolean }): Document {
  const controller = syntheticDid();
  return { id: randomUUID(), controller, createdAt, vp: { ...vp, holder: controller }, shared };
}

/** Looks like a did:key, but no key exists for it. */
function syntheticDid(): string {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const bytes = randomBytes(44);
  return `did:key:z6Mk${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
}

/** One of the repo's test presentations, with a fresh id: the 1.1 Open Badge VP, or an OBv3 on VC 2.0. */
function fixtureVp(i: number): Document {
  if (i % 2 === 0) return { ...getTestVP().vp, id: `urn:uuid:${randomUUID()}` };
  return presentation(getOBv3_v2());
}

function presentation(credential: Document): Document {
  return {
    '@context': ['https://www.w3.org/ns/credentials/v2'],
    type: ['VerifiablePresentation'],
    id: `urn:uuid:${randomUUID()}`,
    verifiableCredential: credential,
  };
}

/**
 * An OBv3 presentation whose achievement image is an embedded PNG, sized so
 * the vp's JSON comes to about targetBytes. Changing the credential breaks
 * its signature: the page will show it as not verified, with the image.
 */
function vpWithImage(targetBytes: number): Document {
  const credential = getOBv3_v2();
  const prefix = 'data:image/png;base64,';
  const build = (png: Buffer) => {
    credential.credentialSubject.achievement.image = { id: `${prefix}${png.toString('base64')}`, type: 'Image' };
    return presentation(credential);
  };
  // fixtureVp and record add an id and a holder of fixed lengths after this.
  const holderBytes = JSON.stringify({ holder: syntheticDid() }).length - 1;
  const base = Buffer.byteLength(JSON.stringify(build(Buffer.alloc(0))), 'utf8') + holderBytes;
  const pngBytes = Math.max(0, Math.floor(((targetBytes - base) * 3) / 4));
  return build(stripesPng(pngBytes));
}

/**
 * A valid PNG of coloured stripes, stored uncompressed so its size is about
 * the bytes asked for (within one row).
 */
export function stripesPng(bytes: number): Buffer {
  const width = 256;
  const rowBytes = 1 + width * 3;
  const height = Math.max(1, Math.round(bytes / rowBytes));
  const raw = Buffer.alloc(rowBytes * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * rowBytes; // raw[row] = 0: no filter
    for (let x = 0; x < width; x += 1) {
      raw[row + 1 + x * 3] = (x * 4) & 0xff;
      raw[row + 2 + x * 3] = (y * 2) & 0xff;
      raw[row + 3 + x * 3] = ((x + y) * 3) & 0xff;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header.set([8, 2, 0, 0, 0], 8); // 8-bit RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 0 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

// ---------------------------------------------------------------------------
// The run

/** Refuses a URI with any host other than localhost or 127.0.0.1. */
export function assertLocal(target: Pick<MongoTarget, 'client' | 'host'>, uriVariable = SOURCE_VARIABLES.uri): void {
  const { srvHost, hosts } = target.client.options;
  const local = !srvHost && hosts.length === 1 && hosts[0].host !== undefined && LOCAL_HOSTS.has(hosts[0].host);
  if (!local) {
    throw new Refusal(
      `synthetic writes only to a MongoDB on localhost or 127.0.0.1, never to Atlas or any other host; ${uriVariable} points at ${target.host}.`,
    );
  }
}

function parseSyntheticArgs(args: string[]): { count: number } {
  let values;
  try {
    ({ values } = parseArgs({ args, strict: true, allowPositionals: false, options: { count: { type: 'string' } } }));
  } catch (error) {
    throw new UsageError(`${(error as Error).message}\nUsage: ${syntheticUsage}`);
  }
  const text = values.count?.trim() ?? String(DEFAULT_COUNT);
  if (!/^[1-9][0-9]*$/.test(text) || Number(text) < MIN_COUNT) {
    throw new UsageError(`--count must be a whole number, at least ${MIN_COUNT}.`);
  }
  return { count: Number(text) };
}

export async function synthetic(args: string[], env: Env, out: Out): Promise<SyntheticSet> {
  const { count } = parseSyntheticArgs(args);
  const ttlDays = readTtlDays(env);

  // Check the parsed host before connecting, then connect to that one server
  // only, so the driver cannot go on to other members of a replica set.
  const parsed = openMongo(env, SOURCE_VARIABLES);
  try {
    assertLocal(parsed);
  } finally {
    await parsed.close();
  }
  const target = openMongo(env, SOURCE_VARIABLES, { directConnection: true });

  try {
    if ((await target.collection.countDocuments({}, { limit: 1 })) > 0) {
      throw new Refusal(
        `${target.db}.${target.collectionName} on ${target.host} already has documents. ` +
          'synthetic writes only into an empty collection: drop it, or set SOURCE_DB or SOURCE_COLLECTION.',
      );
    }

    const set = buildSyntheticSet(count, new Date(), ttlDays);
    await target.collection.insertMany(set.documents.map(({ doc }) => doc));
    const indexName = await target.collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: ATLAS_TTL_INDEX_SECONDS });

    printMade(out, target, indexName, set, ttlDays);
    return set;
  } finally {
    await target.close();
  }
}

function printMade(out: Out, target: MongoTarget, indexName: string, set: SyntheticSet, ttlDays: number): void {
  const { documents, expected } = set;
  const tally = (kind: SyntheticKind) => documents.filter((d) => d.kind === kind).length;
  const sizes = documents.filter((d) => d.kind === 'image').map(({ doc }) => formatBytes(Buffer.byteLength(JSON.stringify(doc.vp))));

  out(`Wrote ${documents.length} documents to ${target.db}.${target.collectionName} on ${target.host}`);
  out(`Created TTL index ${indexName}: expireAfterSeconds ${ATLAS_TTL_INDEX_SECONDS} (${formatDays(ATLAS_TTL_INDEX_SECONDS)}), assumed to match Atlas`);
  out();
  out('Made');
  printRows(out, [
    ['shared and unexpired, from the test fixtures', tally('good')],
    ['shared and unexpired, with an embedded image', tally('image')],
    [`shared, ${ttlDays - 1} days old (expires in a day)`, tally('expiresSoon')],
    [`shared and expired (${ttlDays} to ${OLDEST_DAYS} days old)`, tally('expired')],
    ['unshared', tally('unshared')],
    [`over the size limit (vp over ${MAX_SHARED_VP_BYTES.toLocaleString('en-US')} bytes)`, tally('tooLarge')],
    ['malformed (createdAt is a string)', tally('malformed')],
  ]);
  out(`  embedded image sizes: ${sizes.join(', ')}`);
  out();
  out(`Expected from copy, if it runs before ${expected.validUntil.toISOString()} with CREDENTIAL_TTL_DAYS ${ttlDays}`);
  printRows(out, [
    ['written', expected.written],
    ['already present', `0 (a second copy --write: ${expected.written})`],
    ['skipped, unshared', expected.unshared],
    ['skipped, expired', `0 to ${expected.expiredAtMost} (the TTL index deletes them within about a minute)`],
    ['skipped, too large', expected.tooLarge],
    ['skipped, malformed', expected.malformed],
    ['errors', 0],
  ]);
  out('After that time, each copyable record moves from written to expired as it passes the TTL.');
}
