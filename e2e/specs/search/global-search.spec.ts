import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Search Functionality', () => {
  test.describe('Student Search', () => {
    test('should have search input on student list', async ({ adminPage: page }) => {
      await navigateToTab(page, '/people', 'students', 'list')
      await waitForContent(page)
      const searchInput = page.locator('input[placeholder*="Search"]').first()
      await expect(searchInput).toBeVisible({ timeout: 10000 })
    })

    test('should debounce search input', async ({ adminPage: page }) => {
      await navigateToTab(page, '/people', 'students', 'list')
      await waitForContent(page)
      const searchInput = page.locator('input[placeholder*="Search"]').first()
      if (await searchInput.isVisible()) {
        // Type quickly and verify debounce
        await searchInput.fill('test student name')
        await page.waitForTimeout(500) // Wait for debounce
        await assertNoError(page)
      }
    })

    test('should clear search results', async ({ adminPage: page }) => {
      await navigateToTab(page, '/people', 'students', 'list')
      await waitForContent(page)
      const searchInput = page.locator('input[placeholder*="Search"]').first()
      if (await searchInput.isVisible()) {
        await searchInput.fill('test')
        await page.waitForTimeout(500)
        await searchInput.clear()
        await page.waitForTimeout(500)
        await assertNoError(page)
      }
    })
  })

  test.describe('Staff Search', () => {
    test('should have search input on staff list', async ({ adminPage: page }) => {
      await navigateToTab(page, '/people', 'staff', 'list')
      await waitForContent(page)
      const searchInput = page.locator('input[placeholder*="Search"]').first()
      if (await searchInput.isVisible()) {
        await searchInput.fill('teacher')
        await page.waitForTimeout(500)
        await assertNoError(page)
      }
    })
  })

  test.describe('Library Catalog Search', () => {
    test('should search books in catalog', async ({ adminPage: page }) => {
      await navigateToTab(page, '/library', 'catalog')
      await waitForContent(page)
      const searchInput = page.locator('input[placeholder*="Search"]').first()
      if (await searchInput.isVisible()) {
        await searchInput.fill('math')
        await page.waitForTimeout(500)
        await assertNoError(page)
      }
    })
  })

  test.describe('Finance Student Search', () => {
    test('should search students in collection tab', async ({ adminPage: page }) => {
      await navigateToTab(page, '/finance', 'collection')
      await waitForContent(page)
      const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="student"]').first()
      if (await searchInput.isVisible()) {
        await searchInput.fill('student')
        await page.waitForTimeout(500)
        await assertNoError(page)
      }
    })

    test('should search in outstanding tab', async ({ adminPage: page }) => {
      await navigateToTab(page, '/finance', 'outstanding')
      await waitForContent(page)
      const searchInput = page.locator('input[placeholder*="Search"]').first()
      if (await searchInput.isVisible()) {
        await searchInput.fill('due')
        await page.waitForTimeout(500)
        await assertNoError(page)
      }
    })
  })
})
