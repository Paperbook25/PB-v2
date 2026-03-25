import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Exams - Tab Navigation', () => {
  test('should load exams page', async ({ adminPage: page }) => {
    await navigateToTab(page, '/exams')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display exam list', async ({ adminPage: page }) => {
    await navigateToTab(page, '/exams', 'list')
    await waitForContent(page)
    await assertNoError(page)
    const content = page.locator('text=/exam|test|assessment|no exam/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display online exams tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/exams', 'online')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display marks entry tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/exams', 'marks')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const content = page.locator('text=/mark|score|grade|class|subject/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display report cards tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/exams', 'reports')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display grades tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/exams', 'grades')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  const additionalTabs = ['timetable', 'analytics', 'progress', 'co-scholastic', 'question-papers']
  for (const tab of additionalTabs) {
    test(`should load ${tab} page`, async ({ adminPage: page }) => {
      await navigateToTab(page, '/exams', tab)
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })
  }

  test('should switch between all tabs without errors', async ({ adminPage: page }) => {
    const tabs = ['list', 'online', 'marks', 'reports', 'grades', 'timetable', 'analytics', 'progress', 'co-scholastic', 'question-papers']
    for (const tab of tabs) {
      await navigateToTab(page, '/exams', tab)
      await assertNoError(page)
    }
  })
})
