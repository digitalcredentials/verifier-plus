import { test, expect } from "@playwright/test";
import { getOBv3_v2 } from "@/tests/fixtures/obv3";
import { TestId } from "@/lib/testIds"

// NOTE: these tests open a #verify?vc= link, as a shared link or QR code would.
// The /api/proxy request that fetches the vc url is intercepted, so no live server is needed.

const NOT_FOUND = '404 credential not found'
const HOME_PAGE_TEXT = 'Paste JSON or URL'
const vcLink = `/#verify?vc=${encodeURIComponent('https://example.com/credentials/123')}`

test('a link to a credential shows the credential', async ({ page }) => {
  await page.route('**/api/proxy', route => route.fulfill({ json: getOBv3_v2() }))
  await page.goto(vcLink)
  await expect(page.getByTestId(TestId.CredentialName)).toHaveText('Bachelors - v2 - Test')
  await expect(page.getByText(NOT_FOUND)).not.toBeVisible()
})

test('a link whose credential returns 404 shows credential not found', async ({ page }) => {
  await page.route('**/api/proxy', route => route.fulfill({ status: 404, json: { error: 'Failed to fetch URL' } }))
  await page.goto(vcLink)
  await expect(page.getByText(NOT_FOUND)).toBeVisible()
  await expect(page.getByText(HOME_PAGE_TEXT)).not.toBeVisible()
})

test('a link that cannot be reached shows credential not found', async ({ page }) => {
  await page.route('**/api/proxy', route => route.abort())
  await page.goto(vcLink)
  await expect(page.getByText(NOT_FOUND)).toBeVisible()
})

test('a link to something that is not a credential shows credential not found', async ({ page }) => {
  await page.route('**/api/proxy', route => route.fulfill({ json: { hello: 'world' } }))
  await page.goto(vcLink)
  await expect(page.getByText(NOT_FOUND)).toBeVisible()
})

test('opening a dead link in a tab already showing a credential shows credential not found', async ({ page }) => {
  await page.route('**/api/proxy', route => route.request().postDataJSON().url.endsWith('/dead')
    ? route.fulfill({ status: 404, json: { error: 'Failed to fetch URL' } })
    : route.fulfill({ json: getOBv3_v2() }))
  await page.goto(vcLink)
  await expect(page.getByTestId(TestId.CredentialName)).toHaveText('Bachelors - v2 - Test')

  // as if the dead link were pasted into the address bar: only the #fragment changes
  await page.goto(`/#verify?vc=${encodeURIComponent('https://example.com/credentials/dead')}`)
  await expect(page.getByText(NOT_FOUND)).toBeVisible()
  await expect(page.getByTestId(TestId.CredentialName)).not.toBeVisible()
})

test('the home page is not shown while a link loads', async ({ page }) => {
  let respond = () => {}
  await page.route('**/api/proxy', route => new Promise<void>(resolve => {
    respond = () => resolve(route.fulfill({ status: 404, json: { error: 'Failed to fetch URL' } }))
  }))
  const proxyRequest = page.waitForRequest('**/api/proxy')
  await page.goto(vcLink)
  await proxyRequest
  await expect(page.getByRole('status', { name: 'Loading credential' })).toBeVisible()
  await expect(page.getByText(HOME_PAGE_TEXT)).not.toBeVisible()
  respond()
  await expect(page.getByText(NOT_FOUND)).toBeVisible()
})

test('leaving a link while it loads keeps the home page when it fails', async ({ page }) => {
  let respond = () => {}
  await page.route('**/api/proxy', route => new Promise<void>(resolve => {
    respond = () => resolve(route.fulfill({ status: 404, json: { error: 'Failed to fetch URL' } }))
  }))
  const proxyRequest = page.waitForRequest('**/api/proxy')
  await page.goto(vcLink)
  await proxyRequest

  await page.getByText('VerifierPlus', { exact: true }).click()
  await expect(page).toHaveURL('/')
  // the page logs this just before it handles the failed fetch
  const fetchFailed = page.waitForEvent('console', msg => msg.text().includes('Error fetching URL'))
  respond()
  await fetchFailed
  await expect(page.getByText(HOME_PAGE_TEXT)).toBeVisible()
  await expect(page.getByText(NOT_FOUND)).not.toBeVisible()
})

test('going back to a dead link shows credential not found again', async ({ page }) => {
  await page.route('**/api/proxy', route => route.fulfill({ status: 404, json: { error: 'Failed to fetch URL' } }))
  await page.goto(vcLink)
  await expect(page.getByText(NOT_FOUND)).toBeVisible()

  // the logo takes you home
  await page.getByText('VerifierPlus', { exact: true }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByText(HOME_PAGE_TEXT)).toBeVisible()

  // and back returns to the dead link
  await page.goBack()
  await expect(page.getByText(NOT_FOUND)).toBeVisible()
})
