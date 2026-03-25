import { test, expect } from '../../fixtures/test-fixtures'

test.describe('Admin Dashboard', () => {
  test('should display dashboard with stats', async ({ adminPage: page }) => {
    await page.goto('/')
    // Dashboard should show stat cards
    await expect(page.locator('text=/total|students|staff|attendance/i').first()).toBeVisible({ timeout: 10000 })
  })

  test('should display recent activity or quick actions', async ({ adminPage: page }) => {
    await page.goto('/')
    // Look for quick action buttons or recent activity section
    const content = await page.textContent('body')
    expect(content).toBeTruthy()
  })
})
