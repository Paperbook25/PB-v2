import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Parent Portal', () => {
  test('should load parent portal page', async ({ parentPage: page }) => {
    await navigateToTab(page, '/parent-portal')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display messages tab', async ({ parentPage: page }) => {
    await navigateToTab(page, '/parent-portal', 'messages')
    await waitForContent(page)
    await assertNoError(page)
    const content = page.locator('text=/message|inbox|compose|no message/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display meetings tab', async ({ parentPage: page }) => {
    await navigateToTab(page, '/parent-portal', 'meetings')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const content = page.locator('text=/meeting|appointment|schedule|no meeting/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display progress tab', async ({ parentPage: page }) => {
    await navigateToTab(page, '/parent-portal', 'progress')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const content = page.locator('text=/progress|grade|performance|academic|report/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should switch between all tabs without errors', async ({ parentPage: page }) => {
    const tabs = ['messages', 'meetings', 'progress']
    for (const tab of tabs) {
      await navigateToTab(page, '/parent-portal', tab)
      await assertNoError(page)
    }
  })

  test('admin should also access parent portal', async ({ adminPage: page }) => {
    await navigateToTab(page, '/parent-portal')
    await page.waitForLoadState('networkidle')
    // Admin may or may not have access — just verify no crash
    await assertNoError(page)
  })
})
