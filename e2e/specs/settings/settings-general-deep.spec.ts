import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Settings - General (Deep)', () => {
  test('should load settings page', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  const generalSubtabs = [
    'school', 'academic', 'calendar', 'classes', 'users',
    'templates', 'notifications', 'audit', 'backup', 'appearance'
  ]

  for (const subtab of generalSubtabs) {
    test(`should load general/${subtab} subtab`, async ({ adminPage: page }) => {
      await navigateToTab(page, '/settings', 'general', subtab)
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })
  }

  test('should display school profile with editable fields', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'general', 'school')
    await waitForContent(page)
    const content = page.locator('text=/school|name|address|phone|email/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display academic year settings', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'general', 'academic')
    await waitForContent(page)
    const content = page.locator('text=/academic|year|session|current/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display classes/sections management', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'general', 'classes')
    await waitForContent(page)
    const content = page.locator('text=/class|section|add|grade|no class/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should have add class button', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'general', 'classes')
    await waitForContent(page)
    const addButton = page.locator('button:has-text("Add"), button:has-text("New"), button:has-text("Create")').first()
    await expect(addButton).toBeVisible({ timeout: 10000 })
  })

  test('should display user list', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'general', 'users')
    await waitForContent(page)
    const content = page.locator('text=/user|name|email|role|no user/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display notification settings', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'general', 'notifications')
    await waitForContent(page)
    const content = page.locator('text=/notification|alert|email|sms|push/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display audit log', async ({ adminPage: page }) => {
    await navigateToTab(page, '/settings', 'general', 'audit')
    await waitForContent(page)
    const content = page.locator('text=/audit|log|action|user|no log/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should switch between all general subtabs without errors', async ({ adminPage: page }) => {
    for (const subtab of generalSubtabs) {
      await navigateToTab(page, '/settings', 'general', subtab)
      await assertNoError(page)
    }
  })
})
