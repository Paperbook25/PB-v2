import { test, expect } from '../../fixtures/test-fixtures'
import { assertNoError, assertPageLoaded } from '../../helpers/navigation.helpers'

test.describe('Finance - Specialized Pages', () => {
  test('should load installments page', async ({ adminPage: page }) => {
    await page.goto('/finance/installments')
    await page.waitForLoadState('networkidle')
    await assertPageLoaded(page)
  })

  test('should load discounts page', async ({ adminPage: page }) => {
    await page.goto('/finance/discounts')
    await page.waitForLoadState('networkidle')
    await assertPageLoaded(page)
  })

  test('should load concessions page', async ({ adminPage: page }) => {
    await page.goto('/finance/concessions')
    await page.waitForLoadState('networkidle')
    await assertPageLoaded(page)
  })

  test('should load escalation page', async ({ adminPage: page }) => {
    await page.goto('/finance/escalation')
    await page.waitForLoadState('networkidle')
    await assertPageLoaded(page)
  })

  test('should load online payments page', async ({ adminPage: page }) => {
    await page.goto('/finance/online-payments')
    await page.waitForLoadState('networkidle')
    await assertPageLoaded(page)
  })

  test('parent should access my-fees page', async ({ parentPage: page }) => {
    await page.goto('/finance/my-fees')
    await page.waitForLoadState('networkidle')
    // Parent should see fee dashboard or be redirected to relevant page
    const body = await page.textContent('body')
    expect(body).toBeTruthy()
    await assertNoError(page)
  })
})
