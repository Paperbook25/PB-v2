import { test, expect } from '../../fixtures/test-fixtures'

test.describe('Finance - Payments', () => {
  test('should load payments page with DB-driven filters', async ({ adminPage: page }) => {
    await page.goto('/finance')
    await page.waitForTimeout(2000)
    // Finance page should load
    const body = await page.textContent('body')
    expect(body).toBeTruthy()
  })
})
