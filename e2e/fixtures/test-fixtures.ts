import { test as base, expect, type Page } from '@playwright/test'
import path from 'path'

// Role-specific test fixtures
type RoleFixtures = {
  adminPage: Page
  teacherPage: Page
  studentPage: Page
  accountantPage: Page
  parentPage: Page
}

export const test = base.extend<RoleFixtures>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.resolve('e2e/.auth/admin.json'),
    })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
  teacherPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.resolve('e2e/.auth/teacher.json'),
    })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
  studentPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.resolve('e2e/.auth/student.json'),
    })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
  accountantPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.resolve('e2e/.auth/accountant.json'),
    })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
  parentPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: path.resolve('e2e/.auth/parent.json'),
    })
    const page = await context.newPage()
    await use(page)
    await context.close()
  },
})

export { expect }
