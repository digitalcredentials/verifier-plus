import { randomUUID } from 'node:crypto';

import { MongoClient } from 'mongodb';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { mongoHostForLogs } from '@/lib/settings';

import { describeCredentialStore, testRecord } from './contract';
import { MongoCredentialStore, type MongoCredentialStoreConfig } from './mongodb-store';
import { testStoreSelected } from './test-stores';

const uri = process.env.TEST_MONGO_URI ?? 'mongodb://localhost:27017';
const DAY_MS = 24 * 60 * 60 * 1000;

describe.runIf(testStoreSelected('mongodb'))('MongoDB store', () => {
  const dbName = `verifier-plus-test-${randomUUID().slice(0, 8)}`;
  const stores: MongoCredentialStore[] = [];
  let admin: MongoClient | undefined;
  let collections = 0;

  /** A store on a collection of its own, closed after the test. */
  function makeStore(overrides: Partial<MongoCredentialStoreConfig> = {}) {
    const store = MongoCredentialStore({
      uri,
      host: mongoHostForLogs(uri),
      dbName,
      collection: newCollection(),
      ttlDays: 365,
      log: () => {},
      ...overrides,
    });
    stores.push(store);
    return store;
  }

  function newCollection() {
    collections += 1;
    return `credentials_${collections}`;
  }

  function adminCollection(name: string) {
    return admin!.db(dbName).collection(name);
  }

  beforeAll(async () => {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    try {
      await client.connect();
      await client.db(dbName).command({ ping: 1 });
    } catch (error) {
      await client.close();
      throw new Error(
        `TEST_STORES names mongodb, but MongoDB at ${mongoHostForLogs(uri)} is unreachable. ` +
          `Start it with: docker compose -f docker-compose.test.yml up -d mongo`,
        { cause: error },
      );
    }
    admin = client;
  });

  afterEach(async () => {
    await Promise.all(stores.splice(0).map((store) => store.close()));
  });

  afterAll(async () => {
    await admin?.db(dbName).dropDatabase();
    await admin?.close();
  });

  describeCredentialStore('mongodb', () => makeStore());

  it('creates a unique index on id on first use', async () => {
    const collection = newCollection();
    const store = makeStore({ collection });
    await store.put(testRecord());

    const indexes = await adminCollection(collection).indexes();
    expect(indexes).toContainEqual(expect.objectContaining({ key: { id: 1 }, unique: true }));
  });

  it('creates a TTL index on expiresAt that deletes at the stored date', async () => {
    const collection = newCollection();
    await makeStore({ collection }).ping();

    const indexes = await adminCollection(collection).indexes();
    expect(indexes).toContainEqual(expect.objectContaining({ key: { expiresAt: 1 }, expireAfterSeconds: 0 }));
  });

  it('stores createdAt and expiresAt as dates and vp as a document, without changing the record', async () => {
    const collection = newCollection();
    const record = testRecord();
    await makeStore({ collection }).put(record);

    const doc = await adminCollection(collection).findOne({ id: record.id });
    expect(doc?.createdAt).toBeInstanceOf(Date);
    expect(doc?.expiresAt).toBeInstanceOf(Date);
    expect(doc?.vp).toEqual(record.vp);
    expect(record).not.toHaveProperty('_id');
  });

  it('reads a 2.x document, which has no expiresAt, as expiring createdAt plus the TTL', async () => {
    const collection = newCollection();
    const { expiresAt: _, ...legacy } = testRecord();
    await adminCollection(collection).insertOne({ ...legacy });

    const got = await makeStore({ collection, ttlDays: 30 }).get(legacy.id);
    expect(got).toEqual({ ...legacy, expiresAt: new Date(legacy.createdAt.getTime() + 30 * DAY_MS) });
  });

  it('works on a collection that already has a TTL index on createdAt', async () => {
    const collection = newCollection();
    await adminCollection(collection).createIndex({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
    const store = makeStore({ collection });
    const record = testRecord({ createdAt: new Date(), expiresAt: new Date(Date.now() + DAY_MS) });

    await expect(store.ping()).resolves.toBeUndefined();
    await store.put(record);
    expect(await store.get(record.id)).toEqual(record);
  });

  it('names the index in ping and put when an index cannot be created', async () => {
    const collection = newCollection();
    await adminCollection(collection).createIndex({ id: 1 }); // same key, not unique: a conflict
    const store = makeStore({ collection });

    await expect(store.ping()).rejects.toThrow(/index \{ id: 1 \} unique on collection credentials_\d+/);
    await expect(store.put(testRecord())).rejects.toThrow(/index \{ id: 1 \} unique/);
  });

  it('logs the host it connected to', async () => {
    const log = vi.fn();
    await makeStore({ log }).ping();
    expect(log).toHaveBeenCalledWith(`Connected to MongoDB at ${mongoHostForLogs(uri)}`);
  });
});
