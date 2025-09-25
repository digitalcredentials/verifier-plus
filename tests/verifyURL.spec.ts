import { test, expect } from "@playwright/test";
import { LogMessages } from "@/components/ResultLog/ResultLog";
import { TestId } from "@/tests/testIds"

// NOTE: these tests paste the url for the VC into V+, 
// The tests in verifyText.spec.ts retrieve the json and paste that.

const logTests = [
  {
    name: 'legacy-noStatus-noExpiry',
    vc: 'https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v1/dataIntegrityProof/didKey/legacy-noStatus-noExpiry.json',
    expected:  [
        { testId: TestId.ExpirationLogMsg, expectedText: LogMessages.NoExpirationDate },
        { testId: TestId.RevocationLogMsg, expectedText: LogMessages.NotRevoked },
        { testId: TestId.SigningLogMsg, expectedText: LogMessages.ValidSignature },
        { testId: TestId.MalformedLogMsg, expectedText: LogMessages.WellFormed },
        { testId: TestId.IssuerLogMsg, expectedText: LogMessages.KnownIssuer }

    ] 
  },
  {
    name: 'legacy-revoked-expired',
    vc: 'https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didWeb/legacy-revokedStatus-expired.json',
    expected: [
        { testId: TestId.ExpirationLogMsg, expectedText: LogMessages.HasExpired },
        { testId: TestId.RevocationLogMsg, expectedText: LogMessages.Revoked },
        { testId: TestId.SigningLogMsg, expectedText: LogMessages.ValidSignature },
        { testId: TestId.MalformedLogMsg, expectedText: LogMessages.WellFormed },
        { testId: TestId.IssuerLogMsg, expectedText: LogMessages.KnownIssuer }
    ]
  }
]


logTests.forEach(({ name, vc, expected }) => {
  test(`log: ${name}`, async ({ page }) => {
    await page.goto("/")
    await page.getByTestId('vc-text-area').fill(vc)
    await page.getByRole('button', { name: 'Verify' }).click()
    for (let i = 0; i < expected.length; i++) {
      const logTest = expected[i];
      await expect(page.getByText(logTest.expectedText)).toBeVisible();
      await expect(page.getByTestId(logTest.testId)).toHaveText(logTest.expectedText)
    }
  })
});