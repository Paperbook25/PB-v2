import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Attendance Reports', () => {
  test('should load attendance report with DB-driven filters', async ({ adminPage: page }) => {
    // Navigate directly to attendance reports tab
    await navigateToTab(page, '/people', 'attendance', 'reports')
    await waitForContent(page)
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })
})
