import { describe, expect, it, vi } from 'vitest';

import { getTestVP } from '@/tests/fixtures/testVP';

import { createAppContext } from './context/app-context';
import { runInContext } from './context/context-store';
import { createTestAppContext, FixedClock } from './context/testing';
import { MemoryCredentialStore } from './credentialStore/memory-store';
import { getSharedCredential, MAX_SHARED_VP_BYTES, shareCredential, unshareCredential } from './credentials';
import { readSettings } from './settings';

const DAY_MS = 24 * 60 * 60 * 1000;

function idFrom(result: { url: { get: string } }) {
  return result.url.get.split('/').pop()!;
}

describe('the credential service', () => {
  it('shares a credential that expires 365 days later by default', async () => {
    const clock = FixedClock('2026-03-01T12:00:00.000Z');
    const ctx = createTestAppContext({ clock });

    await runInContext(ctx, async () => {
      const shared = await shareCredential(getTestVP());
      const record = await ctx.credentialStore!.get(idFrom(shared));

      expect(record).toMatchObject({
        controller: 'did:key:blahblahblah',
        createdAt: new Date('2026-03-01T12:00:00.000Z'),
        expiresAt: new Date('2027-03-01T12:00:00.000Z'),
        shared: true,
      });
      expect(shared.url).toEqual({
        view: `/credentials/${record!.id}`,
        get: `/api/credentials/${record!.id}`,
        unshare: `/api/credentials/${record!.id}`,
      });
    });
  });

  it('takes the expiry from CREDENTIAL_TTL_DAYS', async () => {
    const ctx = createTestAppContext({
      settings: readSettings({ EXCHANGES: 'off', CREDENTIAL_STORE: 'memory', CREDENTIAL_TTL_DAYS: '30' }),
    });

    await runInContext(ctx, async () => {
      const record = await ctx.credentialStore!.get(idFrom(await shareCredential(getTestVP())));
      expect(record!.expiresAt.getTime() - record!.createdAt.getTime()).toBe(30 * DAY_MS);
    });
  });

  it('shows a credential until the moment it expires', async () => {
    const clock = FixedClock();
    const ctx = createTestAppContext({ clock });

    await runInContext(ctx, async () => {
      const id = idFrom(await shareCredential(getTestVP()));

      clock.advance(365 * DAY_MS - 1);
      await expect(getSharedCredential(id)).resolves.toMatchObject({ id });

      clock.advance(1);
      await expect(getSharedCredential(id)).rejects.toMatchObject({
        statusCode: 404,
        message: 'Public share of this credential expired, unshared, or not found.',
      });
    });
  });

  it('returns the record without any store-internal fields', async () => {
    await runInContext(createTestAppContext(), async () => {
      const vp = getTestVP().vp;
      const id = idFrom(await shareCredential({ vp }));

      const result = await getSharedCredential(id);

      expect(Object.keys(result).sort()).toEqual(['controller', 'createdAt', 'credential', 'id', 'shared', 'vp']);
      expect(result.vp).toEqual(vp);
      expect(result.credential).toEqual([vp.verifiableCredential]);
    });
  });

  it('shares a presentation of exactly 350 KB and refuses one byte more', async () => {
    const credentialStore = MemoryCredentialStore();
    const put = vi.spyOn(credentialStore, 'put');

    await runInContext(createTestAppContext({ credentialStore }), async () => {
      await expect(shareCredential({ vp: vpOfSize(MAX_SHARED_VP_BYTES) })).resolves.toBeDefined();
      expect(put).toHaveBeenCalledTimes(1);

      await expect(shareCredential({ vp: vpOfSize(MAX_SHARED_VP_BYTES + 1) })).rejects.toMatchObject({
        code: 'credential-too-large',
        statusCode: 413,
        message: 'Credential too large to share (limit 350 KB)',
      });
      expect(put).toHaveBeenCalledTimes(1);
    });
  });

  it.each([
    ['no holder', { vp: { ...getTestVP().vp, holder: undefined } }],
    ['no presentation', {}],
    ['no body', null],
  ])('refuses a share with %s', async (_, payload) => {
    await runInContext(createTestAppContext(), async () => {
      await expect(shareCredential(payload)).rejects.toMatchObject({
        statusCode: 400,
        message: "Missing 'holder' property. DID Authentication is required.",
      });
    });
  });

  it('unshares, after which the credential is not found', async () => {
    await runInContext(createTestAppContext(), async () => {
      const id = idFrom(await shareCredential(getTestVP()));

      await unshareCredential(id);

      await expect(getSharedCredential(id)).rejects.toMatchObject({ statusCode: 404 });
      await expect(unshareCredential(id)).resolves.toBeUndefined();
    });
  });

  it('answers 404 when unsharing an unknown id', async () => {
    await runInContext(createTestAppContext(), async () => {
      await expect(unshareCredential(crypto.randomUUID())).rejects.toMatchObject({
        statusCode: 404,
        message: 'This credential does not exist, has expired, or has already been unshared.',
      });
    });
  });

  it('answers 503 naming the setting when no store is configured', async () => {
    const ctx = await createAppContext({ EXCHANGES: 'off' });

    await runInContext(ctx, async () => {
      for (const attempt of [() => shareCredential(getTestVP()), () => getSharedCredential('any'), () => unshareCredential('any')]) {
        await expect(attempt()).rejects.toMatchObject({
          code: 'store-not-configured',
          statusCode: 503,
          message: 'No credential store configured: CREDENTIAL_STORE is not set; set it to memory, mongodb or dynamodb',
        });
      }
    });
  });

  it('answers 503 when the store fails', async () => {
    const credentialStore = MemoryCredentialStore();
    vi.spyOn(credentialStore, 'get').mockRejectedValue(new Error('connection refused'));

    await runInContext(createTestAppContext({ credentialStore }), async () => {
      await expect(getSharedCredential('any')).rejects.toMatchObject({
        code: 'store-unavailable',
        statusCode: 503,
      });
    });
  });
});

/** The test presentation, padded so its JSON is exactly `bytes` long. */
function vpOfSize(bytes: number) {
  const vp = { ...getTestVP().vp, padding: '' };
  vp.padding = 'x'.repeat(bytes - Buffer.byteLength(JSON.stringify(vp), 'utf8'));
  expect(Buffer.byteLength(JSON.stringify(vp), 'utf8')).toBe(bytes);
  return vp;
}
