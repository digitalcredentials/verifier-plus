import { test, expect } from "@playwright/test";
import testVC from "./testVC";
import {  LogMessages } from "components/ResultLog/ResultLog";

/** A test that uses a local VC and not the github vcs. */
test("local vc", async ({ page }) => {
  // Start from the index page (the baseURL is set via the webServer in the playwright.config.ts)
  await page.goto("/");
  // Find an element with the text 'About' and click on it
  //  await page.click("text=About");
  // The new URL should be "/about" (baseURL is used there)
  //  await expect(page).toHaveURL("/about");
  await expect(page.locator("h1")).toContainText("VerifierPlus");
  await page.getByTestId('vc-text-area').fill(testVC)
  await page.getByRole('button', { name: 'Verify' }).click()
  await expect(page.getByText(LogMessages.NoExpirationDate)).toBeVisible();
});

