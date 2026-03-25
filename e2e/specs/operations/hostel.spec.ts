import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Operations - Hostel', () => {
  test('should load hostel page', async ({ adminPage: page }) => {
    await navigateToTab(page, '/operations', 'hostel')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  const subtabs = ['dashboard', 'rooms', 'allocations', 'fees', 'mess', 'attendance']

  for (const subtab of subtabs) {
    test(`should load hostel ${subtab} subtab`, async ({ adminPage: page }) => {
      await navigateToTab(page, '/operations', 'hostel', subtab)
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })
  }

  test('should display rooms list', async ({ adminPage: page }) => {
    await navigateToTab(page, '/operations', 'hostel', 'rooms')
    await waitForContent(page)
    const content = page.locator('text=/room|block|floor|capacity|no room/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display allocations management', async ({ adminPage: page }) => {
    await navigateToTab(page, '/operations', 'hostel', 'allocations')
    await waitForContent(page)
    const content = page.locator('text=/allocat|student|room|assign|no allocat/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should switch between all subtabs without errors', async ({ adminPage: page }) => {
    for (const subtab of subtabs) {
      await navigateToTab(page, '/operations', 'hostel', subtab)
      await assertNoError(page)
    }
  })
})
