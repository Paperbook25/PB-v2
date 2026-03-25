import { test, expect } from '../../fixtures/test-fixtures'

test.describe('Finance - Fee Types', () => {
  test('should load finance page', async ({ adminPage: page }) => {
    await page.goto('/finance')
    await page.waitForTimeout(2000)
    const body = await page.textContent('body')
    expect(body).toBeTruthy()
  })
})
