import { test, expect } from "@playwright/test";
import testVC from "./testVC";
import { TestId, LogMessages } from "components/ResultLog/ResultLog";

const logTests = [
  {
    name: 'legacy-noStatus-noExpiry',
    vc: 'https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v1/dataIntegrityProof/didKey/legacy-noStatus-noExpiry.json',
    expected:  [
      { testId: TestId.ExpirationLogMsg, expectedText: LogMessages.NoExpirationDate },
      { testId: TestId.RevocationLogMsg, expectedText: LogMessages.NotRevoked }
    ] 
  },
  {
    name: 'legacy-revoked-expired',
    vc: 'https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didWeb/legacy-revokedStatus-expired.json',
    expected: [{ testId: TestId.ExpirationLogMsg, expectedText: LogMessages.HasExpired }]
  }
]

// NOTE: these tests pass the url for the VC to V+, whereas the other tests above go get the text and paste that in.
logTests.forEach(({ name, vc, expected }) => {
  test(`log: ${name}`, async ({ page }) => {
    await page.goto("/")
    await page.getByTestId('vc-text-area').fill(vc)
    await page.getByRole('button', { name: 'Verify' }).click()
    for (let i = 0; i < expected.length; i++) {
      const logTest = expected[i];
      await expect(page.getByText(logTest.expectedText)).toBeVisible();
      await expect(page.getByTestId(`${logTest.testId}-msg`)).toHaveText(logTest.expectedText)
    }
  })
});