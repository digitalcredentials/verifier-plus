import { test, expect } from "@playwright/test";
import { getTestVP } from "./fixtures/testVP";

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