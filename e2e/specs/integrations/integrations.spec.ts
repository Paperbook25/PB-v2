import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Integrations Module', () => {
  test('should load integrations page', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'integrations')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  const subtabs = ['sms', 'email', 'payment', 'whatsapp', 'biometric', 'webhooks', 'api-keys']

  for (const subtab of subtabs) {
    test(`should load integrations ${subtab} subtab`, async ({ adminPage: page }) => {
      await navigateToTab(page, '/settings', 'integrations', subtab)
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })
  }

  test('should display SMS provider configuration', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'integrations', 'sms')
    await waitForContent(page)
    const content = page.locator('text=/sms|provider|api key|configure|twilio|msg91/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display email configuration', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'integrations', 'email')
    await waitForContent(page)
    const content = page.locator('text=/email|smtp|provider|configure/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display payment gateway configuration', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'integrations', 'payment')
    await waitForContent(page)
    const content = page.locator('text=/payment|gateway|razorpay|stripe|configure/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display API keys management', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'integrations', 'api-keys')
    await waitForContent(page)
    const content = page.locator('text=/api key|key|generate|create|no key/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should switch between all subtabs without errors', async ({ adminPage: page }) => {
    for (const subtab of subtabs) {
      await navigateToTab(page, '/settings', 'integrations', subtab)
      await assertNoError(page)
    }
  })
})
