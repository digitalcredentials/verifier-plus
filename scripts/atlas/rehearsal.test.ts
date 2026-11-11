/**
 * The rehearsal, end to end on local containers: synthetic into MongoDB, copy
 * into a DynamoDB Local table, read back through the app's credential service,
 * then copy again. Runs when TEST_STORES names both mongodb and dynamodb.
 */
import { randomUUID } from 'node:crypto';

import { CreateTableCommand, DeleteTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { MongoClient } from 'mongodb';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { runInContext } from '@/lib/context/context-store';
import { createTestAppContext, FixedClock } from '@/lib/context/testing';
import { getSharedCredential } from '@/lib/credentials';
import { DynamoCredentialStore } from '@/lib/credentialStore/dynamodb-store';
import { testStoreSelected } from '@/lib/credentialStore/test-stores';

import type { Env } from './common';
import { copy, type CopyReport, REGION } from './copy';
import { synthetic, type SyntheticSet } from './synthetic';

const mongoUri = process.env.TEST_MONGO_URI ?? 'mongodb://localhost:27017';
const endpoint = process.env.DYNAMODB_ENDPOINT ?? 'http://localhost:8000';
const credentials = { accessKeyId: 'test', secretAccessKey: 'test' };

describe.runIf(testStoreSelected('mongodb') && testStoreSelected('dynamodb'))('synthetic, then copy to DynamoDB Local', () => {
  const db = `verifier-plus-rehearsal-${randomUUID().slice(0, 8)}`;
  const table = `verifier-plus-rehearsal-${randomUUID().slice(0, 8)}`;
  const env: Env = { SOURCE_URI: mongoUri, SOURCE_DB: db, DYNAMODB_ENDPOINT: endpoint };
  const admin = new DynamoDBClient({ endpoint, region: REGION, credentials, maxAttempts: 1 });
  const mongo = new MongoClient(mongoUri);
  const output: string[] = [];
  const out = (line = '') => output.push(line);
  let tableCreated = false;

  let made: SyntheticSet;
  let first: CopyReport;

  beforeAll(async () => {
    await admin.send(
      new CreateTableCommand({
        TableName: table,
        KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
        AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
        BillingMode: 'PAY_PER_REQUEST',
      }),
    );
    tableCreated = true;
    made = await synthetic(['--count', '30'], env, out);
    first = await copy(['--table', table, '--expect-account', 'local', '--write'], env, out);
  });

  afterAll(async () => {
    if (tableCreated) await admin.send(new DeleteTableCommand({ TableName: table }));
    admin.destroy();
    await mongo.db(db).dropDatabase();
    await mongo.close();
  });

  it('makes the TTL index on createdAt, as Atlas has', async () => {
    const indexes = await mongo.db(db).collection('credentials').listIndexes().toArray();
    expect(indexes).toContainEqual(expect.objectContaining({ key: { createdAt: 1 }, expireAfterSeconds: 365 * 24 * 60 * 60 }));
  });

  it('copies what the generator says it should', () => {
    const { counts, exitCode } = first;
    const { expected } = made;
    expect(exitCode).toBe(0);
    expect(counts).toMatchObject({
      written: expected.written,
      alreadyPresent: 0,
      skipped: {
        unshared: expected.unshared,
        tooLarge: expected.tooLarge,
        malformed: expected.malformed,
        expired: counts.skipped.expired,
      },
      errors: {},
    });
    // MongoDB's TTL monitor may already have deleted some of the expired documents.
    expect(counts.skipped.expired).toBeLessThanOrEqual(expected.expiredAtMost);
    expect(counts.read).toBe(expected.written + expected.unshared + expected.tooLarge + expected.malformed + counts.skipped.expired);
  });

  it('writes records the app reads back unchanged through its credential service', async () => {
    const store = DynamoCredentialStore({ table, region: REGION, endpoint, credentials });
    const ctx = createTestAppContext({ credentialStore: store, clock: FixedClock(new Date()) });
    const read = (id: string) => runInContext(ctx, () => getSharedCredential(id));
    const of = (kind: string) => made.documents.filter((d) => d.kind === kind).map(({ doc }) => doc);
    try {
      for (const doc of [...of('image'), ...of('expiresSoon')]) {
        const credential = await read(doc.id);
        expect(credential).toMatchObject({ id: doc.id, controller: doc.controller, createdAt: doc.createdAt, shared: true });
        expect(JSON.stringify(credential.vp)).toBe(JSON.stringify(doc.vp));
      }
      for (const doc of [...of('unshared'), ...of('tooLarge'), ...of('malformed'), ...of('expired')]) {
        await expect(read(doc.id)).rejects.toMatchObject({ code: 'credential-not-found' });
      }
    } finally {
      await store.close();
    }
  });

  it('never writes to the source', async () => {
    const source = mongo.db(db).collection('credentials');
    expect(await source.countDocuments({ expiresAt: { $exists: true } })).toBe(0);
    expect(await source.countDocuments({ id: { $in: made.documents.map(({ doc }) => doc.id) } })).toBeGreaterThanOrEqual(
      made.documents.length - made.expected.expiredAtMost,
    );
  });

  it('counts everything as already present on a second run', async () => {
    const second = await copy(['--table', table, '--expect-account', 'local', '--write'], env, out);
    expect(second.exitCode).toBe(0);
    expect(second.counts).toMatchObject({ written: 0, alreadyPresent: made.expected.written, errors: {} });
  });

  it('writes nothing on a dry run', async () => {
    const dry = await copy(['--table', table, '--expect-account', 'local'], env, out);
    expect(dry.counts).toMatchObject({ selected: made.expected.written, written: 0, alreadyPresent: 0 });
  });

  it('prints no id, holder DID or presentation content', () => {
    const text = output.join('\n');
    for (const { doc } of made.documents) {
      expect(text).not.toContain(doc.id);
      expect(text).not.toContain(doc.controller);
    }
    expect(text).not.toContain('Teamwork Badge');
    expect(text).not.toContain('A Simply Wonderful Course');
  });
});
