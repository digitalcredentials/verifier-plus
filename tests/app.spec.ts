import { test, expect } from "@playwright/test";
import { getSampleVCAsString} from "./testVC";
import { TestId, LogMessages } from "components/ResultLog/ResultLog";

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
    // could maybe use something like the next to explicitly test each verification result, maybe using data-testid
    //  await expect(page.getByRole('heading')).toHaveText(expected);
  });
});


