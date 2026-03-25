import type { Page } from '@playwright/test'
import path from 'path'

/**
 * Take a manual screenshot for documentation purposes.
 * Playwright automatically captures screenshots on failure via config.
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: path.join('test-results', 'screenshots', `${name}.png`),
    fullPage: true,
  })
}

/**
 * Wait for page to be fully loaded (no pending network requests).
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle')
}
