# E2E Test Plan - PaperBook School Management

## Coverage Matrix

| Module | Spec File | Tests | Data Source |
|--------|-----------|-------|-------------|
| **Auth** | `auth/login.spec.ts` | Login success/failure, demo buttons | Seed users |
| **Auth** | `auth/logout.spec.ts` | Logout + redirect | Session |
| **Auth** | `auth/session.spec.ts` | Session persistence, auth redirect | Session |
| **Dashboard** | `dashboard/admin-dashboard.spec.ts` | Admin stats display | DB aggregates |
| **Dashboard** | `dashboard/role-dashboards.spec.ts` | Teacher/student content | Role-based |
| **Settings** | `settings/classes-subjects.spec.ts` | Classes, subjects, academic years load | `GET /api/settings/*` |
| **Settings** | `settings/school-profile.spec.ts` | School profile CRUD | `GET /api/settings/school-profile` |
| **Students** | `students/students-list.spec.ts` | List, class/section filters | `GET /api/students` + DB hooks |
| **Students** | `students/student-create.spec.ts` | Dynamic class/section form | `useClassNames()`, `useSectionsForClass()` |
| **Students** | `students/student-detail.spec.ts` | Navigation to detail | `GET /api/students/:id` |
| **Staff** | `staff/staff-list.spec.ts` | List, department filter | `useDepartmentNames()` |
| **Staff** | `staff/staff-detail.spec.ts` | Navigation to detail | `GET /api/staff/:id` |
| **Attendance** | `attendance/mark-attendance.spec.ts` | DB-driven class/section selectors | `useClassNames()`, `useAllSections()` |
| **Attendance** | `attendance/attendance-reports.spec.ts` | Reports with DB filters | DB hooks |
| **Finance** | `finance/fee-types.spec.ts` | Fee types page load | DB |
| **Finance** | `finance/payments.spec.ts` | Payments with filters | DB |
| **Data Integrity** | `data-integrity/no-hardcoded-data.spec.ts` | API verification, dropdown-API consistency | All settings APIs |

## Test Data Requirements

| Data | Source | Lifecycle |
|------|--------|-----------|
| Users (admin, teacher, student, etc.) | Prisma seed (`seed/index.ts`) | Per suite (global setup) |
| Classes (Class 1-12 with sections) | Prisma seed | Per suite |
| Subjects (14 subjects) | Prisma seed | Per suite |
| Departments | Prisma seed | Per suite |
| Academic Years | Prisma seed | Per suite |
| School Profile | Prisma seed | Per suite |

## Screenshot & Failure Strategy

- **Automatic screenshots**: Captured on every test failure via `screenshot: 'only-on-failure'`
- **Video recording**: Retained for failed tests via `video: 'retain-on-failure'`
- **Trace files**: Captured for failed tests via `trace: 'retain-on-failure'`
- **HTML report**: Generated after every run, viewable with `npm run test:e2e:report`
- **JSON results**: Saved to `test-results/results.json` for CI integration

## Hardcoded Data Removal Verification

The `data-integrity/no-hardcoded-data.spec.ts` test verifies:
1. All settings APIs return seeded data
2. Frontend dropdown options match API data
3. No stale hardcoded arrays remain in use

### Files Modified (hardcoded -> hooks)

| File | Removed Constants | Replaced With |
|------|------------------|---------------|
| `attendance/types/attendance.types.ts` | `CLASSES`, `SECTIONS`, `SUBJECTS` | Deleted (consumers use hooks) |
| `students/components/StudentForm.tsx` | `CLASSES`, `SECTIONS` | `useClassNames()`, `useSectionsForClass()` |
| `students/pages/StudentsListPage.tsx` | `CLASSES`, `SECTIONS` | `useClassNames()`, `useAllSections()` |
| `staff/pages/StaffPage.tsx` | `DEPARTMENTS`, `CLASSES`, `SECTIONS` | `useDepartmentNames()`, `useClassNames()`, `useAllSections()` |
| `people/components/StaffTab.tsx` | `DEPARTMENTS`, `CLASSES`, `SECTIONS` | Same hooks |
| `people/components/StudentsTab.tsx` | `CLASSES`, `SECTIONS` | `useClassNames()`, `useAllSections()` |
| `people/components/AttendanceTab.tsx` | `CLASSES`, `SECTIONS` (imported) | `useClassNames()`, `useAllSections()` |

### Constants Kept (acceptable)

- `BLOOD_GROUPS` - fixed medical standard
- `INDIAN_STATES` - fixed geography
- `STATUSES` - enum values (active, inactive, etc.)
- `MONTHS`, `PERIOD_NAMES` - fixed display labels
- `LEAVE_TYPE_LABELS`, `ATTENDANCE_STATUS_LABELS` - enum display mappings
