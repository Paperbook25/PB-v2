import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Operations - Assets & Inventory', () => {
  test('should load assets page', async ({ adminPage: page }) => {
    await navigateToTab(page, '/operations', 'assets')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  const subtabs = ['dashboard', 'assets', 'stock', 'purchase-orders', 'vendors']

  for (const subtab of subtabs) {
    test(`should load assets ${subtab} subtab`, async ({ adminPage: page }) => {
      await navigateToTab(page, '/operations', 'assets', subtab)
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })
  }

  test('should display assets inventory list', async ({ adminPage: page }) => {
    await navigateToTab(page, '/operations', 'assets', 'assets')
    await waitForContent(page)
    const content = page.locator('text=/asset|inventory|item|no asset/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display purchase orders', async ({ adminPage: page }) => {
    await navigateToTab(page, '/operations', 'assets', 'purchase-orders')
    await waitForContent(page)
    const content = page.locator('text=/purchase|order|vendor|no order/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should load new purchase order page', async ({ adminPage: page }) => {
    await page.goto('/operations/assets/purchase-orders/new')
    await page.waitForLoadState('networkidle')
    // Should load form or redirect
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
    await assertNoError(page)
  })

  test('should display vendors list', async ({ adminPage: page }) => {
    await navigateToTab(page, '/operations', 'assets', 'vendors')
    await waitForContent(page)
    const content = page.locator('text=/vendor|supplier|no vendor/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should switch between all subtabs without errors', async ({ adminPage: page }) => {
    for (const subtab of subtabs) {
      await navigateToTab(page, '/operations', 'assets', subtab)
      await assertNoError(page)
    }
  })
})
