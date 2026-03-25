import { test as setup, expect } from '@playwright/test'

const ACCOUNTS = [
  { role: 'admin', email: 'admin@paperbook.in', passwords: ['Demo@123456', 'demo123', 'Admin@123'] },
  { role: 'teacher', email: 'teacher@paperbook.in', passwords: ['Demo@123456', 'demo123'] },
  { role: 'student', email: 'student@paperbook.in', passwords: ['Demo@123456', 'demo123'] },
  { role: 'accountant', email: 'accounts@paperbook.in', passwords: ['Demo@123456', 'demo123'] },
  { role: 'parent', email: 'parent@paperbook.in', passwords: ['Demo@123456', 'demo123'] },
]

for (const account of ACCOUNTS) {
  setup(`authenticate as ${account.role}`, async ({ page }) => {
    for (const password of account.passwords) {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      await page.getByLabel(/email/i).fill(account.email)
      await page.getByLabel(/password/i).fill(password)
      await page.getByRole('button', { name: /sign in/i }).click()

      // Wait for either navigation away from login or error message
      try {
        await expect(page).not.toHaveURL(/\/login/, { timeout: 5000 })
        // Success — save storage state and move on
        await page.context().storageState({ path: `e2e/.auth/${account.role}.json` })
        return
      } catch {
        // Still on login page, try next password
        console.log(`[Auth Setup] ${account.email} failed with password attempt, trying next...`)
      }
    }

    // All passwords failed — fail the test with a clear message
    throw new Error(
      `[Auth Setup] Could not authenticate ${account.email} with any known password. ` +
      `Ensure the account exists in better-auth. Run global setup or create it manually.`
    )
  })
}
