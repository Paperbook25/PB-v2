# Paperbook Platform — Issue Tracker

> Tracked issues from code reviews, architecture planning, and implementation progress.
> Last updated: 2026-02-27

---

## Legend

| Priority | Meaning |
|----------|---------|
| **P0** | Critical — blocks release, security vulnerability, or data loss risk |
| **P1** | High — significant bug or missing functionality |
| **P2** | Medium — improvement, hardening, or missing best practice |
| **P3** | Low — nice-to-have, optimization, or cosmetic |

| Status | Meaning |
|--------|---------|
| `[x]` | Done |
| `[ ]` | Open |
| `[~]` | In Progress |

---

## P0 — Critical (Fixed)

- [x] **TENANT-001**: `requireTenant` middleware was never applied to school-facing routes — data leaks across schools
  - **Fix**: Applied `requireTenant` to all routes in `apps/server/src/routes/index.ts` except auth/public/admin/health
- [x] **TENANT-002**: Cross-org enforcement was empty — any authenticated user could access any school's data
  - **Fix**: `requireTenant` now checks JWT `organizationId` (fast path) with DB `OrgMember` lookup fallback
- [x] **TENANT-003**: `getSchoolUsers()` returned ALL users system-wide (unscoped query)
  - **Fix**: Now queries via `prisma.orgMember.findMany({ where: { organizationId } })` with user relation
- [x] **TENANT-004**: `getSchool()` stats (`userCount`) counted all users globally
  - **Fix**: Now uses `prisma.orgMember.count({ where: { organizationId: id } })`
- [x] **SEC-001**: No security headers (Helmet) on any response
  - **Fix**: Added `helmet()` middleware in `apps/server/src/index.ts`
- [x] **SEC-002**: No rate limiting on auth or public endpoints
  - **Fix**: Added `express-rate-limit` — auth: 20 req/15min, public: 100 req/15min
- [x] **SEC-003**: Admin school endpoints accepted arbitrary JSON without validation
  - **Fix**: Added Zod schemas (`createSchoolSchema`, `updateSchoolSchema`, `listSchoolsSchema`) in controller
- [x] **SEC-004**: `sortBy` parameter allowed SQL injection via arbitrary column names
  - **Fix**: Added `SCHOOL_SORT_FIELDS` and `USER_SORT_FIELDS` whitelists in services
- [x] **SEC-005**: Audit logs recorded raw passwords in request body
  - **Fix**: Added `sanitizeBody()` in `audit.middleware.ts` that redacts sensitive fields
- [x] **SEC-006**: Public tenant resolution endpoint leaked internal organization `id`
  - **Fix**: Removed `id` from response in `tenant.routes.ts`, removed from `TenantOrg` interface
- [x] **ADMIN-001**: Admin app crashed on load — missing `QueryClientProvider`
  - **Fix**: Added `QueryClientProvider` wrapper in `apps/admin/src/App.tsx`
- [x] **ADMIN-002**: Entire admin API layer used `any` types — no type safety
  - **Fix**: Created `apps/admin/src/lib/types.ts` with 15+ TypeScript interfaces
- [x] **TS-001**: Multiple TypeScript compilation errors across server, school, and admin apps
  - **Fix**: Fixed `Organization.create` missing `id`, `OrgMember.create` missing `id`, Express v5 `req.params` type, Designation `title` vs `name`, `import.meta.env` types, frontend type mismatches

---

## P1 — High (Open)

- [ ] **AUTH-001**: School app auth store doesn't validate session on startup
  - **Where**: `apps/school/src/stores/useAuthStore.ts`
  - **What**: On page refresh, the store rehydrates from localStorage without checking if the server session is still valid. Expired/revoked sessions appear logged-in until the first API call fails.
  - **Fix**: Add `checkSession()` call on app mount (similar to what was added in admin store).

- [ ] **AUTH-002**: Tokens stored in localStorage are vulnerable to XSS
  - **Where**: `apps/school/src/stores/useAuthStore.ts`
  - **What**: Access/refresh tokens in localStorage can be stolen by any XSS. better-auth uses httpOnly cookies by default — the custom JWT flow should be migrated to use session cookies exclusively.
  - **Fix**: Phase out custom JWT tokens; rely on better-auth session cookies for school app.

- [ ] **TENANT-005**: Tenant-scoped models (Student, Staff, Class, Section, etc.) don't have a `schoolId` foreign key
  - **Where**: `apps/server/prisma/schema.prisma`
  - **What**: Multi-tenancy requires every tenant-scoped table to have a `schoolId` column for data isolation. Currently, the models use `SchoolProfile.findFirst()` (single-tenant pattern).
  - **Fix**: Add `schoolId` column to all tenant-scoped models, create migration, update all services to filter by `req.schoolId`.

