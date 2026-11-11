import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppContext } from './app-context';

describe('createAppContext', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has no exchanges when EXCHANGES is off', async () => {
    expect((await createAppContext({ CREDENTIAL_STORE: 'memory', EXCHANGES: 'off' })).exchanges).toBeNull();
  });

  it('has no exchanges when EXCHANGES is unset', async () => {
    expect((await createAppContext({ CREDENTIAL_STORE: 'memory' })).exchanges).toBeNull();
  });

  it('has an exchange cache when EXCHANGES is on', async () => {
    const { exchanges } = await createAppContext({ CREDENTIAL_STORE: 'memory', EXCHANGES: 'on' });
    exchanges!.set('tx', '{"a":1}');
    expect(exchanges!.get('tx')).toBe('{"a":1}');
  });

  it('has no exchanges when EXCHANGES=on is refused on Lambda', async () => {
    const ctx = await createAppContext({
      CREDENTIAL_STORE: 'memory',
      EXCHANGES: 'on',
      AWS_LAMBDA_FUNCTION_NAME: 'verifier-plus',
    });
    expect(ctx.exchanges).toBeNull();
    expect(ctx.settings.problems).toEqual([expect.stringMatching(/^EXCHANGES=on is not supported on Lambda/)]);
  });

  it('warns once, without a problem, when NEXT_PUBLIC_EXCHANGE_SERVER_URL is still set', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const ctx = await createAppContext({
      CREDENTIAL_STORE: 'memory',
      EXCHANGES: 'off',
      NEXT_PUBLIC_EXCHANGE_SERVER_URL: 'https://verifierplus.org',
    });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith('NEXT_PUBLIC_EXCHANGE_SERVER_URL is no longer read; use EXCHANGE_SERVER_URL');
    expect(ctx.settings.problems).toEqual([]);
  });
});
