import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Reports Module', () => {
  test('should load reports dashboard', async ({ adminPage: page }) => {
    await navigateToTab(page, '/reports')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display reports dashboard tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/reports', 'dashboard')
    await waitForContent(page)
    await assertNoError(page)
    const content = page.locator('text=/report|dashboard|overview|generate/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display templates tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/reports', 'templates')
    await waitForContent(page)
    await assertNoError(page)
    const content = page.locator('text=/template|report|create|no template/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display history tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/reports', 'history')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display scheduled reports tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/reports', 'scheduled')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display analytics tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/reports', 'analytics')
    await waitForContent(page)
    await assertNoError(page)
    const content = page.locator('text=/analytics|academic|financial|attendance/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should load new report page', async ({ adminPage: page }) => {
    await page.goto('/reports/new')
    await page.waitForLoadState('networkidle')
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
    await assertNoError(page)
  })

  test('should switch between all tabs without errors', async ({ adminPage: page }) => {
    const tabs = ['dashboard', 'templates', 'history', 'scheduled', 'analytics']
    for (const tab of tabs) {
      await navigateToTab(page, '/reports', tab)
      await assertNoError(page)
    }
  })
})
