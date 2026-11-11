/**
 * Read-only tools for the verifier-plus credentials collection in MongoDB Atlas.
 * See README.md beside this file.
 *
 *   npx tsx scripts/atlas/atlas.ts <command>
 *
 * Settings come from the environment only, never from flags, so a connection
 * string stays out of shell history:
 *
 *   ATLAS_URI         required; a read-only user's connection string
 *   ATLAS_DB          default verifier-plus
 *   ATLAS_COLLECTION  default credentials
 *
 * Aggregates go to stdout and errors to stderr. Nothing here prints a
 * credential id, a holder DID or any part of a stored presentation.
 */
import { MongoClient, type Collection, type Document } from 'mongodb';

const DAY_MS = 24 * 60 * 60 * 1000;
/** The age at which a shared credential expires: the app's default CREDENTIAL_TTL_DAYS. */
const TTL_DAYS = 365;
/** The app's limit on a shared presentation (MAX_SHARED_VP_BYTES): 350 KB of UTF-8 JSON. */
const LIMIT_BYTES = 350 * 1024;
/** DynamoDB's limit on a whole item. */
const DYNAMODB_ITEM_BYTES = 400 * 1024;
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Command = {
  summary: string;
  run: (atlas: Atlas) => Promise<void>;
};

const commands: Record<string, Command> = {
  scan: {
    summary: 'Print the collection\'s indexes and aggregate counts and vp sizes. Reads only.',
    run: scan,
  },
};

// ---------------------------------------------------------------------------
// Connection

type Atlas = {
  /** Where the URI points, with no user name or password. */
  host: string;
  db: string;
  collectionName: string;
  collection: Collection;
  close: () => Promise<void>;
};

class UsageError extends Error {}

function openAtlas(): Atlas {
  const uri = process.env.ATLAS_URI;
  if (!uri) {
    throw new UsageError('ATLAS_URI is not set. Export the read-only user\'s connection string first; see scripts/atlas/README.md.');
  }
  const db = process.env.ATLAS_DB || 'verifier-plus';
  const collectionName = process.env.ATLAS_COLLECTION || 'credentials';

  let client: MongoClient;
  try {
    // The constructor parses the URI without connecting.
    client = new MongoClient(uri, { readPreference: 'secondaryPreferred' });
  } catch {
    // The parser's message can quote the URI, password included, so it is not printed.
    throw new UsageError('ATLAS_URI is not a valid MongoDB connection string.');
  }

  return {
    host: hostOf(client),
    db,
    collectionName,
    collection: client.db(db).collection(collectionName),
    close: () => client.close(),
  };
}

/** The host part of the parsed URI: the SRV name, or the seed list. Never the credentials. */
function hostOf(client: MongoClient): string {
  const { srvHost, hosts } = client.options;
  return srvHost ?? hosts.map((host) => host.toString()).join(',');
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
  const out = (line = '') => process.stdout.write(`${line}\n`);

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

function printRows(out: (line?: string) => void, rows: [string, number | string][]): void {
  const width = Math.max(...rows.map(([label]) => label.length));
  for (const [label, value] of rows) {
    out(`  ${label.padEnd(width)}  ${typeof value === 'number' ? value.toLocaleString('en-US') : value}`);
  }
}

function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined) return 'none';
  return `${bytes.toLocaleString('en-US')} bytes (${(bytes / 1024).toFixed(1)} KB)`;
}

function formatDays(seconds: number): string {
  const days = seconds / (DAY_MS / 1000);
  return `${Number.isInteger(days) ? days : days.toFixed(2)} days`;
}

// ---------------------------------------------------------------------------
// Entry point

function usage(): string {
  const names = Object.keys(commands);
  const width = Math.max(...names.map((name) => name.length));
  return [
    'Usage: npx tsx scripts/atlas/atlas.ts <command>',
    '',
    'Commands:',
    ...names.map((name) => `  ${name.padEnd(width)}  ${commands[name].summary}`),
    '',
    'Settings, from the environment only: ATLAS_URI (required), ATLAS_DB, ATLAS_COLLECTION.',
  ].join('\n');
}

async function main(argv: string[]): Promise<number> {
  const [name, ...extra] = argv;
  const command = name === undefined ? undefined : commands[name];
  if (!command || extra.length > 0) {
    process.stderr.write(`${usage()}\n`);
    return 2;
  }

  const atlas = openAtlas();
  process.stdout.write(`Reading ${atlas.db}.${atlas.collectionName} on ${atlas.host}\n`);
  try {
    await command.run(atlas);
  } finally {
    await atlas.close();
  }
  return 0;
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = error instanceof UsageError ? 2 : 1;
  },
);
