import { test, expect } from '../../fixtures/test-fixtures'

test.describe('Student Detail Page', () => {
  test('should navigate to student detail from list', async ({ adminPage: page }) => {
    await page.goto('/students')
    // Wait for student list to load
    await page.waitForTimeout(2000)
    // Click on the first student row
    const firstRow = page.locator('tbody tr').first()
    if (await firstRow.isVisible()) {
      await firstRow.click()
      // Should navigate to detail page
      await expect(page).toHaveURL(/\/students\/[a-z0-9-]+/i, { timeout: 5000 })
    }
  })
})
