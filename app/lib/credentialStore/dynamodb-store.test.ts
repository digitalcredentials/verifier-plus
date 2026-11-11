import { randomUUID } from 'node:crypto';

import { CreateTableCommand, DeleteTableCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { VerifiablePresentation } from '@/types/presentation';

import { describeCredentialStore, testRecord } from './contract';
import { DynamoCredentialStore, type DynamoCredentialStoreConfig } from './dynamodb-store';
import { testStoreSelected } from './test-stores';

const endpoint = process.env.DYNAMODB_ENDPOINT ?? 'http://localhost:8000';
// DynamoDB Local accepts any region and credentials.
const region = 'us-east-1';
const credentials = { accessKeyId: 'test', secretAccessKey: 'test' };

describe.runIf(testStoreSelected('dynamodb'))('DynamoDB store', () => {
  const table = `verifier-plus-test-${randomUUID().slice(0, 8)}`;
  const stores: DynamoCredentialStore[] = [];
  const admin = new DynamoDBClient({ endpoint, region, credentials, maxAttempts: 1 });
  const documents = DynamoDBDocumentClient.from(admin);
  let created = false;

  function makeStore(overrides: Partial<DynamoCredentialStoreConfig> = {}) {
    const store = DynamoCredentialStore({ table, region, endpoint, credentials, ...overrides });
    stores.push(store);
    return store;
  }

  async function rawItem(id: string) {
    return (await documents.send(new GetCommand({ TableName: table, Key: { id }, ConsistentRead: true }))).Item;
  }

  beforeAll(async () => {
    try {
      await admin.send(
        new CreateTableCommand({
          TableName: table,
          KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
          AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
          BillingMode: 'PAY_PER_REQUEST',
        }),
      );
    } catch (error) {
      throw new Error(
        `TEST_STORES names dynamodb, but DynamoDB Local at ${endpoint} is unreachable or refused the test table. ` +
          `Start it with: docker compose -f docker-compose.test.yml up -d dynamodb`,
        { cause: error },
      );
    }
    created = true;
  });

  afterEach(async () => {
    await Promise.all(stores.splice(0).map((store) => store.close()));
  });

  afterAll(async () => {
    if (created) await admin.send(new DeleteTableCommand({ TableName: table }));
    admin.destroy();
  });

  describeCredentialStore('dynamodb', () => makeStore());

  it('stores expiresAt as epoch seconds for the table TTL, and createdAt as ISO 8601', async () => {
    const record = testRecord();
    await makeStore().put(record);

    const item = await rawItem(record.id);
    expect(item).toMatchObject({
      expiresAt: record.expiresAt.getTime() / 1000,
      createdAt: '2026-01-01T00:00:00.000Z',
      shared: true,
    });
    expect(typeof item?.expiresAt).toBe('number');
  });

  it('rounds expiresAt down to the whole second', async () => {
    const record = testRecord({ expiresAt: new Date('2027-01-01T00:00:00.999Z') });
    const store = makeStore();
    await store.put(record);

    expect((await store.get(record.id))?.expiresAt).toEqual(new Date('2027-01-01T00:00:00.000Z'));
  });

  it('keeps vp byte-identical, including values DynamoDB would otherwise change', async () => {
    const vp = {
      ...testRecord().vp,
      emptyString: '',
      emptyList: [],
      emptyObject: {},
      fraction: 0.1 + 0.2,
      large: 2 ** 60,
    } as VerifiablePresentation;
    const record = testRecord({ vp });
    const store = makeStore();
    await store.put(record);

    expect((await rawItem(record.id))?.vp).toBe(JSON.stringify(vp));
    expect(JSON.stringify((await store.get(record.id))?.vp)).toBe(JSON.stringify(vp));
  });

  it('maps an item over 400 KB to credential-too-large', async () => {
    const vp = { ...testRecord().vp, padding: 'x'.repeat(401 * 1024) } as VerifiablePresentation;
    await expect(makeStore().put(testRecord({ vp }))).rejects.toMatchObject({ code: 'credential-too-large' });
  });

  it('fails ping when the table does not exist', async () => {
    await expect(makeStore({ table: `${table}-missing` }).ping()).rejects.toThrow();
  });
});
