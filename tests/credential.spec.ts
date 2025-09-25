import { test, expect } from "@playwright/test";
import {getSampleVC} from "./testVC";
import { TestId } from "@/tests/testIds"

/** Test that the basic VC data renders properly*/
test("credential display version 2", async ({ page }) => {
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

  // check expiry date
  const expiry = 'N/A'
  await expect(page.getByText(expiry)).toBeVisible();
  await expect(page.getByTestId(TestId.ExpirationDate)).toHaveText(expiry)

  // check issuance date doesn't appear because there isn't one
  await expect(page.getByText('Issuance Date')).not.toBeVisible();
  await expect(page.getByTestId(TestId.IssuanceDate)).not.toBeVisible()

  // check description doesn't appear because there isn't one
  await expect(page.getByText('Description')).not.toBeVisible();
  await expect(page.getByTestId(TestId.CredentialDescription)).not.toBeVisible()

  // check criteria doesn't appear because there isn't one
  await expect(page.getByText('Criteria')).not.toBeVisible();
  await expect(page.getByTestId(TestId.CredentialCriteria)).not.toBeVisible()

  // await expect(page.getByTestId(TestId.IssuanceDate)).toHaveText(DateTime.fromISO(displayValues.issuanceDate).toLocaleString(DateTime.DATE_MED))
});

