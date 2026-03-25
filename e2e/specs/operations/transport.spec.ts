import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Operations - Transport', () => {
  test('should load transport page', async ({ adminPage: page }) => {
    await navigateToTab(page, '/operations', 'transport')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  const subtabs = ['routes', 'vehicles', 'drivers', 'tracking', 'stops', 'maintenance', 'notifications']

  for (const subtab of subtabs) {
    test(`should load transport ${subtab} subtab`, async ({ adminPage: page }) => {
      await navigateToTab(page, '/operations', 'transport', subtab)
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })
  }

  test('should display routes list', async ({ adminPage: page }) => {
    await navigateToTab(page, '/operations', 'transport', 'routes')
    await waitForContent(page)
    const content = page.locator('text=/route|no route|add|create/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display vehicles list', async ({ adminPage: page }) => {
    await navigateToTab(page, '/operations', 'transport', 'vehicles')
    await waitForContent(page)
    const content = page.locator('text=/vehicle|bus|no vehicle|add/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should load tracking page', async ({ adminPage: page }) => {
    await page.goto('/transport/tracking')
    await page.waitForLoadState('networkidle')
    // Should either load tracking or redirect
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should switch between all subtabs without errors', async ({ adminPage: page }) => {
    for (const subtab of subtabs) {
      await navigateToTab(page, '/operations', 'transport', subtab)
      await assertNoError(page)
    }
  })
})
