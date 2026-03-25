import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Visitors Management', () => {
  test('should load visitors dashboard', async ({ adminPage: page }) => {
    await navigateToTab(page, '/visitors')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display visitors dashboard tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/visitors', 'dashboard')
    await waitForContent(page)
    await assertNoError(page)
    const content = page.locator('text=/visitor|today|total|check-in|no visitor/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display visitor logs tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/visitors', 'logs')
    await waitForContent(page)
    await assertNoError(page)
    const content = page.locator('text=/log|visitor|name|time|no log/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display visitor log table', async ({ adminPage: page }) => {
    await navigateToTab(page, '/visitors', 'logs')
    await waitForContent(page)
    const table = page.locator('table, [class*="card"]').first()
    await expect(table).toBeVisible({ timeout: 10000 })
  })

  test('should display pre-approved visitors tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/visitors', 'preapproved')
    await waitForContent(page)
    await assertNoError(page)
    const content = page.locator('text=/pre-approved|approved|schedule|no pre-approved/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display reports tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/visitors', 'reports')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should switch between all tabs without errors', async ({ adminPage: page }) => {
    const tabs = ['dashboard', 'logs', 'preapproved', 'reports']
    for (const tab of tabs) {
      await navigateToTab(page, '/visitors', tab)
      await assertNoError(page)
    }
  })
})
