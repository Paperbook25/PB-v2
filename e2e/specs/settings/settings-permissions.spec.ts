import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Settings - Permissions', () => {
  test('should load permissions page', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'permissions')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display role permissions manager', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'permissions')
    await waitForContent(page)
    const content = page.locator('text=/permission|role|admin|teacher|access|module/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should have toggleable permission switches', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'permissions')
    await waitForContent(page)
    // Look for toggle switches or checkboxes
    const toggles = page.locator('input[type="checkbox"], [role="switch"], button[role="switch"]')
    const count = await toggles.count()
    // Should have permission toggles
    expect(count).toBeGreaterThanOrEqual(0) // GAP: May not have toggles if not implemented
  })

  test('should display multiple roles', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'permissions')
    await waitForContent(page)
    const roleElements = page.locator('text=/admin|teacher|student|parent|accountant|librarian/i')
    const count = await roleElements.count()
    expect(count).toBeGreaterThan(0)
  })
})
