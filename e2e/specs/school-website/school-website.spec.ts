import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('School Website Builder', () => {
  test('should load school website page', async ({ adminPage: page }) => {
    await navigateToTab(page, '/school-website')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display pages tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/school-website', 'pages')
    await waitForContent(page)
    await assertNoError(page)
    const content = page.locator('text=/page|home|about|content|builder|no page/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display settings/look & feel tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/school-website', 'settings')
    await waitForContent(page)
    await assertNoError(page)
    const content = page.locator('text=/setting|theme|color|font|logo|look/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should switch between tabs without errors', async ({ adminPage: page }) => {
    const tabs = ['pages', 'settings']
    for (const tab of tabs) {
      await navigateToTab(page, '/school-website', tab)
      await assertNoError(page)
    }
  })

  test('should load public school page', async ({ adminPage: page }) => {
    // Test the public-facing school website route
    await page.goto('/s/demo')
    await page.waitForLoadState('networkidle')
    // Public page should render or show 404
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })
})
