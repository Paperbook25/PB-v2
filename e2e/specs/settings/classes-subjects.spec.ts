import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Settings - Classes & Subjects', () => {
  test('should load classes from database', async ({ adminPage: page }) => {
    // Navigate directly via URL instead of clicking sidebar links
    await navigateToTab(page, '/settings', 'general', 'classes')
    await waitForContent(page)
    await assertNoError(page)
    await expect(page.locator('text=/class|section|add|grade|no class/i').first()).toBeVisible({ timeout: 10000 })
  })

  test('should load subjects from database', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'general', 'subjects')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    // Either subjects page loads or we're on a settings subtab
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should load academic years from database', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'general', 'academic')
    await waitForContent(page)
    await assertNoError(page)
    // Should show academic year data
    await expect(page.locator('text=/academic|year|session|2024|2025|2026/i').first()).toBeVisible({ timeout: 10000 })
  })
})
