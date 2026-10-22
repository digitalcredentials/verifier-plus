import { test, expect } from "@playwright/test";
import { getTestVP } from "@/tests/fixtures/testVP";

test('POST /credentials should store posted VP', async ({ request }) => {
  const testVP = getTestVP();
  const postReply = await request.post(`/api/credentials/`, {data: testVP});

  expect(postReply.ok()).toBeTruthy();

  const newRecord = await postReply.json();

  /* new record should look like this (but with a different uuid)
    {
      "status": "Credential added",
      "url": {
          "view": "/credentials/39db5701-2434-42b3-aa0b-088bbd423449",
          "get": "/api/credentials/39db5701-2434-42b3-aa0b-088bbd423449",
          "unshare": "/api/credentials/39db5701-2434-42b3-aa0b-088bbd423449"
      }
    }
  */

  expect(newRecord).toEqual(expect.objectContaining({
    status: 'Credential added',
    url: expect.objectContaining({ 
      view: expect.any(String),
      get: expect.any(String),
      unshare: expect.any(String)}),
  }));

  // after adding it, it should be returned by the get
  const getReply = await request.get(newRecord.url.get)
  expect(getReply.ok()).toBeTruthy();
  const storedVP = (await getReply.json()).vp;
  expect(storedVP).toEqual(testVP.vp);

  // now delete it
  const deleteReply = await request.delete(newRecord.url.unshare)
  expect(deleteReply.ok()).toBeTruthy();

  // and now it should return not available
  // when we try to get it again
  const secondGetReply = await request.get(newRecord.url.get)
  expect(secondGetReply.ok()).not.toBeTruthy();
  expect(secondGetReply.status()).toBe(500)
});
test('POST /short-links should create a short link that opens the credential', async ({ request }) => {
  const credentialUrl = `https://was.lcw-sandbox.org/space/test-space/public/Badges--${Date.now()}`;
  const postReply = await request.post(`/api/short-links`, {data: { url: credentialUrl }});

  expect(postReply.status()).toBe(201);

  /* new record should look like this (but with a different id)
    {
      "status": "Short link created",
      "id": "k3x9Q2ab",
      "url": {
          "view": "/s/k3x9Q2ab"
      }
    }
  */
  const newRecord = await postReply.json();
  expect(newRecord).toEqual(expect.objectContaining({
    status: 'Short link created',
    id: expect.any(String),
    url: { view: `/s/${newRecord.id}` }
  }));

  // asking again for the same URL (even with a trailing '?') should give the same short link
  const secondPostReply = await request.post(`/api/short-links`, {data: { url: `${credentialUrl}?` }});
  expect((await secondPostReply.json()).id).toBe(newRecord.id);

  // the short link should open the same page as the long link
  const openReply = await request.get(newRecord.url.view, { maxRedirects: 0 });
  expect(openReply.status()).toBe(307);
  expect(openReply.headers()['location']).toBe(`/#verify?vc=${encodeURIComponent(credentialUrl)}`);
});

test('POST /short-links should only shorten https links to our wallet storage', async ({ request }) => {
  const notOurStorage = await request.post(`/api/short-links`, {data: { url: 'https://example.com/credential.json' }});
  expect(notOurStorage.status()).toBe(400);

  const notHttps = await request.post(`/api/short-links`, {data: { url: 'http://was.lcw-sandbox.org/space/test-space/public/Badges' }});
  expect(notHttps.status()).toBe(400);

  const noUrl = await request.post(`/api/short-links`, {data: {}});
  expect(noUrl.status()).toBe(400);

  const notAPublicLink = await request.post(`/api/short-links`, {data: { url: 'https://was.lcw-sandbox.org/space/test-space/private/Badges' }});
  expect(notAPublicLink.status()).toBe(400);

  const withQuery = await request.post(`/api/short-links`, {data: { url: 'https://was.lcw-sandbox.org/space/test-space/public/Badges?n=1' }});
  expect(withQuery.status()).toBe(400);
});

test('GET /s/{id} should show not found for an unknown short link', async ({ page }) => {
  const reply = await page.goto('/s/doesNotExist');
  expect(reply?.status()).toBe(404);
  await expect(page.getByText('404 credential not found')).toBeVisible();
});
