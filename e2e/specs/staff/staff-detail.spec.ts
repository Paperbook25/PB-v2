import { test, expect } from '../../fixtures/test-fixtures'

test.describe('Staff Detail', () => {
  test('should navigate to staff detail from list', async ({ adminPage: page }) => {
    await page.goto('/staff')
    await page.waitForTimeout(2000)
    const firstRow = page.locator('tbody tr').first()
    if (await firstRow.isVisible()) {
      await firstRow.click()
      await expect(page).toHaveURL(/\/staff\/[a-z0-9-]+/i, { timeout: 5000 })
    }
  })
})
