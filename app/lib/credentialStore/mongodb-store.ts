import { MongoClient, MongoServerError, type IndexSpecification, type CreateIndexesOptions } from 'mongodb';

import type { MongoSettings } from '@/lib/settings';
import type { VerifiablePresentation } from '@/types/presentation';

import {
  CredentialAlreadyExists,
  CredentialNotFound,
  type CredentialRecord,
  type CredentialStore,
} from './credential-store';

const DAY_MS = 24 * 60 * 60 * 1000;

/** MongoDB's duplicate key error. */
const DUPLICATE_KEY = 11000;

export type MongoCredentialStoreConfig = MongoSettings & {
  /** For documents written by 2.x, which have no expiresAt. */
  ttlDays: number;
  log?: (message: string) => void;
};

/** A document as 3.x writes it. 2.x documents lack expiresAt. */
type CredentialDocument = {
  id: string;
  controller: string;
  createdAt: Date;
  expiresAt?: Date;
  vp: VerifiablePresentation;
  shared: boolean;
};

/**
 * The indexes this store needs, by their default names so an identical index
 * made by hand is accepted. Mongo deletes a document once the date in its
 * expiresAt passes. The TTL index is on expiresAt, not createdAt, so it cannot
 * clash with a TTL index an existing deployment already has on createdAt.
 */
const indexes: { key: IndexSpecification; options: CreateIndexesOptions; describe: string }[] = [
  { key: { id: 1 }, options: { unique: true }, describe: '{ id: 1 } unique' },
  { key: { expiresAt: 1 }, options: { expireAfterSeconds: 0 }, describe: '{ expiresAt: 1 } with expireAfterSeconds 0' },
];

/**
 * Keeps credentials in a MongoDB collection, for Docker and self-hosting.
 *
 * One client per store, connected on first use. The indexes are created once,
 * on first use too: put waits for them, because the unique index is what makes
 * put create-only, and ping waits for them so /health/ready can say which index
 * failed. Reads and writes use the client's defaults (primary, default read
 * concern), which is enough to read your own write on a single replica set.
 */
export function MongoCredentialStore(config: MongoCredentialStoreConfig) {
  const log = config.log ?? console.info;
  const client = new MongoClient(config.uri, { maxPoolSize: 20 });
  const db = client.db(config.dbName);
  const collection = db.collection<CredentialDocument>(config.collection);

  let connected: Promise<void> | undefined;
  let indexed: Promise<void> | undefined;

  /** Memoised; forgotten on failure, so the next call tries again. */
  function connect(): Promise<void> {
    connected ??= client.connect().then(
      () => log(`Connected to MongoDB at ${config.host}`),
      (error) => {
        connected = undefined;
        throw error;
      },
    );
    return connected;
  }

  /** Memoised; forgotten on failure, so the next call tries again. */
  function ensureIndexes(): Promise<void> {
    indexed ??= createIndexes().catch((error) => {
      indexed = undefined;
      throw error;
    });
    return indexed;
  }

  async function createIndexes() {
    await connect();
    for (const index of indexes) {
      try {
        await collection.createIndex(index.key, index.options);
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(
          `Could not create the MongoDB index ${index.describe} on collection ${config.collection}: ${reason}`,
          { cause: error },
        );
      }
    }
  }

  function fromDocument(doc: CredentialDocument): CredentialRecord {
    const { id, controller, createdAt, vp, shared } = doc;
    const expiresAt = doc.expiresAt ?? new Date(createdAt.getTime() + config.ttlDays * DAY_MS);
    return { id, controller, createdAt, expiresAt, vp, shared };
  }

  return {
    async put(record: CredentialRecord) {
      await ensureIndexes();
      try {
        // A copy, because insertOne adds _id to the object it is given.
        await collection.insertOne({ ...record });
      } catch (error) {
        if (error instanceof MongoServerError && error.code === DUPLICATE_KEY) throw CredentialAlreadyExists(record.id);
        throw error;
      }
    },

    async get(id: string) {
      await connect();
      const doc = await collection.findOne({ id, shared: true }, { projection: { _id: 0 } });
      return doc ? fromDocument(doc) : null;
    },

    async unshare(id: string) {
      await connect();
      const result = await collection.updateOne({ id }, { $set: { shared: false } });
      if (result.matchedCount === 0) throw CredentialNotFound(id);
    },

    async ping() {
      await connect();
      await db.command({ ping: 1 });
      await ensureIndexes();
    },

    async close() {
      await client.close();
    },
  } satisfies CredentialStore & { close(): Promise<void> };
}

export type MongoCredentialStore = ReturnType<typeof MongoCredentialStore>;
