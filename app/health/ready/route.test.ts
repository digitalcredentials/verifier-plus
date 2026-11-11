import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAppContext } from '@/lib/context/app-context';
import { runInContext } from '@/lib/context/context-store';
import { createTestAppContext } from '@/lib/context/testing';
import { MemoryCredentialStore } from '@/lib/credentialStore/memory-store';

import { GET } from './route';

describe('GET /health/ready', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('is UP with the memory store', async () => {
    const res = await runInContext(createTestAppContext(), () => GET());

    expect(res.status).toBe(200);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect(await res.json()).toEqual({
      status: 'UP',
      problems: [],
      components: { credentialStore: { status: 'UP', durationMs: expect.any(Number) } },
    });
  });

  it('is DOWN naming CREDENTIAL_STORE when it is unset', async () => {
    const res = await runInContext(await createAppContext({}), () => GET());

    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({
      status: 'DOWN',
      problems: ['CREDENTIAL_STORE is not set; set it to memory, mongodb or dynamodb'],
      components: { credentialStore: { status: 'DOWN', durationMs: 0, error: 'not configured' } },
    });
  });

  it('is DOWN naming the missing settings of the chosen store', async () => {
    const res = await runInContext(await createAppContext({ CREDENTIAL_STORE: 'dynamodb' }), () => GET());

    expect(res.status).toBe(503);
    expect((await res.json()).problems).toEqual([
      'CREDENTIAL_STORE is dynamodb, so set CREDENTIAL_TABLE',
      'CREDENTIAL_STORE is dynamodb, so set AWS_REGION',
    ]);
  });

  it('is DOWN when ping fails', async () => {
    const credentialStore = MemoryCredentialStore();
    vi.spyOn(credentialStore, 'ping').mockRejectedValue(new Error('connection refused'));

    const res = await runInContext(createTestAppContext({ credentialStore }), () => GET());

    expect(res.status).toBe(503);
    expect((await res.json()).components.credentialStore).toMatchObject({ status: 'DOWN', error: 'connection refused' });
  });

  it('is DOWN when ping takes longer than 2 seconds', async () => {
    vi.useFakeTimers();
    const credentialStore = MemoryCredentialStore();
    vi.spyOn(credentialStore, 'ping').mockReturnValue(new Promise(() => {}));

    const pending = runInContext(createTestAppContext({ credentialStore }), () => GET());
    await vi.advanceTimersByTimeAsync(2000);
    const res = await pending;

    expect(res.status).toBe(503);
    expect((await res.json()).components.credentialStore).toEqual({
      status: 'DOWN',
      durationMs: 2000,
      error: 'timeout after 2000 ms',
    });
  });

  it('is DOWN when any setting has a problem, even with a working store', async () => {
    const res = await runInContext(
      await createAppContext({ CREDENTIAL_STORE: 'memory', CREDENTIAL_TTL_DAYS: 'forever' }),
      () => GET(),
    );

    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({
      status: 'DOWN',
      problems: ["CREDENTIAL_TTL_DAYS must be a positive whole number of days; it is 'forever'"],
      components: { credentialStore: { status: 'UP' } },
    });
  });
});
