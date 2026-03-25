import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Management - Alumni', () => {
  test('should load alumni page', async ({ adminPage: page }) => {
    await navigateToTab(page, '/management', 'alumni')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  const subtabs = ['directory', 'batches', 'achievements', 'contributions', 'events']

  for (const subtab of subtabs) {
    test(`should load alumni ${subtab} subtab`, async ({ adminPage: page }) => {
      await navigateToTab(page, '/management', 'alumni', subtab)
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })
  }

  test('should display alumni directory', async ({ adminPage: page }) => {
    await navigateToTab(page, '/management', 'alumni', 'directory')
    await waitForContent(page)
    const content = page.locator('text=/alumni|directory|student|batch|no alumni/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display batch management', async ({ adminPage: page }) => {
    await navigateToTab(page, '/management', 'alumni', 'batches')
    await waitForContent(page)
    const content = page.locator('text=/batch|year|class|no batch/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should switch between all subtabs without errors', async ({ adminPage: page }) => {
    for (const subtab of subtabs) {
      await navigateToTab(page, '/management', 'alumni', subtab)
      await assertNoError(page)
    }
  })
})
