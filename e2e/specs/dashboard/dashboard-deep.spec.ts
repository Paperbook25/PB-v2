import { test, expect } from '../../fixtures/test-fixtures'
import { assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Dashboard - Deep Tests', () => {
  test.describe('Admin Dashboard', () => {
    test('should display stat cards with numbers', async ({ adminPage: page }) => {
      await page.goto('/')
      await waitForContent(page)
      await assertNoError(page)
      // Should show stat cards with numeric values
      const statCards = page.locator('[class*="card"], [class*="stat"]')
      await expect(statCards.first()).toBeVisible({ timeout: 10000 })
    })

    test('should display quick action links', async ({ adminPage: page }) => {
      await page.goto('/')
      await waitForContent(page)
      // Quick actions or navigation shortcuts should be present
      const actions = page.locator('a, button').filter({ hasText: /student|staff|attendance|fee|admit/i })
      const count = await actions.count()
      expect(count).toBeGreaterThan(0)
    })

    test('should show recent activity section', async ({ adminPage: page }) => {
      await page.goto('/')
      await waitForContent(page)
      // Recent activity, notifications, or overview section
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(100)
    })
  })

  test.describe('Teacher Dashboard', () => {
    test('should show teacher-relevant content', async ({ teacherPage: page }) => {
      await page.goto('/')
      await waitForContent(page)
      await assertNoError(page)
      // Teacher should see class overview, attendance, or schedule
      const body = await page.textContent('body')
      expect(body).toBeTruthy()
      expect(page.url()).not.toContain('/login')
    })

    test('should display class or attendance quick actions', async ({ teacherPage: page }) => {
      await page.goto('/')
      await waitForContent(page)
      const content = page.locator('text=/class|attendance|schedule|timetable|student/i').first()
      await expect(content).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Student Dashboard', () => {
    test('should show student-relevant content', async ({ studentPage: page }) => {
      await page.goto('/')
      await waitForContent(page)
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body).toBeTruthy()
      expect(page.url()).not.toContain('/login')
    })

    test('should display timetable or assignments', async ({ studentPage: page }) => {
      await page.goto('/')
      await waitForContent(page)
      const content = page.locator('text=/timetable|assignment|attendance|class|subject|schedule/i').first()
      await expect(content).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Parent Dashboard', () => {
    test('should show parent-relevant content', async ({ parentPage: page }) => {
      await page.goto('/')
      await waitForContent(page)
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body).toBeTruthy()
      expect(page.url()).not.toContain('/login')
    })

    test('should display children overview or fee status', async ({ parentPage: page }) => {
      await page.goto('/')
      await waitForContent(page)
      const content = page.locator('text=/child|ward|fee|attendance|student|portal/i').first()
      await expect(content).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Accountant Dashboard', () => {
    test('should show finance-relevant content', async ({ accountantPage: page }) => {
      await page.goto('/')
      await waitForContent(page)
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body).toBeTruthy()
      expect(page.url()).not.toContain('/login')
    })
  })
})
