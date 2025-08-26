import { test, expect } from "@playwright/test";
import testVC from "./testVC";

test("should navigate to the about page", async ({ page }) => {
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

test("pull from fixtures repo", async ({page}) => {
  const response = await fetch("https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v1/dataIntegrityProof/didKey/legacy-noStatus-noExpiry.json");
  const remoteTestVC = await response.text()
  await page.goto("/");
  await page.getByTestId('vc-text-area').fill(remoteTestVC)
  await page.getByRole('button', { name: 'Verify' }).click()
  await expect(page.getByText('no expiration date set')).toBeVisible();
})

test("revoked and expired", async ({page}) => {
  const response = await fetch("https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didWeb/legacy-revokedStatus-expired.json");
  const remoteTestVC = await response.text()
  await page.goto("/");
  await page.getByTestId('vc-text-area').fill(remoteTestVC)
  await page.getByRole('button', { name: 'Verify' }).click()
  await expect(page.getByText('has expired')).toBeVisible();
  await expect(page.getByText('has been revoked')).toBeVisible();
})

test("in test registry", async ({page}) => {
  const response = await fetch("https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didWeb/legacy-revokedStatus-expired.json");
  const remoteTestVC = await response.text()
  await page.goto("/");
  await page.getByTestId('vc-text-area').fill(remoteTestVC)
  await page.getByRole('button', { name: 'Verify' }).click()
  await expect(page.getByText('DCC Sandbox Registry')).toBeVisible();
})

test("issued by test issuer", async ({page}) => {
  const response = await fetch("https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didWeb/legacy-revokedStatus-expired.json");
  const remoteTestVC = await response.text()
  await page.goto("/");
  await page.getByTestId('vc-text-area').fill(remoteTestVC)
  await page.getByRole('button', { name: 'Verify' }).click()
  await expect(page.getByText('DCC did:web for testing')).toBeVisible();
})
