import { test, expect } from "@playwright/test";
import { getMinimalVCv2 } from "@/tests/fixtures/minimalVCv2";
import { getOBv3_v2, getOBv3_v1 } from "@/tests/fixtures/obv3";
import { TestId } from "@/tests/testIds"

// Note that this name is taken from the DCC Sandbox Registry
// We have to take it from there so we can confirm in our tests that
// that V+ is showing the issuer name from the registry in prefernece
// to the issuer name from the VC itself.
const publicTestIssuerName = 'Public Test Issuer'


/** Test that the issuer name shown in the top issuer section matches the
 * issuer name shown in the registry section
*/
test("issuer names come from registry and match", async ({ page }) => {
  const testVC = getOBv3_v2()
  const testVCAsString = JSON.stringify(testVC)

  await page.goto("/");
  // load the VC into V+
  await page.getByTestId('vc-text-area').fill(testVCAsString)
  await page.getByRole('button', { name: 'Verify' }).click()

  await expect(page.getByTestId(TestId.IssuerName)).toHaveText(publicTestIssuerName);
  await expect(page.getByTestId(TestId.RegistryIssuerName)).toHaveText(publicTestIssuerName);
});

/** Test that the issuer name shown in the top issuer section matches the
 * issuer name shown in the registry section
*/
test("issuer name comes from vc when issuer not in registry", async ({ page }) => {
  const testVC = 'https://github.com/digitalcredentials/vc-test-fixtures/raw/refs/heads/main/verifiableCredentials/v1/bothSignatureTypes/didKey/noRegistry-noStatus-noExpiry.json'
  
  await page.goto("/");
  // load the VC into V+, allowing V+ to go fetch the text itself
  await page.getByTestId('vc-text-area').fill(testVC)
  await page.getByRole('button', { name: 'Verify' }).click()
  // now we go get the text so we can pull out the issuer name
  const response = await fetch(testVC);
  const remoteTestVC : any = await response.json()
  const issuerNameFromVC = remoteTestVC.issuer.name

  // the issuer name should match that from the VC
  await expect(page.getByTestId(TestId.IssuerName)).toHaveText(issuerNameFromVC);
  // and also check that an issuer name isn't shown in the registry area
  await expect(page.getByTestId(TestId.RegistryIssuerName)).not.toBeVisible
});