- [ ] **TENANT-006**: Existing school-level services still use `findFirst()` instead of scoping by `schoolId`
  - **Where**: All services in `apps/server/src/services/` (student, staff, attendance, finance, timetable, etc.)
  - **What**: Even with `requireTenant` middleware, queries inside services don't filter by `schoolId`. A compromised middleware bypass would expose cross-tenant data.
  - **Fix**: Update every service to include `where: { schoolId: req.schoolId }` in queries.

- [ ] **UI-001**: No confirmation dialogs for destructive admin actions
  - **Where**: `apps/admin/src/features/schools/pages/SchoolsPage.tsx`, `SchoolDetailPage.tsx`, `UsersPage.tsx`
  - **What**: Suspend, delete, and ban actions execute immediately on click with no confirmation step.
  - **Fix**: Add confirmation dialogs before `suspendSchool`, `deleteSchool`, `banUser` mutations.

- [ ] **UI-002**: Missing accessibility — no focus traps, keyboard navigation, or ARIA attributes
  - **Where**: `apps/admin/src/` — all pages and components
  - **What**: Modals, dropdowns, and navigation lack `role`, `aria-label`, keyboard handlers, and focus management.
  - **Fix**: Add ARIA attributes to interactive elements, implement focus trap in dialogs, add keyboard navigation.

- [ ] **API-001**: School creation doesn't validate unique email for admin user
  - **Where**: `apps/server/src/services/admin-school.service.ts` `createSchool()`
  - **What**: If `adminEmail` already exists in the `User` table, the transaction fails with an opaque Prisma unique constraint error instead of a friendly message.
  - **Fix**: Check `prisma.user.findUnique({ where: { email } })` before creating, return 409 if exists.

- [ ] **API-002**: Missing pagination on `getSchoolUsers()` and `getSchoolAddons()`
  - **Where**: `apps/server/src/services/admin-school.service.ts`
  - **What**: These endpoints return all records with no pagination. Schools with hundreds of users will return very large payloads.
  - **Fix**: Add `page` and `limit` params with defaults.

---

## P2 — Medium (Open)

