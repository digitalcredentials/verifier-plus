import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAppContext } from '@/lib/context/app-context';
import { runInContext } from '@/lib/context/context-store';
import { createTestAppContext } from '@/lib/context/testing';
import { getTestVP } from '@/tests/fixtures/testVP';

import { DELETE, GET } from './[publicCredentialId]/route';
import { POST } from './route';

const base = 'http://verifier.test';

function post(body: string) {
  return POST(new NextRequest(`${base}/api/credentials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  }));
}

function get(id: string) {
  return GET(new NextRequest(`${base}/api/credentials/${id}`), { params: Promise.resolve({ publicCredentialId: id }) });
}

function del(id: string) {
  return DELETE(new NextRequest(`${base}/api/credentials/${id}`, { method: 'DELETE' }), {
    params: Promise.resolve({ publicCredentialId: id }),
  });
}

describe('the credential routes', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('share, view and unshare', async () => {
    await runInContext(createTestAppContext(), async () => {
      const testVP = getTestVP();

      const shared = await post(JSON.stringify(testVP));
      expect(shared.status).toBe(201);
      const body = await shared.json();
      expect(body).toEqual({
        status: 'Credential added',
        url: { view: expect.stringMatching(/^\/credentials\//), get: expect.any(String), unshare: expect.any(String) },
      });
      expect(shared.headers.get('Location')).toBe(body.url.view);
      const id = body.url.get.split('/').pop();

      const viewed = await get(id);
      expect(viewed.status).toBe(200);
      expect(await viewed.json()).toEqual({
        id,
        controller: testVP.vp.holder,
        createdAt: '2026-01-01T00:00:00.000Z',
        vp: testVP.vp,
        shared: true,
        credential: [testVP.vp.verifiableCredential],
      });

      const unshared = await del(id);
      expect(unshared.status).toBe(200);
      expect(await unshared.json()).toEqual({ message: 'Credential unshared.' });

      const gone = await get(id);
      expect(gone.status).toBe(404);
      expect(await gone.json()).toEqual({
        status: 'Not found',
        error: 'Public share of this credential expired, unshared, or not found.',
      });
    });
  });

  it('answers 400 to a body that is not JSON', async () => {
    await runInContext(createTestAppContext(), async () => {
      const res = await post('not json');
      expect(res.status).toBe(400);
      expect(await res.json()).toMatchObject({ status: 'Invalid request' });
    });
  });

  it('answers 404 to unsharing an unknown id', async () => {
    await runInContext(createTestAppContext(), async () => {
      const res = await del(crypto.randomUUID());
      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({
        status: 'Not found',
        error: 'This credential does not exist, has expired, or has already been unshared.',
      });
    });
  });

  it('answers 503 naming the setting when no store is configured', async () => {
    await runInContext(await createAppContext({}), async () => {
      const res = await post(JSON.stringify(getTestVP()));
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({
        status: 'Service unavailable',
        error: 'No credential store configured: CREDENTIAL_STORE is not set; set it to memory, mongodb or dynamodb',
      });
    });
  });
});
