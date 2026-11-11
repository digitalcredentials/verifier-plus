import { beforeEach, describe, expect, it } from 'vitest';

import { getTestVP } from '@/tests/fixtures/testVP';

import type { CredentialRecord, CredentialStore } from './credential-store';

/**
 * The guarantees every credential store makes, written once. Each store's
 * test file calls this with a factory for a fresh, empty store.
 */
export function describeCredentialStore(name: string, makeStore: () => CredentialStore | Promise<CredentialStore>) {
  describe(`CredentialStore contract: ${name}`, () => {
    let store: CredentialStore;

    beforeEach(async () => {
      store = await makeStore();
    });

    it('returns an equal record after put', async () => {
      const record = testRecord();
      await store.put(record);
      expect(await store.get(record.id)).toEqual(record);
    });

    it('refuses to put an id that is taken and keeps the first record', async () => {
      const first = testRecord();
      await store.put(first);
      const second = testRecord({ id: first.id, controller: 'did:example:someone-else' });

      await expect(store.put(second)).rejects.toMatchObject({ code: 'credential-already-exists' });
      expect(await store.get(first.id)).toEqual(first);
    });

    it('returns null for an unknown id', async () => {
      expect(await store.get(crypto.randomUUID())).toBeNull();
    });

    it('returns null after unshare, and unsharing twice succeeds', async () => {
      const record = testRecord();
      await store.put(record);

      await store.unshare(record.id);
      expect(await store.get(record.id)).toBeNull();
      await expect(store.unshare(record.id)).resolves.toBeUndefined();
    });

    it('refuses to unshare an unknown id', async () => {
      await expect(store.unshare(crypto.randomUUID())).rejects.toMatchObject({ code: 'credential-not-found' });
    });

    it('does not share objects with its callers', async () => {
      const record = testRecord();
      await store.put(record);
      const stored = structuredClone(record);

      record.controller = 'did:example:changed-after-put';
      const got = await store.get(record.id);
      expect(got).toEqual(stored);
      expect(got).not.toBe(record);

      got!.controller = 'did:example:changed-after-get';
      expect(await store.get(record.id)).toEqual(stored);
    });

    it('answers ping', async () => {
      await expect(store.ping()).resolves.toBeUndefined();
    });
  });
}

function testRecord(overrides: Partial<CredentialRecord> = {}): CredentialRecord {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  return {
    id: crypto.randomUUID(),
    controller: 'did:example:holder',
    createdAt,
    expiresAt: new Date(createdAt.getTime() + 365 * 24 * 60 * 60 * 1000),
    vp: getTestVP().vp,
    shared: true,
    ...overrides,
  };
}
