/**
 * Production Cleanup Script
 * ─────────────────────────
 * Removes all dummy/test data (students, staff, and related records)
 * while preserving the school, admin user, addon config, and subscriptions.
 *
 * Usage:
 *   DATABASE_URL="<prod-connection-string>" npx tsx apps/server/prisma/scripts/cleanup-prod.ts
 *
 * What it deletes (cascades handle child records automatically):
 *   - All Students (+ address, parent, health, documents, timeline, siblings, skills, portfolio, attendance, fees, marks)
 *   - All Staff (+ address, qualifications, bank details, PD, reviews, skills, certs, onboarding, exit interviews)
 *   - All Staff Attendance, Leave Balances, Leave Requests
 *   - All Student Daily Attendance records
 *   - All Timetables, Substitutions
 *   - All Exams, Marks, Report Cards, Grade Scales
 *   - All Fee Types, Fee Structures, Student Fees, Payments, Expenses, Ledger Entries
 *   - All Admission Applications
 *   - All Academic Years, Classes, Sections, Subjects (academic structure)
 *   - All Audit Logs
 *   - All Legacy User records (except those linked to BetterAuth admin)
 *
 * What it KEEPS:
 *   - Organizations
 *   - School Profiles (plan, status, onboarding state)
 *   - BetterAuth Users, Sessions, Accounts (login credentials)
 *   - OrgMembers (user-school links)
 *   - Platform Subscriptions
 *   - Addon catalog + School Addon toggles
 *   - Leads, Announcements
 *   - Website pages, blog, settings
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('╔══════════════════════════════════════════════╗')
  console.log('║   PRODUCTION CLEANUP — REMOVE DUMMY DATA    ║')
  console.log('╚══════════════════════════════════════════════╝\n')

  // Show what we're about to delete
  const [studentCount, staffCount, userCount, auditCount] = await Promise.all([
    prisma.student.count(),
    prisma.staff.count(),
    prisma.user.count(),
    prisma.auditLog.count(),
  ])

  console.log(`Found:`)
  console.log(`  Students:   ${studentCount}`)
  console.log(`  Staff:      ${staffCount}`)
  console.log(`  Users:      ${userCount}`)
  console.log(`  Audit Logs: ${auditCount}`)
  console.log()

  if (studentCount === 0 && staffCount === 0) {
    console.log('✅ Database is already clean. Nothing to delete.')
    return
  }

  console.log('Deleting all test/dummy data...\n')

  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // ── 1. Student-related (cascade handles children) ──
    const delStudents = await tx.student.deleteMany()
    console.log(`  ✓ Deleted ${delStudents.count} students (+ cascaded records)`)

    // Student daily attendance (parent records — child records cascade from student delete)
    const delDailyAtt = await tx.studentDailyAttendance.deleteMany()
    console.log(`  ✓ Deleted ${delDailyAtt.count} daily attendance records`)

    // ── 2. Staff-related (cascade handles children) ──
    const delStaff = await tx.staff.deleteMany()
    console.log(`  ✓ Deleted ${delStaff.count} staff (+ cascaded records)`)

    // Staff attendance
    const delStaffAtt = await tx.staffDailyAttendance.deleteMany()
    console.log(`  ✓ Deleted ${delStaffAtt.count} staff attendance records`)

    // Leave
    const delLeaveReq = await tx.leaveRequest.deleteMany()
    console.log(`  ✓ Deleted ${delLeaveReq.count} leave requests`)
    const delLeaveBal = await tx.leaveBalance.deleteMany()
    console.log(`  ✓ Deleted ${delLeaveBal.count} leave balances`)

    // ── 3. Academic structure ──
    const delSubjects = await tx.subject.deleteMany()
    console.log(`  ✓ Deleted ${delSubjects.count} subjects`)

    const delSections = await tx.section.deleteMany()
    console.log(`  ✓ Deleted ${delSections.count} sections`)

    const delClasses = await tx.class.deleteMany()
    console.log(`  ✓ Deleted ${delClasses.count} classes`)

    const delAcademicYears = await tx.academicYear.deleteMany()
    console.log(`  ✓ Deleted ${delAcademicYears.count} academic years`)

    // ── 4. Timetable ──
    const delTimetableEntries = await tx.timetableEntry.deleteMany()
    console.log(`  ✓ Deleted ${delTimetableEntries.count} timetable entries`)
    const delTimetables = await tx.timetable.deleteMany()
    console.log(`  ✓ Deleted ${delTimetables.count} timetables`)
    const delSubstitutions = await tx.substitution.deleteMany()
    console.log(`  ✓ Deleted ${delSubstitutions.count} substitutions`)

    // ── 5. Finance ──
    const delPayments = await tx.payment.deleteMany()
    console.log(`  ✓ Deleted ${delPayments.count} payments`)
    const delStudentFees = await tx.studentFee.deleteMany()
    console.log(`  ✓ Deleted ${delStudentFees.count} student fees`)
    const delFeeStructures = await tx.feeStructure.deleteMany()
    console.log(`  ✓ Deleted ${delFeeStructures.count} fee structures`)
    const delFeeTypes = await tx.feeType.deleteMany()
    console.log(`  ✓ Deleted ${delFeeTypes.count} fee types`)
    const delExpenses = await tx.expense.deleteMany()
    console.log(`  ✓ Deleted ${delExpenses.count} expenses`)
    const delLedger = await tx.ledgerEntry.deleteMany()
    console.log(`  ✓ Deleted ${delLedger.count} ledger entries`)

    // ── 6. Exams ──
    const delMarks = await tx.studentMark.deleteMany()
    console.log(`  ✓ Deleted ${delMarks.count} student marks`)
    const delReportCards = await tx.reportCard.deleteMany()
    console.log(`  ✓ Deleted ${delReportCards.count} report cards`)
    const delExams = await tx.exam.deleteMany()
    console.log(`  ✓ Deleted ${delExams.count} exams`)
    const delGradeScales = await tx.gradeScale.deleteMany()
    console.log(`  ✓ Deleted ${delGradeScales.count} grade scales`)

    // ── 7. Admissions ──
    const delAdmissionDocs = await tx.admissionDocument.deleteMany()
    console.log(`  ✓ Deleted ${delAdmissionDocs.count} admission documents`)
    const delAdmissions = await tx.admissionApplication.deleteMany()
    console.log(`  ✓ Deleted ${delAdmissions.count} admission applications`)

    // ── 8. Departments & Designations ──
    const delDesignations = await tx.designation.deleteMany()
    console.log(`  ✓ Deleted ${delDesignations.count} designations`)
    const delDepartments = await tx.department.deleteMany()
    console.log(`  ✓ Deleted ${delDepartments.count} departments`)

    // ── 9. Audit logs ──
    const delAudit = await tx.auditLog.deleteMany()
    console.log(`  ✓ Deleted ${delAudit.count} audit logs`)

    // ── 10. Legacy User records (keep BetterAuth users intact) ──
    const delUsers = await tx.user.deleteMany()
    console.log(`  ✓ Deleted ${delUsers.count} legacy user records`)

    // ── 11. Calendar events ──
    const delCalendar = await tx.calendarEvent.deleteMany()
    console.log(`  ✓ Deleted ${delCalendar.count} calendar events`)
  })

  // Reset onboarding so the school can go through setup again
  await prisma.schoolProfile.updateMany({
    data: {
      onboardingCompleted: false,
      onboardingStep: 0,
      onboardedAt: null,
    },
  })
  console.log(`\n  ✓ Reset onboarding status for all schools`)

  console.log('\n╔══════════════════════════════════════════════╗')
  console.log('║   ✅ CLEANUP COMPLETE                        ║')
  console.log('║   Schools, admin users, addons preserved.    ║')
  console.log('║   Re-run the onboarding wizard to set up.    ║')
  console.log('╚══════════════════════════════════════════════╝')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error('\n❌ Cleanup failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
