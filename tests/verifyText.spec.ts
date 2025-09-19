import { test, expect } from "@playwright/test";
import { LogMessages } from "@/components/ResultLog/ResultLog";

/* note that these tests retrieve the text of the VC to be tested
and then paste it into the verification input field.
The tests in verifyURL.spec.ts instead test by pasting the URL and
letting V+ go get the text of the VC*/

const testVCs =
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
      expected: ['DCC did:web for testing']
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
      await expect(page.getByText(expected[i])).toBeVisible();
    }
  });
});

test('invalid', async ({ page }) => {
    await page.goto("/")
    await page.getByTestId('vc-text-area').fill('blah')
    await page.getByRole('button', { name: 'Verify' }).click()
    await expect(page.getByText('The JSON is not a Verifiable Credential')).toBeVisible()
})