import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Finance - Tab Navigation & Content', () => {
  test('should load finance page with stats cards', async ({ adminPage: page }) => {
    await navigateToTab(page, '/finance')
    await assertNoError(page)
    // Stats cards should show finance overview
    const statsArea = page.locator('text=/collected|pending|overdue|total|revenue/i').first()
    await expect(statsArea).toBeVisible({ timeout: 10000 })
  })

  test('should display collection tab content', async ({ adminPage: page }) => {
    await navigateToTab(page, '/finance', 'collection')
    await assertNoError(page)
    await waitForContent(page)
    // Collection tab should have payment form or recent payments table
    const content = page.locator('text=/collect|payment|receipt|amount/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display outstanding tab with filters', async ({ adminPage: page }) => {
    await navigateToTab(page, '/finance', 'outstanding')
    await assertNoError(page)
    await waitForContent(page)
    // Outstanding tab should have search and filters
    const searchOrFilter = page.locator('input[placeholder*="Search"], [role="combobox"]').first()
    await expect(searchOrFilter).toBeVisible({ timeout: 10000 })
  })

  test('should display fee management tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/finance', 'fee-management')
    await assertNoError(page)
    await waitForContent(page)
    // Fee management should show fee types or structures
    const feeContent = page.locator('text=/fee type|fee structure|tuition|academic/i').first()
    await expect(feeContent).toBeVisible({ timeout: 10000 })
  })

  test('should display expenses tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/finance', 'expenses')
    await assertNoError(page)
    await waitForContent(page)
    // Expenses tab should have add button or expense list
    const expenseContent = page.locator('text=/expense|add|category/i').first()
    await expect(expenseContent).toBeVisible({ timeout: 10000 })
  })

  test('should display ledger tab with balance', async ({ adminPage: page }) => {
    await navigateToTab(page, '/finance', 'ledger')
    await assertNoError(page)
    await waitForContent(page)
    // Ledger should show balance summary or entries table
    const ledgerContent = page.locator('text=/ledger|balance|credit|debit|entry/i').first()
    await expect(ledgerContent).toBeVisible({ timeout: 10000 })
  })

  test('should display reports tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/finance', 'reports')
    await assertNoError(page)
    await waitForContent(page)
    // Reports tab should have charts or report options
    const reportContent = page.locator('text=/report|collection|due|analytics/i').first()
    await expect(reportContent).toBeVisible({ timeout: 10000 })
  })

  test('should switch between all tabs without errors', async ({ adminPage: page }) => {
    const tabs = ['collection', 'outstanding', 'fee-management', 'expenses', 'ledger', 'reports']
    for (const tab of tabs) {
      await navigateToTab(page, '/finance', tab)
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    }
  })
})
