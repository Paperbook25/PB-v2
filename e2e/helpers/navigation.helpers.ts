import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Navigate to a module page with optional tab and subtab query params.
 */
export async function navigateToTab(
  page: Page,
  path: string,
  tab?: string,
  subtab?: string
) {
  const params = new URLSearchParams()
  if (tab) params.set('tab', tab)
  if (subtab) params.set('subtab', subtab)
  const query = params.toString()
  const url = query ? `${path}?${query}` : path
  await page.goto(url)
  await page.waitForLoadState('networkidle')
}

/**
 * Assert no ErrorBoundary or crash screen is showing on the page.
 */
export async function assertNoError(page: Page) {
  const errorBoundary = page.locator('text=/something went wrong|error boundary|unexpected error/i')
  await expect(errorBoundary).not.toBeVisible({ timeout: 3000 }).catch(() => {
    // If visible, the test should know — re-throw with context
    throw new Error('ErrorBoundary or crash screen detected on page')
  })
}

/**
 * Wait for skeleton/loading states to resolve into actual content.
 */
export async function waitForContent(page: Page) {
  // Wait for network to settle
  await page.waitForLoadState('networkidle')
  // Wait for any loading skeletons to disappear
  const skeletons = page.locator('[class*="skeleton"], [data-testid="skeleton"], [class*="animate-pulse"]')
  const count = await skeletons.count()
  if (count > 0) {
    await skeletons.first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {
      // Skeletons may not disappear if there's no data — that's fine
    })
  }
}

/**
 * Assert that the page body has meaningful content (not blank).
 */
export async function assertPageLoaded(page: Page) {
  const body = page.locator('body')
  await expect(body).not.toBeEmpty({ timeout: 10000 })
  await assertNoError(page)
}

/**
 * Click a sidebar navigation link by text.
 */
export async function clickSidebarLink(page: Page, name: string) {
  const link = page.locator(`nav a:has-text("${name}"), [data-testid="sidebar"] a:has-text("${name}")`).first()
  await link.click()
  await page.waitForLoadState('networkidle')
}
