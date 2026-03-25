import { test, expect } from '@playwright/test'

test.describe('Session Persistence', () => {
  test('should maintain session across page navigation', async ({ page }) => {
    await page.goto('/')
    await expect(page).not.toHaveURL(/\/login/)

    // Navigate to another page and back
    await page.goto('/students')
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('should redirect to login when not authenticated', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await context.newPage()
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
    await context.close()
  })
})
