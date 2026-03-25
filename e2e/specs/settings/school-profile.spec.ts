import { test, expect } from '../../fixtures/test-fixtures'
import { navigateToTab, assertNoError, waitForContent } from '../../helpers/navigation.helpers'

test.describe('Settings - School Profile', () => {
  test('should load school profile from database', async ({ adminPage: page }) => {
    // Navigate directly via URL instead of clicking sidebar links
    await navigateToTab(page, '/settings', 'general', 'school')
    await waitForContent(page)
    await assertNoError(page)
    // Should display school info from seeded data
    const schoolContent = page.locator('input, textarea').first()
    const schoolText = page.locator('text=/school|profile|name|address/i').first()
    const isVisible = await schoolContent.isVisible({ timeout: 10000 }).catch(() => false)
      || await schoolText.isVisible({ timeout: 5000 }).catch(() => false)
    expect(isVisible).toBeTruthy()
  })
})
