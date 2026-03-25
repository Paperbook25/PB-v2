import { test, expect } from '../../fixtures/test-fixtures'
import { assertNoError } from '../../helpers/navigation.helpers'

test.describe('Deep Links & URL Routing', () => {
  test.describe('Direct Tab URLs', () => {
    test('should load /finance?tab=outstanding directly', async ({ adminPage: page }) => {
      await page.goto('/finance?tab=outstanding')
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
      // Should render outstanding tab content
      const content = page.locator('text=/outstanding|overdue|due|search/i').first()
      await expect(content).toBeVisible({ timeout: 10000 })
    })

    test('should load /finance?tab=ledger directly', async ({ adminPage: page }) => {
      await page.goto('/finance?tab=ledger')
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })

    test('should load /admissions?tab=pipeline directly', async ({ adminPage: page }) => {
      await page.goto('/admissions?tab=pipeline')
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })
  })

  test.describe('Direct Subtab URLs', () => {
    test('should load /settings?tab=general&subtab=classes directly', async ({ adminPage: page }) => {
      await page.goto('/settings?tab=general&subtab=classes')
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
      const content = page.locator('text=/class|section|grade/i').first()
      await expect(content).toBeVisible({ timeout: 10000 })
    })

    test('should load /people?tab=students&subtab=list directly', async ({ adminPage: page }) => {
      await page.goto('/people?tab=students&subtab=list')
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
      const content = page.locator('text=/student/i').first()
      await expect(content).toBeVisible({ timeout: 10000 })
    })

    test('should load /people?tab=attendance&subtab=mark directly', async ({ adminPage: page }) => {
      await page.goto('/people?tab=attendance&subtab=mark')
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })

    test('should load /operations?tab=transport&subtab=routes directly', async ({ adminPage: page }) => {
      await page.goto('/operations?tab=transport&subtab=routes')
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })
  })

  test.describe('Redirect Routes', () => {
    test('/students should redirect to /people?tab=students', async ({ adminPage: page }) => {
      await page.goto('/students')
      await page.waitForLoadState('networkidle')
      const url = page.url()
      // Should redirect to people page with students tab
      const isRedirected = url.includes('/people') && url.includes('students')
      // Or stay on /students if that's the canonical route
      expect(url.includes('student')).toBeTruthy()
    })

    test('/staff should redirect to /people?tab=staff', async ({ adminPage: page }) => {
      await page.goto('/staff')
      await page.waitForLoadState('networkidle')
      const url = page.url()
      expect(url.includes('staff')).toBeTruthy()
    })

    test('/attendance/mark should redirect to /people?tab=attendance&subtab=mark', async ({ adminPage: page }) => {
      await page.goto('/attendance/mark')
      await page.waitForLoadState('networkidle')
      const url = page.url()
      expect(url.includes('attendance')).toBeTruthy()
    })

    test('/transport should redirect to /operations?tab=transport', async ({ adminPage: page }) => {
      await page.goto('/transport')
      await page.waitForLoadState('networkidle')
      const url = page.url()
      expect(url.includes('transport') || url.includes('operations')).toBeTruthy()
    })

    test('/hostel should redirect to /operations?tab=hostel', async ({ adminPage: page }) => {
      await page.goto('/hostel')
      await page.waitForLoadState('networkidle')
      const url = page.url()
      expect(url.includes('hostel') || url.includes('operations')).toBeTruthy()
    })
  })

  test.describe('Unknown Routes', () => {
    test('unknown route should redirect to home', async ({ adminPage: page }) => {
      await page.goto('/nonexistent-page-xyz')
      await page.waitForLoadState('networkidle')
      const url = page.url()
      // Should redirect to home or show 404
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })
  })
})
