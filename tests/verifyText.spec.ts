import { test, expect } from "@playwright/test";
import { LogMessages } from "@/components/ResultLog/ResultLog";
import { TestId } from "@/lib/testIds";
import { VERIFY_RESULT_TIMEOUT_MS } from "@/tests/helpers/resultLog";

/* note that these tests retrieve the text of the VC to be tested
and then paste it into the verification input field.
The tests in verifyURL.spec.ts instead test by pasting the URL and
letting V+ go get the text of the VC*/

// An expected entry is either text that appears once on the page, or text a
// given test id must show (for text, like the issuer name, that appears more than once).
type Expected = string | { testId: TestId, text: string }

const testVCs: { name: string, vc: string, expected: Expected[] }[] =
  [
    {
      name: 'no expiration date set',
      vc: 'https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v1/dataIntegrityProof/didKey/legacy-noStatus-noExpiry.json',
      expected: [LogMessages.NoExpirationDate]
    },
    {
      name: 'has expired',
      vc: 'https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didWeb/legacy-revokedStatus-expired.json',
      expected: [LogMessages.HasExpired]
    },
    {
      name: 'has been revoked',
      vc: 'https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didWeb/legacy-revokedStatus-expired.json',
      expected: ['has been revoked']
    },
    {
      name: 'issued by test issuer',
      vc: 'https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didWeb/legacy-revokedStatus-expired.json',
      expected: [{ testId: TestId.IssuerName, text: 'DCC did:web for testing' }]
    },
    {
      name: 'in test registry',
      vc: 'https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didWeb/legacy-revokedStatus-expired.json',
      expected: ['DCC Sandbox Registry']
    },
    {
      name: 'expired and revoked',
      vc: 'https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didWeb/legacy-revokedStatus-expired.json',
      expected: [LogMessages.HasExpired, 'has been revoked']
    }
  ]

testVCs.forEach(({ name, vc, expected }) => {
  test(`testing vc: ${name}`, async ({ page }) => {
    const response = await fetch(vc);
    const remoteTestVC = await response.text()
    await page.goto("/");
    await page.getByTestId('vc-text-area').fill(remoteTestVC)
    await page.getByRole('button', { name: 'Verify' }).click()
    for (let i = 0; i < expected.length; i++) {
      const entry = expected[i]
      // the first result appears once verification returns
      const timeout = i === 0 ? VERIFY_RESULT_TIMEOUT_MS : undefined
      if (typeof entry === 'string') {
        await expect(page.getByText(entry)).toBeVisible({ timeout });
      } else {
        await expect(page.getByTestId(entry.testId)).toHaveText(entry.text, { timeout });
      }
    }
  });
});

test('invalid', async ({ page }) => {
    await page.goto("/")
    await page.getByTestId('vc-text-area').fill('blah')
    await page.getByRole('button', { name: 'Verify' }).click()
    await expect(page.getByText('The JSON is not a Verifiable Credential')).toBeVisible({ timeout: VERIFY_RESULT_TIMEOUT_MS })
})