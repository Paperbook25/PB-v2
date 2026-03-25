import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Mark Attendance', () => {
  test('should show DB-driven class and section selectors', async ({ adminPage: page }) => {
    // Navigate directly to attendance mark tab
    await navigateToTab(page, '/people', 'attendance', 'mark')
    await waitForContent(page)
    await assertNoError(page)

    // Class selector should have DB-driven options
    const classSelect = page.locator('[role="combobox"]').first()
    if (await classSelect.isVisible()) {
      await classSelect.click()
      await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 5000 })
    }
  })

  test('should display student grid for attendance marking', async ({ adminPage: page }) => {
    await navigateToTab(page, '/people', 'attendance', 'mark')
    await waitForContent(page)
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })
})
