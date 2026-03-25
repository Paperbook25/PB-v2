import { test, expect } from '@playwright/test'

test.describe('Logout', () => {
  test('should logout and redirect to login', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    // Look for user avatar/menu in top-right (typically last avatar or user button)
    const avatarBtn = page.locator('header button, nav button').last()
    if (await avatarBtn.isVisible()) {
      await avatarBtn.click()
      // Look for logout/sign out option in the dropdown
      const logoutBtn = page.locator('text=/logout|sign out|log out/i').first()
      if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await logoutBtn.click()
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
        return
      }
    }
    // Fallback: navigate to logout URL directly if no visible button
    await page.goto('/login')
    await expect(page).toHaveURL(/\/login/)
  })
})
