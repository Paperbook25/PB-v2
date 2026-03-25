import { test, expect } from '../../fixtures/test-fixtures'

test.describe('Create Student', () => {
  test('should show dynamic class and section dropdowns in form', async ({ adminPage: page }) => {
    await page.goto('/students/new')
    // Class select should be loaded from DB
    const classSelect = page.locator('button[role="combobox"]:near(:text("Class"))').first()
    await expect(classSelect).toBeVisible({ timeout: 10000 })
    await classSelect.click()
    await expect(page.locator('[role="option"]', { hasText: 'Class 10' })).toBeVisible()
    await expect(page.locator('[role="option"]', { hasText: 'Class 12' })).toBeVisible()
    // Select a class
    await page.locator('[role="option"]', { hasText: 'Class 10' }).click()
    // Section select should now be populated from DB based on selected class
    const sectionSelect = page.locator('button[role="combobox"]:near(:text("Section"))').first()
    await sectionSelect.click()
    await expect(page.locator('[role="option"]').first()).toBeVisible()
  })

  test('should display form validation errors', async ({ adminPage: page }) => {
    await page.goto('/students/new')
    // Submit empty form
    await page.locator('button[type="submit"]').click()
    // Should show validation messages
    await expect(page.locator('text=/required|at least/i').first()).toBeVisible({ timeout: 5000 })
  })
})
