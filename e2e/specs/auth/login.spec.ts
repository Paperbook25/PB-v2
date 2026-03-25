import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test.use({ storageState: { cookies: [], origins: [] } }) // No auth

  test('should display login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('admin@paperbook.in')
    await page.getByLabel(/password/i).fill('demo123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('wrong@email.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()
    // Should remain on login page or show error
    await expect(page.locator('text=/invalid|error|incorrect|failed/i')).toBeVisible({ timeout: 5000 })
  })

  test('should have demo account buttons or Google login', async ({ page }) => {
    await page.goto('/login')
    // Look for demo/quick login buttons OR alternative sign-in options
    const demoButtons = page.locator('button:has-text("Admin"), button:has-text("Teacher"), button:has-text("Student")')
    const googleButton = page.locator('button:has-text("Google"), button:has-text("Continue with")')
    const count = await demoButtons.count() + await googleButton.count()
    // At minimum, Google sign-in or demo buttons should exist
    expect(count).toBeGreaterThan(0)
  })
})
