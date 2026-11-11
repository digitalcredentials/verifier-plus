/**
 * What the Atlas scripts' commands share: the MongoDB connection, the errors
 * that set the exit code, and the output helpers. Each command names the
 * environment variables it reads; a URI never comes from a flag.
 */
import { MongoClient, type Collection, type MongoClientOptions } from 'mongodb';

import { readSettings } from '@/lib/settings';

export type Env = Record<string, string | undefined>;

/** Writes one line of output. */
export type Out = (line?: string) => void;

/** A mistake in how the script was called: exit 2. */
export class UsageError extends Error {}

/** A target or setting the script will not touch: exit 1. */
export class Refusal extends Error {}

export const DAY_MS = 24 * 60 * 60 * 1000;
export const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// ---------------------------------------------------------------------------
// MongoDB

export type MongoVariables = {
  uri: string;
  db: string;
  collection: string;
};

/** scan reads production Atlas. */
export const ATLAS_VARIABLES: MongoVariables = { uri: 'ATLAS_URI', db: 'ATLAS_DB', collection: 'ATLAS_COLLECTION' };

/** copy reads, and synthetic writes, a source that is Atlas only for the production run. */
export const SOURCE_VARIABLES: MongoVariables = { uri: 'SOURCE_URI', db: 'SOURCE_DB', collection: 'SOURCE_COLLECTION' };

export type MongoTarget = {
  client: MongoClient;
  /** Where the URI points, with no user name or password. */
  host: string;
  db: string;
  collectionName: string;
  collection: Collection;
  close: () => Promise<void>;
};

/**
 * Parses the URI in env[variables.uri] without connecting, with the database
 * and collection from the other two variables (defaults as in the app).
 */
export function openMongo(env: Env, variables: MongoVariables, options: MongoClientOptions = {}): MongoTarget {
  const uri = env[variables.uri];
  if (!uri) {
    throw new UsageError(`${variables.uri} is not set. Export the connection string first; see scripts/atlas/README.md.`);
  }
  const db = env[variables.db] || 'verifier-plus';
  const collectionName = env[variables.collection] || 'credentials';

  let client: MongoClient;
  try {
    // The constructor parses the URI without connecting.
    client = new MongoClient(uri, options);
  } catch {
    // The parser's message can quote the URI, password included, so it is not printed.
    throw new UsageError(`${variables.uri} is not a valid MongoDB connection string.`);
  }

  return {
    client,
    host: hostOf(client),
    db,
    collectionName,
    collection: client.db(db).collection(collectionName),
    close: () => client.close(),
  };
}

/** The host part of the parsed URI: the SRV name, or the seed list. Never the credentials. */
export function hostOf(client: MongoClient): string {
  const { srvHost, hosts } = client.options;
  return srvHost ?? hosts.map((host) => host.toString()).join(',');
}

// ---------------------------------------------------------------------------
// Settings shared with the app

/**
 * The credential TTL in days, read from CREDENTIAL_TTL_DAYS by the app's own
 * settings reader (default 365). An invalid value is a usage error here,
 * where the app would fall back to the default.
 */
export function readTtlDays(env: Env): number {
  const { values, problems } = readSettings({ CREDENTIAL_STORE: 'memory', CREDENTIAL_TTL_DAYS: env.CREDENTIAL_TTL_DAYS });
  const problem = problems.find((message) => message.startsWith('CREDENTIAL_TTL_DAYS'));
  if (problem) throw new UsageError(problem);
  return values.credentialTtlDays;
}

// ---------------------------------------------------------------------------
// Output

export function printRows(out: Out, rows: [string, number | string][], indent = '  '): void {
  const width = Math.max(...rows.map(([label]) => label.length));
  for (const [label, value] of rows) {
    out(`${indent}${label.padEnd(width)}  ${typeof value === 'number' ? value.toLocaleString('en-US') : value}`);
  }
}

export function formatBytes(bytes: number | undefined): string {
  if (bytes === undefined) return 'none';
  return `${bytes.toLocaleString('en-US')} bytes (${(bytes / 1024).toFixed(1)} KB)`;
}

export function formatDays(seconds: number): string {
  const days = seconds / (DAY_MS / 1000);
  return `${Number.isInteger(days) ? days : days.toFixed(2)} days`;
}
