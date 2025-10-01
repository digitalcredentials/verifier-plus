import { test, expect } from '@playwright/test';
import { getTestVPForVPQR } from '@/tests/fixtures/testVP';

import { vprQuery } from '@/app/api/exchanges/[txId]/route';
import { LogMessages } from "@/components/ResultLog/ResultLog";
import { TestId } from "@/lib/testIds"

test('test the qr', async ({ page, request }) => {
  await page.goto('http://localhost:3000/');
  await page.getByTestId('lcw-request-btn').click();
  const qr = await page.getByTestId("lcw-qr-request")
  const theValueOfTheQR: any = await qr.getAttribute('data-testvalue')

  const deepLink = new URL(theValueOfTheQR);
  const lcwHost = deepLink.hostname
  expect(lcwHost).toEqual('lcw.app');
  const credentialRequest: any = deepLink.searchParams.get('request')
  const credentialRequestObject = JSON.parse(credentialRequest)

  /*  
example of the value of the deeplinks 'request' parameter:
{
  "credentialRequestOrigin": "https://verifierplus.org",
  "protocols": {
      "vcapi": "https://verifierplus.org/api/exchanges/92232314-31cc-4421-b0a1-4841fa1195cb"
  }
}*/

  // now post an empty object to that endpoint to initiate the exchange
  const initiateReply = await request.post(credentialRequestObject.protocols.vcapi, { data: {} });

  // we expect to get back a verifiablePresentationRequest:
  const vpr = await initiateReply.json();
  expect(vpr).toEqual(vprQuery());

  // now post a credential to that endpoint, as though we were the LCW

  const testVP = getTestVPForVPQR();
  const postReply = await request.post(credentialRequestObject.protocols.vcapi, { data: testVP });

  expect(postReply.ok()).toBeTruthy();

  const newRecord = await postReply.json();
  expect(newRecord.status).toEqual('received')

  // and now we expect that verifier plus displays and verifies the submitted credential:
  // but first we have to wait for the validation to run:

  await page.getByTestId(TestId.MalformedLogMsg).waitFor({ state: 'visible', timeout: 30000 })
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


});