- [ ] **SEC-007**: Password complexity requirements not enforced on server
  - **Where**: `apps/server/src/controllers/admin-school.controller.ts` (`createSchoolSchema`)
  - **What**: `adminPassword` only requires `min(8)`. No uppercase, lowercase, digit, or special char requirements.
  - **Fix**: Add regex validation: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/`

- [ ] **SEC-008**: No request IDs or correlation IDs for tracing
  - **Where**: `apps/server/src/index.ts`
  - **What**: API responses have no `X-Request-ID` header. Logs can't be correlated to specific requests.
  - **Fix**: Add middleware that generates UUID per request, attaches to `req` and response header.

- [ ] **PERF-001**: Dashboard `getGrowth()` makes 26 sequential DB queries
  - **Where**: `apps/server/src/services/admin-dashboard.service.ts`
  - **What**: Loops through 26 months, each with its own `prisma.schoolProfile.count()`. Should use a single aggregation query.
  - **Fix**: Use `GROUP BY` with `DATE_TRUNC` for a single query.

- [ ] **PERF-002**: Tenant cache is in-memory — doesn't work across multiple server instances
  - **Where**: `apps/server/src/middleware/tenant.middleware.ts`
  - **What**: The `Map<string, ...>` cache is per-process. With horizontal scaling, cache eviction on one instance doesn't affect others.
  - **Fix**: Use Redis for tenant cache when `REDIS_URL` is available.

- [ ] **UI-003**: Dashboard charts don't respect dark mode
  - **Where**: `apps/admin/src/features/dashboard/pages/DashboardPage.tsx`
  - **What**: Recharts colors are hardcoded. In dark mode, chart backgrounds and grid lines may be invisible.
  - **Fix**: Use CSS variables or theme-aware colors for Recharts components.

- [ ] **UI-004**: No loading/error states on school detail tabs
  - **Where**: `apps/admin/src/features/schools/pages/SchoolDetailPage.tsx`
  - **What**: Users and addons tabs don't show loading spinners or error messages independently.
  - **Fix**: Add per-tab loading and error states.

- [ ] **API-003**: No audit logging for admin actions (create, suspend, delete school)
  - **Where**: `apps/server/src/services/admin-school.service.ts`
  - **What**: Admin CRUD operations don't create audit log entries. Critical for compliance.
  - **Fix**: Add `prisma.auditLog.create()` calls in `createSchool`, `suspendSchool`, `activateSchool`, `deleteSchool`.

- [ ] **API-004**: No webhooks or events for school lifecycle changes
  - **Where**: `apps/server/src/services/admin-school.service.ts`
  - **What**: When a school is suspended/activated/deleted, there's no mechanism to notify external systems or trigger workflows.
  - **Fix**: Implement event emitter pattern for school lifecycle events.

- [ ] **DOCKER-001**: Docker Compose setup not tested end-to-end
  - **Where**: `docker-compose.yml`, `docker/Dockerfile.*`
  - **What**: Docker files were created but never tested. May have path, build, or networking issues.
  - **Fix**: Run `docker compose up` and verify all services start correctly.

---

## P3 — Low (Open)

- [ ] **UI-005**: Admin sidebar doesn't highlight active route
  - **Where**: `apps/admin/src/components/layout/AdminSidebar.tsx`
  - **What**: Navigation items don't show active state based on current URL.
  - **Fix**: Use `useLocation()` to apply active class.

- [ ] **UI-006**: No empty states for tables
  - **Where**: All admin list pages
  - **What**: When no data exists, tables show a blank area instead of a helpful empty state with call-to-action.
  - **Fix**: Add empty state components with "Create your first school" / "No users yet" messages.

- [ ] **UI-007**: Mobile responsive layout not fully implemented for admin portal
  - **Where**: `apps/admin/src/components/layout/AdminShell.tsx`
  - **What**: Sidebar doesn't collapse to hamburger menu on mobile.
  - **Fix**: Add mobile sidebar toggle with slide-out drawer.

- [ ] **API-005**: Health check endpoint missing
  - **Where**: `apps/server/src/routes/index.ts`
  - **What**: No `/api/health` endpoint for load balancer or Docker health checks.
  - **Fix**: Add basic health check returning `{ status: 'ok', db: 'connected', uptime: ... }`.

- [ ] **API-006**: No API rate limiting per school/organization
  - **Where**: `apps/server/src/index.ts`
  - **What**: Rate limits are per-IP only. A single school with many users shares the same limit.
  - **Fix**: Add rate limiting keyed by `req.schoolId` for school-facing routes.

- [ ] **INFRA-001**: CI/CD pipeline not configured
  - **Where**: `.github/workflows/`
  - **What**: No GitHub Actions for lint, type-check, test, or deploy.
  - **Fix**: Add workflow files for PR checks and deployment.

- [ ] **INFRA-002**: No database seeding script for development
  - **Where**: `apps/server/prisma/seed.ts`
  - **What**: New developers need sample data. No seed script with demo schools, users, addons.
  - **Fix**: Create seed script with 2-3 demo schools, admin users, and sample data.

- [ ] **TEST-001**: No test coverage for any admin endpoints
  - **Where**: `apps/server/src/`
  - **What**: Admin school, addon, user, and dashboard services have zero test coverage.
  - **Fix**: Add unit tests for services and integration tests for API routes.

- [ ] **TEST-002**: No E2E test for school creation flow
  - **What**: The critical path (super admin creates school -> school accessible via subdomain -> school admin can log in) has no automated test.
  - **Fix**: Add Playwright/Cypress E2E test for the full flow.

---

## Feature Backlog

- [ ] **FEAT-001**: Impersonation (better-auth admin plugin)
  - Super admin can impersonate any school user. Requires `adminClient` plugin on server + admin portal integration.

- [ ] **FEAT-002**: Google OAuth for school login
  - better-auth Google social provider is configured but school login page hasn't added the OAuth button.

- [ ] **FEAT-003**: Audit log page in admin portal
  - Backend endpoints exist (`/api/admin/audit`) but the page needs real data integration.

- [ ] **FEAT-004**: School onboarding wizard
  - After school creation, guide the school admin through initial setup (classes, sections, staff import).

- [ ] **FEAT-005**: Addon marketplace with tier-based availability
  - Addons should only be available based on the school's plan tier (free, starter, professional, enterprise).

- [ ] **FEAT-006**: Notification system for school lifecycle events
  - Email notifications when school is created, suspended, activated, or approaching trial expiration.

- [ ] **FEAT-007**: React Native mobile app scaffold
  - `apps/mobile/` placeholder exists. Need to scaffold Expo + React Native app with shared auth.

- [ ] **FEAT-008**: Redis integration for session store and caching
  - Currently using in-memory stores. Production needs Redis for sessions, tenant cache, and rate limiting.
