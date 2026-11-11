import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runInContext } from '@/lib/context/context-store';
import { createTestAppContext, FetchMock, type FetchMockRoutes } from '@/lib/context/testing';

import { POST } from './route';

const proxyUrl = 'http://verifier.test/api/proxy';
const remote = 'https://issuer.example/vc.json';
const SIX_MB = 6 * 1024 * 1024;

function proxy(routes: FetchMockRoutes, init: { body: string; headers?: Record<string, string> }) {
  const fetch = FetchMock(routes);
  const res = runInContext(createTestAppContext({ fetch }), () =>
    POST(new NextRequest(proxyUrl, { method: 'POST', ...init })),
  );
  return { fetch, res };
}

const body = JSON.stringify({ url: remote });

describe('POST /api/proxy', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('answers the remote JSON, fetched through the context fetch', async () => {
    const { fetch, res } = proxy({ [`GET ${remote}`]: () => Response.json({ id: 'urn:vc' }) }, { body });

    expect((await res).status).toBe(200);
    expect(await (await res).json()).toEqual({ id: 'urn:vc' });
    expect(fetch.calls.map((r) => r.url)).toEqual([remote]);
  });

  it('fetches the URL in a vc query parameter', async () => {
    const { fetch, res } = proxy(
      { [`GET ${remote}`]: () => Response.json({ id: 'urn:vc' }) },
      { body: JSON.stringify({ url: `https://verifierplus.org/?vc=${encodeURIComponent(remote)}` }) },
    );

    expect(await (await res).json()).toEqual({ id: 'urn:vc' });
    expect(fetch.calls.map((r) => r.url)).toEqual([remote]);
  });

  it('answers 504 when the remote does not answer within 20 seconds', async () => {
    vi.useFakeTimers();
    const { res } = proxy({ [`GET ${remote}`]: () => new Promise<Response>(() => {}) }, { body });

    await vi.advanceTimersByTimeAsync(20_000);

    expect((await res).status).toBe(504);
    expect(await (await res).json()).toEqual({ error: 'Fetching the URL timed out after 20 seconds' });
  });

  it('answers 413 to a Content-Length over 5 MB, without fetching', async () => {
    const { fetch, res } = proxy({}, { body, headers: { 'content-length': '6000000' } });

    expect((await res).status).toBe(413);
    expect(await (await res).json()).toEqual({ error: 'Request body too large (limit 5 MB)' });
    expect(fetch.calls).toEqual([]);
  });

  it('answers 413 to a body over 5 MB with no Content-Length', async () => {
    const { fetch, res } = proxy({}, { body: JSON.stringify({ url: remote, padding: 'x'.repeat(SIX_MB) }) });

    expect((await res).status).toBe(413);
    expect(fetch.calls).toEqual([]);
  });

  it('answers 502 when the remote document is over 5 MB, with no Content-Length', async () => {
    const big = JSON.stringify({ padding: 'x'.repeat(SIX_MB) });
    const { res } = proxy({ [`GET ${remote}`]: () => new Response(big) }, { body });

    expect((await res).status).toBe(502);
    expect(await (await res).json()).toEqual({ error: 'Remote document too large (limit 5 MB)' });
  });

  it('answers 502 when the remote declares a Content-Length over 5 MB', async () => {
    const { res } = proxy(
      { [`GET ${remote}`]: () => new Response('{}', { headers: { 'content-length': String(SIX_MB) } }) },
      { body },
    );

    expect((await res).status).toBe(502);
  });

  it('passes on the status of a remote that fails', async () => {
    const { res } = proxy({ [`GET ${remote}`]: () => new Response('gone', { status: 404 }) }, { body });

    expect((await res).status).toBe(404);
    expect(await (await res).json()).toEqual({ error: 'Failed to fetch URL' });
  });
});
