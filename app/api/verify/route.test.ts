import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runInContext } from '@/lib/context/context-store';
import { createTestAppContext } from '@/lib/context/testing';
import { verifyCredential } from '@/lib/validate';

import { POST } from './route';

vi.mock('@/lib/validate', () => ({ verifyCredential: vi.fn() }));

const url = 'http://verifier.test/api/verify';
const SIX_MB = 6 * 1024 * 1024;

describe('POST /api/verify', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.mocked(verifyCredential).mockReset();
  });

  it('verifies with the context fetch and answers the result', async () => {
    const ctx = createTestAppContext();
    vi.mocked(verifyCredential).mockResolvedValue({ verified: true, results: [] });

    const res = await runInContext(ctx, () => POST(new NextRequest(url, { method: 'POST', body: '{"id":"urn:x"}' })));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ result: { verified: true, results: [] } });
    expect(verifyCredential).toHaveBeenCalledWith({ id: 'urn:x' }, { fetch: ctx.fetch });
  });

  it('answers 504 when the verification takes longer than 20 seconds', async () => {
    vi.useFakeTimers();
    vi.mocked(verifyCredential).mockReturnValue(new Promise(() => {}));

    let settled = false;
    const pending = runInContext(createTestAppContext(), () =>
      POST(new NextRequest(url, { method: 'POST', body: '{"id":"urn:x"}' })),
    ).finally(() => { settled = true; });
    await vi.advanceTimersByTimeAsync(19_999);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    const res = await pending;

    expect(res.status).toBe(504);
    expect(await res.json()).toEqual({ error: 'Verification timed out after 20 seconds' });
  });

  it('answers 413 to a Content-Length over 5 MB, without verifying', async () => {
    const res = await runInContext(createTestAppContext(), () =>
      POST(new NextRequest(url, { method: 'POST', headers: { 'content-length': String(SIX_MB) }, body: '{}' })),
    );

    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: 'Request body too large (limit 5 MB)' });
    expect(verifyCredential).not.toHaveBeenCalled();
  });

  it('answers 413 to a body over 5 MB with no Content-Length', async () => {
    const body = JSON.stringify({ id: 'x'.repeat(SIX_MB) });
    const res = await runInContext(createTestAppContext(), () => POST(new NextRequest(url, { method: 'POST', body })));

    expect(res.status).toBe(413);
    expect(verifyCredential).not.toHaveBeenCalled();
  });

  it('answers 400 to a body that is not JSON', async () => {
    const res = await runInContext(createTestAppContext(), () =>
      POST(new NextRequest(url, { method: 'POST', body: 'not json' })),
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ status: 'Invalid request' });
  });
});
