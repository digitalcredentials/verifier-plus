import { test, expect } from "@playwright/test";
import {getSampleVC} from "./testVC";
import { TestId } from "./testIds";

/** Test that the basic VC data renders properly*/
test("credential data", async ({ page }) => {
const testVC = getSampleVC()
const testVCAsString = JSON.stringify(testVC)

  // load the page and do a quick check on title
  await page.goto("/");
  await expect(page.locator("h1")).toContainText("VerifierPlus");

  // load the VC into V+
  await page.getByTestId('vc-text-area').fill(testVCAsString)
  await page.getByRole('button', { name: 'Verify' }).click()

  // check credential holder's name
  const issuedTo = testVC.credentialSubject.name
  await expect(page.getByText(issuedTo)).toBeVisible();
  await expect(page.getByTestId(TestId.IssuedTo)).toHaveText(issuedTo)
  // await expect(page.getByTestId(TestId.IssuanceDate)).toHaveText(DateTime.fromISO(displayValues.issuanceDate).toLocaleString(DateTime.DATE_MED))
});

