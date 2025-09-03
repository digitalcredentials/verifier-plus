import { test, expect } from "@playwright/test";
import { getTamperedVC, getTamperedVCAsString } from "./testVC";
import { TestId, LogMessages } from "components/ResultLog/ResultLog";

const baseExpectedLogMessages = {
    expiry: LogMessages.HasNotExpired,
    revocation: LogMessages.NotRevoked,
    signature: LogMessages.ValidSignature,
    issuer: LogMessages.KnownIssuer,
    wellFormed: LogMessages.WellFormed
}

const logTests = [
    {
        name: 'legacy-noStatus-noExpiry',
        vc: 'https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v1/dataIntegrityProof/didKey/legacy-noStatus-noExpiry.json',
        expected: { ...baseExpectedLogMessages, expiry: LogMessages.NoExpirationDate }
    },
    {
        name: 'legacy-revoked-expired',
        vc: 'https://digitalcredentials.github.io/vc-test-fixtures/verifiableCredentials/v2/ed25519/didWeb/legacy-revokedStatus-expired.json',
        expected: { ...baseExpectedLogMessages, expiry: LogMessages.HasExpired, revocation: LogMessages.Revoked }
    },
    {
        name: 'oidf-noStatus-expired',
        vc: 'https://github.com/digitalcredentials/vc-test-fixtures/raw/refs/heads/main/verifiableCredentials/v1/bothSignatureTypes/didKey/oidf-noStatus-expired.json',
        expected: { ...baseExpectedLogMessages, expiry: LogMessages.HasExpired, revocation: LogMessages.NotRevoked }
    },
    {
        name: 'noRegistry-noStatus-noExpiry',
        vc: '  https://github.com/digitalcredentials/vc-test-fixtures/raw/refs/heads/main/verifiableCredentials/v1/bothSignatureTypes/didKey/noRegistry-noStatus-noExpiry.json',
        expected: { ...baseExpectedLogMessages, expiry: LogMessages.NoExpirationDate, issuer: LogMessages.UnknownIssuer }
    }
  
]

// NOTE: these tests paste the url for the VC into V+, 
// The tests in app.spec.ts retrieve the json and paste that.
logTests.forEach(({ name, vc, expected }) => {
    test(`log: ${name}`, async ({ page }) => {
        const expectedMessages = { ...baseExpectedLogMessages, ...expected }
        await page.goto("/")
        await page.getByTestId('vc-text-area').fill(vc)
        await page.getByRole('button', { name: 'Verify' }).click()
        // check well formed message matches expected
        await expect(page.getByText(expectedMessages.wellFormed)).toBeVisible();
        await expect(page.getByTestId(TestId.MalformedLogMsg)).toHaveText(expectedMessages.wellFormed)
        // check signature message matches expected
        await expect(page.getByText(expectedMessages.signature)).toBeVisible();
        await expect(page.getByTestId(TestId.SigningLogMsg)).toHaveText(expectedMessages.signature)
        // check issuer message matches expected
        await expect(page.getByText(expectedMessages.issuer)).toBeVisible();
        await expect(page.getByTestId(TestId.IssuerLogMsg)).toHaveText(expectedMessages.issuer)
        // check revocation message matches expected
        await expect(page.getByText(expectedMessages.revocation)).toBeVisible();
        await expect(page.getByTestId(TestId.RevocationLogMsg)).toHaveText(expectedMessages.revocation)
        // check expired message matches expected
        await expect(page.getByText(expectedMessages.expiry)).toBeVisible();
        await expect(page.getByTestId(TestId.ExpirationLogMsg)).toHaveText(expectedMessages.expiry)
        // finally take a screenshot of the log area to capture the combination of checkmarks and x's
        // NOTE: it is very important that this screenshot be taken when the app is working/displaying correctly
        // SEE: https://playwright.dev/docs/test-snapshots
        await expect(page.getByTestId(TestId.ResultLog)).toHaveScreenshot();
    })
});

test('tampered', async ({ page }) => {
    const tamperedVC = getTamperedVCAsString()
    await page.goto("/")
    await page.getByTestId('vc-text-area').fill(tamperedVC)
    await page.getByRole('button', { name: 'Verify' }).click()
    await expect(page.getByTestId(TestId.GeneralErrorMsg)).toHaveText(LogMessages.GeneralError);
})

