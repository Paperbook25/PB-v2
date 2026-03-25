import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('LMS - Tab Navigation', () => {
  test('should load LMS dashboard', async ({ adminPage: page }) => {
    await navigateToTab(page, '/lms')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display courses tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/lms', 'courses')
    await waitForContent(page)
    await assertNoError(page)
    const content = page.locator('text=/course|no course|create|add/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display live classes tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/lms', 'live-classes')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display enrollments tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/lms', 'enrollments')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display assignments tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/lms', 'assignments')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const content = page.locator('text=/assignment|task|homework|no assignment/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display question bank tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/lms', 'question-bank')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should switch between all tabs without errors', async ({ adminPage: page }) => {
    const tabs = ['courses', 'live-classes', 'enrollments', 'assignments', 'question-bank']
    for (const tab of tabs) {
      await navigateToTab(page, '/lms', tab)
      await assertNoError(page)
    }
  })
})
