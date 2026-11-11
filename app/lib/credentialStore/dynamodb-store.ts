import { DynamoDBClient, type DynamoDBClientConfig } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import type { DynamoSettings } from '@/lib/settings';

import {
  CredentialAlreadyExists,
  CredentialError,
  CredentialNotFound,
  type CredentialRecord,
  type CredentialStore,
} from './credential-store';

export type DynamoCredentialStoreConfig = DynamoSettings & {
  /** Only for tests against DynamoDB Local; otherwise the SDK finds them (on Lambda, the function's role). */
  credentials?: DynamoDBClientConfig['credentials'];
};

/**
 * An item in the table. vp is kept as its JSON text so DynamoDB's rules for
 * numbers and empty values cannot change a signed document. expiresAt is the
 * table's TTL attribute, so it is epoch seconds.
 */
type CredentialItem = {
  id: string;
  controller: string;
  createdAt: string;
  expiresAt: number;
  vp: string;
  shared: boolean;
};

/** An id no credential can have (credential ids are v4 UUIDs). */
const PING_ID = '__ping__';

/**
 * Keeps credentials in a DynamoDB table keyed by id, for Lambda.
 *
 * Needs only GetItem, PutItem and UpdateItem on the one table. Reads are
 * strongly consistent, so a reader always sees its own write. Unshared items
 * stay until the table's TTL removes them, as in the MongoDB store.
 */
export function DynamoCredentialStore(config: DynamoCredentialStoreConfig) {
  const client = new DynamoDBClient({
    region: config.region,
    endpoint: config.endpoint,
    credentials: config.credentials,
  });
  const documents = DynamoDBDocumentClient.from(client);
  const TableName = config.table;

  return {
    async put(record: CredentialRecord) {
      try {
        await documents.send(
          new PutCommand({
            TableName,
            Item: toItem(record),
            ConditionExpression: 'attribute_not_exists(#id)',
            ExpressionAttributeNames: { '#id': 'id' },
          }),
        );
      } catch (error) {
        if (errorName(error) === 'ConditionalCheckFailedException') throw CredentialAlreadyExists(record.id);
        // The service's 350 KB limit should stop this before DynamoDB's 400 KB one.
        if (errorName(error) === 'ValidationException' && /item size/i.test(String((error as Error).message))) {
          throw CredentialError('credential-too-large', 'Credential too large to store.', error);
        }
        throw error;
      }
    },

    async get(id: string) {
      const { Item } = await documents.send(new GetCommand({ TableName, Key: { id }, ConsistentRead: true }));
      const item = Item as CredentialItem | undefined;
      return item?.shared === true ? fromItem(item) : null;
    },

    async unshare(id: string) {
      try {
        await documents.send(
          new UpdateCommand({
            TableName,
            Key: { id },
            UpdateExpression: 'SET #shared = :false',
            ConditionExpression: 'attribute_exists(#id)',
            ExpressionAttributeNames: { '#id': 'id', '#shared': 'shared' },
            ExpressionAttributeValues: { ':false': false },
          }),
        );
      } catch (error) {
        if (errorName(error) === 'ConditionalCheckFailedException') throw CredentialNotFound(id);
        throw error;
      }
    },

    /** A consistent GetItem on an id that never exists: proves the table is reachable without DescribeTable. */
    async ping() {
      await documents.send(new GetCommand({ TableName, Key: { id: PING_ID }, ConsistentRead: true }));
    },

    async close() {
      client.destroy();
    },
  } satisfies CredentialStore & { close(): Promise<void> };
}

export type DynamoCredentialStore = ReturnType<typeof DynamoCredentialStore>;

function toItem(record: CredentialRecord): CredentialItem {
  return {
    id: record.id,
    controller: record.controller,
    createdAt: record.createdAt.toISOString(),
    // Whole seconds, rounded down: TTL needs epoch seconds, and an expiry is never moved later.
    expiresAt: Math.floor(record.expiresAt.getTime() / 1000),
    vp: JSON.stringify(record.vp),
    shared: record.shared,
  };
}

function fromItem(item: CredentialItem): CredentialRecord {
  return {
    id: item.id,
    controller: item.controller,
    createdAt: new Date(item.createdAt),
    expiresAt: new Date(item.expiresAt * 1000),
    vp: JSON.parse(item.vp),
    shared: item.shared,
  };
}

function errorName(error: unknown): string | undefined {
  return error instanceof Error ? error.name : undefined;
}
