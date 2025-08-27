import { test, expect } from "@playwright/test";
import testVC from "./testVC";

const testVCs =
  [
    {
      name: 'no expiration date set',
      vc: 'https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v1/dataIntegrityProof/didKey/legacy-noStatus-noExpiry.json',
      expected: ['no expiration date set']
    },
    {
      name: 'has expired',
      vc: 'https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didWeb/legacy-revokedStatus-expired.json',
      expected: ['has expired']
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
      expected: ['has expired', 'has been revoked']
    }
  ]

testVCs.forEach(({ name, vc, expected }) => {
  test(`testing vc: ${name}`, async ({ page }) => {
    const response = await fetch(vc);
    const remoteTestVC = await response.text()
    await page.goto("/");
    await page.getByTestId('vc-text-area').fill(remoteTestVC)
    await page.getByRole('button', { name: 'Verify' }).click()
    for(let i=0; i < expected.length; i++) {
       await expect(page.getByText(expected[i])).toBeVisible();
    }
    // could maybe use something like the next to explicitly test each verification result, maybe using data-testid
    //  await expect(page.getByRole('heading')).toHaveText(expected);
  });
});



/** will want to move the visible tests into an array of checks 
test("revoked and expired", async ({ page }) => {
  const response = await fetch("https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didWeb/legacy-revokedStatus-expired.json");
  const remoteTestVC = await response.text()
  await page.goto("/");
  await page.getByTestId('vc-text-area').fill(remoteTestVC)
  await page.getByRole('button', { name: 'Verify' }).click()
  await expect(page.getByText('has expired')).toBeVisible();
  await expect(page.getByText('has been revoked')).toBeVisible();
})
*/


test("local vc", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto("/");
  // Find an element with the text 'About' and click on it
  //  await page.click("text=About");
  // The new URL should be "/about" (baseURL is used there)
  //  await expect(page).toHaveURL("/about");
  await expect(page.locator("h1")).toContainText("VerifierPlus");
  await page.getByTestId('vc-text-area').fill(testVC)
  //await page.getByTestId('verify-btn').click()
  await page.getByRole('button', { name: 'Verify' }).click()
  await expect(page.getByText('no expiration date set')).toBeVisible();
});
