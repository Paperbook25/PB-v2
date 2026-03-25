# E2E Testing with Playwright

## Prerequisites

- Node.js 18+
- PostgreSQL running with seeded database
- Backend server (port 3001) and frontend dev server (port 5173)

## Setup

```bash
# Install dependencies (from project root)
npm install

# Install Playwright browsers
npx playwright install chromium

# Seed the database
npm run db:seed
```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with browser visible
npm run test:e2e:headed

# Run with Playwright UI (interactive)
npm run test:e2e:ui

# Run a specific test file
npx playwright test e2e/specs/auth/login.spec.ts

# Debug a specific test
npm run test:e2e:debug
```

## Viewing Reports

```bash
# Open HTML report with screenshots
npm run test:e2e:report
```

Reports are saved to `playwright-report/`. JSON results to `test-results/results.json`.

## Debugging Failures

1. **Screenshots**: Automatically captured on test failure in `test-results/`
2. **Videos**: Retained on failure when configured (default: `retain-on-failure`)
3. **Traces**: Use `npx playwright show-trace test-results/<test>/trace.zip` to view step-by-step execution
4. **Debug mode**: `npm run test:e2e:debug` opens the Playwright inspector

## Directory Structure

```
e2e/
  .auth/              # Saved authentication states per role
  fixtures/           # Test fixtures (role-specific pages)
  helpers/            # API helpers, selectors, screenshot utils
  setup/
    global.setup.ts   # DB seed before test suite
    auth.setup.ts     # Login and save storage state per role
  specs/
    auth/             # Login, logout, session tests
    dashboard/        # Admin and role-specific dashboards
    settings/         # Classes, subjects, school profile
    students/         # Student list, create, detail
    staff/            # Staff list, detail, department filters
    attendance/       # Mark attendance, reports
    finance/          # Fee types, payments
    data-integrity/   # Verify dropdowns use DB data, not hardcoded
```

## Authentication

Tests use pre-saved storage states from `e2e/.auth/`. The `auth.setup.ts` project runs first and logs in as each role (admin, teacher, student, accountant, parent), saving the browser state for reuse by all other tests.

## Configuration

See `playwright.config.ts` in the project root for:
- `screenshot: 'only-on-failure'` - auto-capture on failures
- `video: 'retain-on-failure'` - video retained for failed tests
- `trace: 'retain-on-failure'` - trace files for debugging
- `webServer` - auto-starts backend (3001) and frontend (5173)
