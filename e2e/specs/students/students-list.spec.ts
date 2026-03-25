import { test, expect } from '../../fixtures/test-fixtures'

test.describe('Students List Page', () => {
  test('should load student list', async ({ adminPage: page }) => {
    await page.goto('/students')
    // Should show student table or cards
    await expect(page.locator('text=/students/i').first()).toBeVisible({ timeout: 10000 })
  })

  test('should have DB-driven class filter dropdown', async ({ adminPage: page }) => {
    await page.goto('/students')
    // Click on class filter dropdown
    const classSelect = page.locator('[role="combobox"]').first()
    await classSelect.click()
    // Should show classes from database (All Classes + Class 1-12)
    await expect(page.locator('[role="option"]', { hasText: 'All Classes' })).toBeVisible()
    await expect(page.locator('[role="option"]', { hasText: 'Class 10' })).toBeVisible()
  })

  test('should filter students by class', async ({ adminPage: page }) => {
    await page.goto('/students')
    const classSelect = page.locator('[role="combobox"]').first()
    await classSelect.click()
    await page.locator('[role="option"]', { hasText: 'Class 10' }).click()
    // Wait for filtered results
    await page.waitForTimeout(500)
    // Page should still be functional
    await expect(page.locator('table, [class*="card"]').first()).toBeVisible()
  })
})
