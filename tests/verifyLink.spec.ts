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

  await page.locator('header').getByText('VerifierPlus', { exact: true }).click()
  await expect(page).toHaveURL('/')
  // the page logs this just before it handles the failed fetch
  const fetchFailed = page.waitForEvent('console', msg => msg.text().includes('Error fetching URL'))
  respond()
  await fetchFailed
  await expect(page.getByText(HOME_PAGE_TEXT)).toBeVisible()
  await expect(page.getByText(NOT_FOUND)).not.toBeVisible()
})

test('a link still loading when another is opened in the same tab is ignored', async ({ page }) => {
  let respondToFirst = () => {}
  await page.route('**/api/proxy', route => route.request().postDataJSON().url.endsWith('/dead')
    ? route.fulfill({ status: 404, json: { error: 'Failed to fetch URL' } })
    : new Promise<void>(resolve => { respondToFirst = () => resolve(route.fulfill({ json: getOBv3_v2() })) }))
  // Counts the proxy answers the page has read, one task after each read, by
  // when the page's own handling of that answer has run
  await page.addInitScript(() => {
    const read = Response.prototype.json
    Object.assign(window, { proxyAnswersRead: 0 })
    Response.prototype.json = async function () {
      const body = await read.call(this)
      if (this.url.endsWith('/api/proxy')) {
        setTimeout(() => Object.assign(window, { proxyAnswersRead: (window as any).proxyAnswersRead + 1 }))
      }
      return body
    }
  })
  await page.goto('/')
  await expect(page.getByText(HOME_PAGE_TEXT)).toBeVisible()
  // only the #fragment changes each time, so the open page handles both links
  const firstRequest = page.waitForRequest('**/api/proxy')
  await page.goto(vcLink)
  await firstRequest
  await page.goto(`/#verify?vc=${encodeURIComponent('https://example.com/credentials/dead')}`)
  await expect(page.getByText(NOT_FOUND)).toBeVisible()

  // the first link's credential arrives late, and must not replace the second link's page.
  // The dead link's 404 is never read as JSON, so the first read is the late answer.
  respondToFirst()
  await page.waitForFunction(() => (window as any).proxyAnswersRead === 1)
  // two frames, so whatever the late answer changed has been drawn
  await page.evaluate(() => new Promise(done => requestAnimationFrame(() => requestAnimationFrame(done))))
  await expect(page.getByText(NOT_FOUND)).toBeVisible()
  await expect(page.getByTestId(TestId.CredentialName)).not.toBeVisible()
})

test('the logo clears the multiple-credentials notice', async ({ page }) => {
  const MULTI = 'Presentation had multiple credentials'
  await page.route('**/api/proxy', route => route.fulfill({ json: {
    type: ['VerifiablePresentation'], verifiableCredential: [getOBv3_v2(), getOBv3_v2()]
  } }))
  await page.goto(vcLink)
  await expect(page.getByText(MULTI)).toBeVisible()

  await page.locator('header').getByText('VerifierPlus', { exact: true }).click()
  await expect(page).toHaveURL('/')
  await page.getByTestId('vc-text-area').fill(JSON.stringify(getOBv3_v2()))
  await page.getByRole('button', { name: 'Verify' }).click()
  await expect(page.getByTestId(TestId.CredentialName)).toHaveText('Bachelors - v2 - Test')
  await expect(page.getByText(MULTI)).not.toBeVisible()
})

test('the logo goes home after a wallet credential replaces a dead link', async ({ page }) => {
  await page.route('**/api/proxy', route => route.fulfill({ status: 404, json: { error: 'Failed to fetch URL' } }))
  // The "Request credentials from LCW" panel polls this until a wallet sends a presentation.
  // Polling keeps running after the page leaves home, which is how a wallet credential can
  // arrive while a dead link is showing; if that ever changes, this setup needs updating.
  let walletSent = false
  await page.route('**/api/exchanges/**', route => walletSent
    ? route.fulfill({ json: JSON.stringify({ verifiablePresentation: { verifiableCredential: [getOBv3_v2()] } }) })
    : route.fulfill({ status: 404, body: '' }))

  await page.goto('/')
  await page.getByText('Request credentials from LCW').click()
  await page.goto(vcLink)
  await expect(page.getByText(NOT_FOUND)).toBeVisible()

  walletSent = true
  await expect(page.getByTestId(TestId.CredentialName)).toHaveText('Bachelors - v2 - Test', { timeout: 10000 })

  await page.locator('header').getByText('VerifierPlus', { exact: true }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByText(HOME_PAGE_TEXT)).toBeVisible()
  await expect(page.getByText(NOT_FOUND)).not.toBeVisible()
})

test('going back to a dead link shows credential not found again', async ({ page }) => {
  await page.route('**/api/proxy', route => route.fulfill({ status: 404, json: { error: 'Failed to fetch URL' } }))
  await page.goto(vcLink)
  await expect(page.getByText(NOT_FOUND)).toBeVisible()

  // the logo takes you home
  await page.locator('header').getByText('VerifierPlus', { exact: true }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByText(HOME_PAGE_TEXT)).toBeVisible()

  // and back returns to the dead link
  await page.goBack()
  await expect(page.getByText(NOT_FOUND)).toBeVisible()
})

test('going back from a dead link to the home page shows the home page', async ({ page }) => {
  await page.route('**/api/proxy', route => route.fulfill({ status: 404, json: { error: 'Failed to fetch URL' } }))
  await page.goto('/')
  await expect(page.getByText(HOME_PAGE_TEXT)).toBeVisible()
  // only the #fragment changes, so the open page handles the link
  await page.goto(vcLink)
  await expect(page.getByText(NOT_FOUND)).toBeVisible()

  await page.goBack()
  await expect(page).toHaveURL('/')
  await expect(page.getByText(HOME_PAGE_TEXT)).toBeVisible()
  await expect(page.getByText(NOT_FOUND)).not.toBeVisible()
})
