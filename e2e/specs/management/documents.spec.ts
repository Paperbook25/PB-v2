import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Management - Documents', () => {
  test('should load documents page', async ({ adminPage: page }) => {
    await navigateToTab(page, '/management', 'docs')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  const subtabs = ['browse', 'starred', 'recent']

  for (const subtab of subtabs) {
    test(`should load documents ${subtab} subtab`, async ({ adminPage: page }) => {
      await navigateToTab(page, '/management', 'docs', subtab)
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })
  }

  test('should display document browser', async ({ adminPage: page }) => {
    await navigateToTab(page, '/management', 'docs', 'browse')
    await waitForContent(page)
    const content = page.locator('text=/document|file|folder|upload|no document/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display starred documents', async ({ adminPage: page }) => {
    await navigateToTab(page, '/management', 'docs', 'starred')
    await waitForContent(page)
    const content = page.locator('text=/starred|favorite|no starred|no document/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should switch between all subtabs without errors', async ({ adminPage: page }) => {
    for (const subtab of subtabs) {
      await navigateToTab(page, '/management', 'docs', subtab)
      await assertNoError(page)
    }
  })
})
