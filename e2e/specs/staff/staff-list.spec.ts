import { test, expect } from '../../fixtures/test-fixtures'

test.describe('Staff List Page', () => {
  test('should load staff list', async ({ adminPage: page }) => {
    await page.goto('/staff')
    await expect(page.locator('text=/staff/i').first()).toBeVisible({ timeout: 10000 })
  })

  test('should have DB-driven department filter', async ({ adminPage: page }) => {
    await page.goto('/staff')
    // Find department filter dropdown
    const deptSelect = page.locator('[role="combobox"]').first()
    await deptSelect.click()
    // Should show departments from database
    await expect(page.locator('[role="option"]:has-text("All Departments")')).toBeVisible()
    await expect(page.locator('[role="option"]:has-text("Mathematics")')).toBeVisible()
  })

  test('should filter staff by department', async ({ adminPage: page }) => {
    await page.goto('/staff')
    const deptSelect = page.locator('[role="combobox"]').first()
    await deptSelect.click()
    await page.locator('[role="option"]:has-text("Mathematics")').click()
    await page.waitForTimeout(500)
    await expect(page.locator('table, [class*="card"]').first()).toBeVisible()
  })
})
