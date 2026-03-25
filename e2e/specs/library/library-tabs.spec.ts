import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Library - Tab Navigation', () => {
  test('should load library page', async ({ adminPage: page }) => {
    await navigateToTab(page, '/library')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display catalog tab with book list', async ({ adminPage: page }) => {
    await navigateToTab(page, '/library', 'catalog')
    await waitForContent(page)
    await assertNoError(page)
    const content = page.locator('text=/catalog|book|title|author|no book/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should have search in catalog', async ({ adminPage: page }) => {
    await navigateToTab(page, '/library', 'catalog')
    await waitForContent(page)
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    await expect(searchInput).toBeVisible({ timeout: 10000 })
  })

  test('should display issued books tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/library', 'issued')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const content = page.locator('text=/issued|book|student|return|no issued/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display reservations tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/library', 'reservations')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display digital library tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/library', 'digital')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display fines tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/library', 'fines')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display scanner tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/library', 'scanner')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display history tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/library', 'history')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should switch between all tabs without errors', async ({ adminPage: page }) => {
    const tabs = ['catalog', 'issued', 'reservations', 'digital', 'fines', 'scanner', 'history']
    for (const tab of tabs) {
      await navigateToTab(page, '/library', tab)
      await assertNoError(page)
    }
  })
})
