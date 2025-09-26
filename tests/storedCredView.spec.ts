import { test, expect } from "@playwright/test";
import { getTestVP } from "./fixtures/testVP";
import { LogMessages } from "@/components/ResultLog/ResultLog";
import { TestId } from "@/tests/testIds"

const generalErrorMessages = {
  NOT_FOUND: '404 credential not found'
}

test('a stored credential should display', async ({ request, page }) => {
  const testVP = getTestVP();

  // 1. first post the test credential to store it in mongo
  const postReply = await request.post(`/api/credentials/`, {data: testVP});
  expect(postReply.ok()).toBeTruthy();

  /* 2. that returns a list of urls to get/delete/view the new credential.
      The new record should look like this (but with a different uuid)
    {
      "status": "Credential added",
      "url": {
          "view": "/credentials/39db5701-2434-42b3-aa0b-088bbd423449",
          "get": "/api/credentials/39db5701-2434-42b3-aa0b-088bbd423449",
          "unshare": "/api/credentials/39db5701-2434-42b3-aa0b-088bbd423449"
      }
    }
  */

  // So, confirm we got the expected urls
  const newRecord = await postReply.json();
  expect(newRecord).toEqual(expect.objectContaining({
    status: 'Credential added',
    url: expect.objectContaining({ 
      view: expect.any(String),
      get: expect.any(String),
      unshare: expect.any(String)}),
  }));

  // 3. pull out the individual URLs:
  const {url: {view: viewURL, get: getURL, unshare: unshareURL} } = newRecord

  // 4. confirm we can retrieve it with a 'GET' using the returned url
  const getReply = await request.get(getURL)
  expect(getReply.ok()).toBeTruthy();
  const storedVP = (await getReply.json()).vp;
  expect(storedVP).toEqual(testVP.vp);

  // 5. now confirm we can view it in the VerifierPlus UI:
  await page.goto(viewURL)

  // check well formed message matches expected
        await expect(page.getByText(LogMessages.WellFormed)).toBeVisible();
        await expect(page.getByTestId(TestId.MalformedLogMsg)).toHaveText(LogMessages.WellFormed)
        // check signature message matches expected
        await expect(page.getByText(LogMessages.ValidSignature)).toBeVisible();
        await expect(page.getByTestId(TestId.SigningLogMsg)).toHaveText(LogMessages.ValidSignature)
        // check issuer message matches expected
        await expect(page.getByText(LogMessages.KnownIssuer)).toBeVisible();
        await expect(page.getByTestId(TestId.IssuerLogMsg)).toHaveText(LogMessages.KnownIssuer)
        // check revocation message matches expected
        await expect(page.getByText(LogMessages.NotRevoked)).toBeVisible();
        await expect(page.getByTestId(TestId.RevocationLogMsg)).toHaveText(LogMessages.NotRevoked)
        // check expired message matches expected
        await expect(page.getByText(LogMessages.NoExpirationDate)).toBeVisible();
        await expect(page.getByTestId(TestId.ExpirationLogMsg)).toHaveText(LogMessages.NoExpirationDate)
        // finally take a screenshot of the log area to capture the combination of checkmarks and x's
        // NOTE: it is very important that this screenshot be taken when the app is working/displaying correctly
        // SEE: https://playwright.dev/docs/test-snapshots
        await expect(page.getByTestId(TestId.ResultLog)).toHaveScreenshot();

  // 6. now delete the credential
  const deleteReply = await request.delete(unshareURL)
  expect(deleteReply.ok()).toBeTruthy();

  // 7. and now the credential should return not available
  // when we try to retrieve it from the GET endpoint
  const secondGetReply = await request.get(getURL)
  expect(secondGetReply.ok()).not.toBeTruthy();
  expect(secondGetReply.status()).toBe(500)

  //8. and similarly, should not be displayable:
  await page.goto(viewURL)
  await expect(page.getByText(generalErrorMessages.NOT_FOUND)).toBeVisible();
});