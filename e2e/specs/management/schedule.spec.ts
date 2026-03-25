import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Management - Schedule', () => {
  test('should load schedule page', async ({ adminPage: page }) => {
    await navigateToTab(page, '/management', 'schedule')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  const subtabs = ['timetables', 'teachers', 'rooms', 'substitutions']

  for (const subtab of subtabs) {
    test(`should load schedule ${subtab} subtab`, async ({ adminPage: page }) => {
      await navigateToTab(page, '/management', 'schedule', subtab)
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })
  }

  test('should display timetable grid or config', async ({ adminPage: page }) => {
    await navigateToTab(page, '/management', 'schedule', 'timetables')
    await waitForContent(page)
    const content = page.locator('text=/timetable|schedule|period|class|no timetable/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display teacher schedule view', async ({ adminPage: page }) => {
    await navigateToTab(page, '/management', 'schedule', 'teachers')
    await waitForContent(page)
    const content = page.locator('text=/teacher|schedule|assign|no teacher/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should switch between all subtabs without errors', async ({ adminPage: page }) => {
    for (const subtab of subtabs) {
      await navigateToTab(page, '/management', 'schedule', subtab)
      await assertNoError(page)
    }
  })
})
