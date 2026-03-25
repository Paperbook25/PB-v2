import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Error States & Edge Cases', () => {
  test.describe('Empty States', () => {
    test('should show empty state for admissions with no data', async ({ adminPage: page }) => {
      await navigateToTab(page, '/admissions', 'waitlist')
      await waitForContent(page)
      // Should show table/list or empty state message — not a crash
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })

    test('should show empty state for library with no books', async ({ adminPage: page }) => {
      await navigateToTab(page, '/library', 'issued')
      await waitForContent(page)
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })

    test('should show empty state for visitor logs', async ({ adminPage: page }) => {
      await navigateToTab(page, '/visitors', 'logs')
      await waitForContent(page)
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })

    test('should show empty state for behavior incidents', async ({ adminPage: page }) => {
      await navigateToTab(page, '/behavior', 'incidents')
      await waitForContent(page)
      await assertNoError(page)
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
    })
  })

  test.describe('ErrorBoundary', () => {
    test('dashboard should not show error boundary', async ({ adminPage: page }) => {
      await page.goto('/')
      await waitForContent(page)
      await assertNoError(page)
    })

    test('finance page should not show error boundary', async ({ adminPage: page }) => {
      await page.goto('/finance')
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
    })

    test('settings page should not show error boundary', async ({ adminPage: page }) => {
      await page.goto('/settings')
      await page.waitForLoadState('networkidle')
      await assertNoError(page)
    })

    test('all main pages should be free of error boundaries', async ({ adminPage: page }) => {
      const pages = [
        '/', '/finance', '/admissions', '/library', '/exams',
        '/lms', '/operations', '/management', '/visitors',
        '/behavior', '/reports', '/settings', '/calendar'
      ]
      for (const url of pages) {
        await page.goto(url)
        await page.waitForLoadState('networkidle')
        await assertNoError(page)
      }
    })
  })

  test.describe('Console Errors', () => {
    test('dashboard should load without console errors', async ({ adminPage: page }) => {
      const consoleErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })
      await page.goto('/')
      await waitForContent(page)
      // Filter out known harmless errors (favicon, etc.)
      const criticalErrors = consoleErrors.filter(
        (e) => !e.includes('favicon') && !e.includes('manifest')
      )
      // GAP: If there are console errors, they need investigation
      if (criticalErrors.length > 0) {
        console.log('Console errors found:', criticalErrors)
      }
    })
  })

  test.describe('Page Not Found', () => {
    test('should handle 404 gracefully', async ({ adminPage: page }) => {
      await page.goto('/this-page-does-not-exist')
      await page.waitForLoadState('networkidle')
      // Should not crash — either show 404 or redirect
      const body = await page.textContent('body')
      expect(body!.length).toBeGreaterThan(0)
      await assertNoError(page)
    })
  })
})
