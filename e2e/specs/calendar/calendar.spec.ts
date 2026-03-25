import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Calendar Module', () => {
  test('should load calendar page', async ({ adminPage: page }) => {
    await navigateToTab(page, '/calendar')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display week view by default', async ({ adminPage: page }) => {
    await navigateToTab(page, '/calendar', 'week')
    await waitForContent(page)
    await assertNoError(page)
    // Week view should show days of the week
    const content = page.locator('text=/mon|tue|wed|thu|fri|sat|sun|week/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should switch to day view', async ({ adminPage: page }) => {
    await navigateToTab(page, '/calendar', 'day')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should switch to month view', async ({ adminPage: page }) => {
    await navigateToTab(page, '/calendar', 'month')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    // Month view should show calendar grid
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display calendar navigation controls', async ({ adminPage: page }) => {
    await navigateToTab(page, '/calendar')
    await waitForContent(page)
    // Should have prev/next navigation and today button
    const navButtons = page.locator('button:has-text("Today"), button:has-text("Previous"), button:has-text("Next"), button[aria-label*="previous"], button[aria-label*="next"]')
    const count = await navButtons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should switch between all views without errors', async ({ adminPage: page }) => {
    const views = ['week', 'day', 'month']
    for (const view of views) {
      await navigateToTab(page, '/calendar', view)
      await assertNoError(page)
    }
  })
})
