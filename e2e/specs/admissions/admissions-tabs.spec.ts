import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Admissions - Tab Navigation', () => {
  test('should load admissions page', async ({ adminPage: page }) => {
    await navigateToTab(page, '/admissions')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display applications list', async ({ adminPage: page }) => {
    await navigateToTab(page, '/admissions', 'applications')
    await waitForContent(page)
    await assertNoError(page)
    const content = page.locator('text=/application|applicant|no application/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display pipeline tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/admissions', 'pipeline')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display entrance exams tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/admissions', 'entrance-exams')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const content = page.locator('text=/exam|entrance|test|no exam/i').first()
    await expect(content).toBeVisible({ timeout: 10000 })
  })

  test('should display waitlist tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/admissions', 'waitlist')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display communications tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/admissions', 'communications')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display payments tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/admissions', 'payments')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should display analytics tab', async ({ adminPage: page }) => {
    await navigateToTab(page, '/admissions', 'analytics')
    await page.waitForLoadState('networkidle')
    await assertNoError(page)
    const body = await page.textContent('body')
    expect(body!.length).toBeGreaterThan(0)
  })

  test('should switch between all tabs without errors', async ({ adminPage: page }) => {
    const tabs = ['applications', 'pipeline', 'entrance-exams', 'waitlist', 'communications', 'payments', 'analytics']
    for (const tab of tabs) {
      await navigateToTab(page, '/admissions', tab)
      await assertNoError(page)
    }
  })
})
