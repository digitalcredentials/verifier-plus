import { test, expect, type APIRequestContext } from "@playwright/test";
import { getTestVP } from "@/tests/fixtures/testVP";

/**
 * The Lambda group: what a deployment on AWS Lambda must get right that a
 * single long-running server gets right for free. Runs against any server
 * (`--project=Lambda`); no browser. On Lambda, requests in parallel reach more
 * than one sandbox, so every read must find what another sandbox wrote.
 */

const MAX_BODY_BYTES = 5 * 1024 * 1024;
const MAX_SHARED_VP_BYTES = 350 * 1024;

/** Shares the test VP, reads it straight back, then unshares it. */
async function roundTrip(request: APIRequestContext) {
  const testVP = getTestVP();
  const postReply = await request.post('/api/credentials/', { data: testVP });
  expect(postReply.status()).toBe(201);
  const { url } = await postReply.json();

  const getReply = await request.get(url.get);
  expect(getReply.status(), `GET ${url.get}`).toBe(200);
  expect((await getReply.json()).vp).toEqual(testVP.vp);

  const deleteReply = await request.delete(url.unshare);
  expect(deleteReply.ok()).toBeTruthy();
}

test('GET /health/ready is 200', async ({ request }) => {
  const reply = await request.get('/health/ready');
  expect(reply.status(), JSON.stringify(await reply.json())).toBe(200);
});

test('20 share-then-read round trips, 10 of them in parallel, all read back', async ({ request }) => {
  for (let i = 0; i < 10; i++) {
    await roundTrip(request);
  }
  await Promise.all(Array.from({ length: 10 }, () => roundTrip(request)));
});

test('a read after unshare is 404', async ({ request }) => {
  const postReply = await request.post('/api/credentials/', { data: getTestVP() });
  expect(postReply.status()).toBe(201);
  const { url } = await postReply.json();

  const deleteReply = await request.delete(url.unshare);
  expect(deleteReply.ok()).toBeTruthy();

  const getReply = await request.get(url.get);
  expect(getReply.status()).toBe(404);
});

test('a body over 5 MB to /api/verify is 413', async ({ request }) => {
  const body = JSON.stringify({ padding: 'x'.repeat(MAX_BODY_BYTES) });
  const reply = await request.post('/api/verify', { data: body });
  expect(reply.status()).toBe(413);
});

test('sharing a credential just over 350 KB is 413, too large', async ({ request }) => {
  const testVP = getTestVP();
  const size = Buffer.byteLength(JSON.stringify(testVP.vp), 'utf8');
  testVP.vp.padding = 'x'.repeat(MAX_SHARED_VP_BYTES - size);
  expect(Buffer.byteLength(JSON.stringify(testVP.vp), 'utf8')).toBeGreaterThan(MAX_SHARED_VP_BYTES);

  const reply = await request.post('/api/credentials/', { data: testVP });
  expect(reply.status()).toBe(413);
  expect((await reply.json()).error).toMatch(/too large/i);
});
