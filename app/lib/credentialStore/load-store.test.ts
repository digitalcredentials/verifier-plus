import { describe, expect, it } from 'vitest';

import { readSettings } from '@/lib/settings';

import { loadCredentialStore } from './load-store';

/** Creating a store must not connect, so none of these needs a database. */
describe('loadCredentialStore', () => {
  it.each([
    ['memory', {}],
    ['mongodb', { DB_URI: 'mongodb://localhost:1' }],
    ['dynamodb', { CREDENTIAL_TABLE: 'credentials', AWS_REGION: 'us-east-1' }],
  ])('creates the %s store without connecting', async (name, env) => {
    const settings = readSettings({ CREDENTIAL_STORE: name, ...env });
    expect(settings.problems).toEqual([]);

    const { credentialStore, problems } = await loadCredentialStore(settings.values);
    expect(problems).toEqual([]);
    expect(credentialStore).toMatchObject({ put: expect.any(Function), ping: expect.any(Function) });
    await (credentialStore as { close?: () => Promise<void> }).close?.();
  });

  it.each(['mongodb', 'dynamodb'])('returns no %s store, and no extra problem, when its settings are missing', async (name) => {
    const settings = readSettings({ CREDENTIAL_STORE: name });
    expect(await loadCredentialStore(settings.values)).toEqual({ credentialStore: null, problems: [] });
  });

  it('returns no store when CREDENTIAL_STORE is unset', async () => {
    expect(await loadCredentialStore(readSettings({}).values)).toEqual({ credentialStore: null, problems: [] });
  });
});
