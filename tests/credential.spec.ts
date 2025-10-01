import { test, expect } from "@playwright/test";
import { getMinimalVCv2 } from "@/tests/fixtures/minimalVCv2";
import { getOBv3_v2, getOBv3_v1 } from "@/tests/fixtures/obv3";
import { TestId } from "@/lib/testIds"
import { DateTime } from "luxon";

/**
 * Test individually, with different VCs:
 * - expiry for v1 and v2
 * - issuance/validFrom for v1 and v2
 * - description
 * - credential name?
 * - criteria
 * - holder name in 'name' or in identity or in neither?
 */
/** Test that the basic VC data renders properly, or not as required*/
test("minimal credential display version 2", async ({ page }) => {
  const testVC = getMinimalVCv2()
  const testVCAsString = JSON.stringify(testVC)

  await page.goto("/");
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

  // confirm that issuance date doesn't appear because there isn't one
  await expect(page.getByText('Issuance Date')).not.toBeVisible();
  await expect(page.getByTestId(TestId.IssuanceDate)).not.toBeVisible()

  // confirm that description doesn't appear because there isn't one
  await expect(page.getByText('Description')).not.toBeVisible();
  await expect(page.getByTestId(TestId.CredentialDescription)).not.toBeVisible()

  // confirm criteria doesn't appear because there isn't one
  await expect(page.getByText('Criteria')).not.toBeVisible();
  await expect(page.getByTestId(TestId.CredentialCriteria)).not.toBeVisible()

  // confirm 'achievement type' doesn't appear because there isn't one
  await expect(page.getByText('Achievement Type')).not.toBeVisible();
  await expect(page.getByTestId(TestId.AchievementType)).not.toBeVisible()

  // confirm the 'credential name' fileld doesn't appear, even if empty
  await expect(page.getByTestId(TestId.CredentialName)).not.toBeVisible()
  // await expect(page.getByTestId(TestId.IssuanceDate)).toHaveText(DateTime.fromISO(displayValues.issuanceDate).toLocaleString(DateTime.DATE_MED))

});

// Test that all data fields appear
test("full credential display OBv3 VCv2", async ({ page }) => {
  const testVC = getOBv3_v2()
  const testVCAsString = JSON.stringify(testVC)

  await page.goto("/");
  // load the VC into V+
  await page.getByTestId('vc-text-area').fill(testVCAsString)
  await page.getByRole('button', { name: 'Verify' }).click()

  // check credential holder's name
  const issuedTo = testVC.credentialSubject.name
  await expect(page.getByText(issuedTo)).toBeVisible();
  await expect(page.getByTestId(TestId.IssuedTo)).toHaveText(issuedTo)

  // check credential name
  const credentialName = testVC.credentialSubject.achievement.name
  await expect(page.getByText(credentialName)).toBeVisible();
  await expect(page.getByTestId(TestId.CredentialName)).toHaveText(credentialName)

  // check expiry date
  const expiry = DateTime.fromISO(testVC.validUntil).toLocaleString(DateTime.DATE_MED)
  await expect(page.getByText('Expiration Date')).toBeVisible();
  await expect(page.getByTestId(TestId.ExpirationDate)).toHaveText(expiry)

  // check isuance date
  const issuanceDate = DateTime.fromISO(testVC.validFrom).toLocaleString(DateTime.DATE_MED)
  await expect(page.getByText('Issuance Date')).toBeVisible();
  await expect(page.getByTestId(TestId.IssuanceDate)).toHaveText(issuanceDate)

  // confirm that description matches
  const description = testVC.credentialSubject.achievement.description
  await expect(page.getByText('Description')).toBeVisible();
  await expect(page.getByTestId(TestId.CredentialDescription)).toHaveText(description)

  // confirm criteria matches
  const criteria = testVC.credentialSubject.achievement.criteria.narrative
  await expect(page.getByText('Criteria')).toBeVisible();
  await expect(page.getByTestId(TestId.CredentialCriteria)).toHaveText(criteria)

  // confirm the credential image is shown
  const credentialImageURL = testVC.credentialSubject.achievement.image.id
  await expect(page.getByTestId(TestId.AchievementImage)).toHaveScreenshot();
  const credentialImage = page.getByTestId(TestId.AchievementImage)
  const srcAttrValue = await credentialImage.getAttribute('src');
  await expect(srcAttrValue).toEqual(credentialImageURL)
});

// Test that all data fields appear
test("full credential display OBv3 VCv1", async ({ page }) => {
  const testVC = getOBv3_v1()
  const testVCAsString = JSON.stringify(testVC)

  await page.goto("/");
  // load the VC into V+
  await page.getByTestId('vc-text-area').fill(testVCAsString)
  await page.getByRole('button', { name: 'Verify' }).click()

  // check credential holder's name
  const issuedTo = testVC.credentialSubject.identifier[0].identityHash
  await expect(page.getByText(issuedTo)).toBeVisible();
  await expect(page.getByTestId(TestId.IssuedTo)).toHaveText(issuedTo)

  // check credential name
  const credentialName = testVC.credentialSubject.achievement.name
  await expect(page.getByText(credentialName)).toBeVisible();
  await expect(page.getByTestId(TestId.CredentialName)).toHaveText(credentialName)

  // check expiry date
  const expiry = DateTime.fromISO(testVC.expirationDate).toLocaleString(DateTime.DATE_MED)
  await expect(page.getByText('Expiration Date')).toBeVisible();
  await expect(page.getByTestId(TestId.ExpirationDate)).toHaveText(expiry)

  // check isuance date
  const issuanceDate = DateTime.fromISO(testVC.issuanceDate).toLocaleString(DateTime.DATE_MED)
  await expect(page.getByText('Issuance Date')).toBeVisible();
  await expect(page.getByTestId(TestId.IssuanceDate)).toHaveText(issuanceDate)

  // confirm that description matches
  const description = testVC.credentialSubject.achievement.description
  await expect(page.getByText('Description')).toBeVisible();
  await expect(page.getByTestId(TestId.CredentialDescription)).toHaveText(description)

  // confirm criteria matches
  const criteria = testVC.credentialSubject.achievement.criteria.narrative
  await expect(page.getByText('Criteria')).toBeVisible();
  await expect(page.getByTestId(TestId.CredentialCriteria)).toHaveText(criteria)

  // confirm the credential image is shown
  const credentialImageURL = testVC.credentialSubject.achievement.image.id
  await expect(page.getByTestId(TestId.AchievementImage)).toHaveScreenshot();
  const credentialImage = page.getByTestId(TestId.AchievementImage)
  const srcAttrValue = await credentialImage.getAttribute('src');
  await expect(srcAttrValue).toEqual(credentialImageURL)
});
