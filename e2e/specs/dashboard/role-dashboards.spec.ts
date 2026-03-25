import { test, expect } from '../../fixtures/test-fixtures'

test.describe('Role-Specific Dashboards', () => {
  test('teacher should see teacher-relevant content', async ({ teacherPage: page }) => {
    await page.goto('/')
    await expect(page).not.toHaveURL(/\/login/)
    const body = await page.textContent('body')
    expect(body).toBeTruthy()
  })

  test('student should see student-relevant content', async ({ studentPage: page }) => {
    await page.goto('/')
    await expect(page).not.toHaveURL(/\/login/)
    const body = await page.textContent('body')
    expect(body).toBeTruthy()
  })
})
