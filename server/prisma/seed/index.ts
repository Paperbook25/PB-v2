import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEFAULT_PASSWORD = 'demo123'

// ============================================================================
// Phase 1: Users
// ============================================================================

interface SeedUser {
  email: string
  name: string
  role: Role
  phone?: string
  studentId?: string
  class?: string
  section?: string
  rollNumber?: number
  childIds?: string[]
}

const seedUsers: SeedUser[] = [
  { email: 'admin@paperbook.in', name: 'Admin User', role: 'admin', phone: '+91 98765 43210' },
  { email: 'principal@paperbook.in', name: 'Dr. Sharma', role: 'principal', phone: '+91 98765 43211' },
  { email: 'teacher@paperbook.in', name: 'Priya Nair', role: 'teacher', phone: '+91 98765 43212' },
  { email: 'accounts@paperbook.in', name: 'Rahul Accounts', role: 'accountant', phone: '+91 98765 43213' },
  { email: 'librarian@paperbook.in', name: 'Meera Librarian', role: 'librarian', phone: '+91 98765 43214' },
  { email: 'transport@paperbook.in', name: 'Vijay Transport', role: 'transport_manager', phone: '+91 98765 43215' },
  { email: 'student@paperbook.in', name: 'Aarav Patel', role: 'student', phone: '+91 98765 43216', studentId: 'STU001', class: 'Class 10', section: 'A', rollNumber: 1 },
  { email: 'parent@paperbook.in', name: 'Rajesh Patel', role: 'parent', phone: '+91 98765 43217' },
]

// ============================================================================
// Phase 2: Settings Data
// ============================================================================

const classNames = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6',
  'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12',
]

const classSections: Record<string, string[]> = {
  'Class 1': ['A', 'B', 'C'],
  'Class 2': ['A', 'B', 'C'],
  'Class 3': ['A', 'B', 'C'],
  'Class 4': ['A', 'B', 'C'],
  'Class 5': ['A', 'B', 'C'],
  'Class 6': ['A', 'B', 'C', 'D'],
  'Class 7': ['A', 'B', 'C', 'D'],
  'Class 8': ['A', 'B', 'C', 'D'],
  'Class 9': ['A', 'B', 'C', 'D'],
  'Class 10': ['A', 'B', 'C', 'D'],
  'Class 11': ['A', 'B', 'C'],
  'Class 12': ['A', 'B', 'C'],
}

const subjects = [
  { name: 'English', code: 'ENG', type: 'theory', maxMarks: 100, passingMarks: 33 },
  { name: 'Hindi', code: 'HIN', type: 'theory', maxMarks: 100, passingMarks: 33 },
  { name: 'Mathematics', code: 'MAT', type: 'theory', maxMarks: 100, passingMarks: 33 },
  { name: 'Science', code: 'SCI', type: 'both', maxMarks: 100, passingMarks: 33 },
  { name: 'Social Science', code: 'SSC', type: 'theory', maxMarks: 100, passingMarks: 33 },
  { name: 'Computer Science', code: 'CS', type: 'both', maxMarks: 100, passingMarks: 33 },
  { name: 'Physical Education', code: 'PE', type: 'practical', maxMarks: 100, passingMarks: 33 },
  { name: 'Art & Craft', code: 'ART', type: 'practical', maxMarks: 100, passingMarks: 33 },
  { name: 'Physics', code: 'PHY', type: 'both', maxMarks: 100, passingMarks: 33 },
  { name: 'Chemistry', code: 'CHE', type: 'both', maxMarks: 100, passingMarks: 33 },
  { name: 'Biology', code: 'BIO', type: 'both', maxMarks: 100, passingMarks: 33 },
  { name: 'Accountancy', code: 'ACC', type: 'theory', maxMarks: 100, passingMarks: 33 },
  { name: 'Business Studies', code: 'BUS', type: 'theory', maxMarks: 100, passingMarks: 33 },
  { name: 'Economics', code: 'ECO', type: 'theory', maxMarks: 100, passingMarks: 33 },
]

const calendarEvents = [
  { title: 'Republic Day', description: 'National holiday - Republic Day celebration', type: 'holiday', startDate: '2025-01-26', endDate: '2025-01-26', isRecurring: true, appliesToClasses: [] },
  { title: 'Annual Sports Day', description: 'Inter-house sports competition', type: 'sports', startDate: '2025-02-15', endDate: '2025-02-15', isRecurring: false, appliesToClasses: [] },
  { title: 'Unit Test 3', description: 'Third unit test for all classes', type: 'exam', startDate: '2025-02-20', endDate: '2025-02-28', isRecurring: false, appliesToClasses: [] },
  { title: 'Holi Holiday', description: 'Festival of Colors', type: 'holiday', startDate: '2025-03-14', endDate: '2025-03-14', isRecurring: true, appliesToClasses: [] },
  { title: 'PTM - Junior Classes', description: 'Parent-Teacher meeting for junior classes', type: 'ptm', startDate: '2025-03-08', endDate: '2025-03-08', isRecurring: false, appliesToClasses: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'] },
  { title: 'Annual Day', description: 'Annual cultural program and prize distribution', type: 'cultural', startDate: '2025-03-22', endDate: '2025-03-22', isRecurring: false, appliesToClasses: [] },
  { title: 'Final Exams', description: 'End of year final examinations', type: 'exam', startDate: '2025-03-01', endDate: '2025-03-15', isRecurring: false, appliesToClasses: ['Class 9', 'Class 10', 'Class 11', 'Class 12'] },
  { title: 'Summer Vacation', description: 'Summer break', type: 'vacation', startDate: '2025-05-01', endDate: '2025-06-15', isRecurring: true, appliesToClasses: [] },
  { title: 'Teacher Training Workshop', description: 'Professional development workshop for teachers', type: 'workshop', startDate: '2025-04-05', endDate: '2025-04-06', isRecurring: false, appliesToClasses: [] },
  { title: 'Independence Day', description: 'National holiday - Independence Day', type: 'holiday', startDate: '2025-08-15', endDate: '2025-08-15', isRecurring: true, appliesToClasses: [] },
  { title: 'PTM - Senior Classes', description: 'Parent-Teacher meeting for senior classes', type: 'ptm', startDate: '2025-03-15', endDate: '2025-03-15', isRecurring: false, appliesToClasses: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'] },
  { title: 'Dussehra Break', description: 'Dussehra festival break', type: 'holiday', startDate: '2025-10-02', endDate: '2025-10-03', isRecurring: true, appliesToClasses: [] },
  { title: 'Diwali Vacation', description: 'Diwali festival vacation', type: 'vacation', startDate: '2025-10-20', endDate: '2025-10-27', isRecurring: true, appliesToClasses: [] },
  { title: 'Half-Yearly Exams', description: 'Mid-year examinations', type: 'exam', startDate: '2025-09-15', endDate: '2025-09-30', isRecurring: false, appliesToClasses: [] },
  { title: 'Christmas Break', description: 'Winter holiday break', type: 'vacation', startDate: '2025-12-24', endDate: '2026-01-01', isRecurring: true, appliesToClasses: [] },
]

const emailTemplates = [
  {
    name: 'Fee Reminder',
    subject: 'Fee Payment Reminder - {{school_name}}',
    body: 'Dear {{parent_name}},\n\nThis is a reminder that the {{fee_type}} fee of Rs. {{amount_due}} for your ward {{student_name}} ({{class}} - {{section}}) is due on {{due_date}}.\n\nPlease ensure timely payment to avoid late fees.\n\nRegards,\n{{school_name}}',
    category: 'fee',
  },
  {
    name: 'Fee Receipt Confirmation',
    subject: 'Payment Received - Receipt #{{receipt_number}}',
    body: 'Dear {{parent_name}},\n\nWe have received a payment of Rs. {{amount_paid}} for {{student_name}} on {{payment_date}} via {{payment_mode}}.\n\nReceipt Number: {{receipt_number}}\n\nThank you for the timely payment.\n\nRegards,\n{{school_name}}',
    category: 'fee',
  },
  {
    name: 'Daily Absence Alert',
    subject: 'Absence Notification - {{student_name}} - {{date}}',
    body: 'Dear {{parent_name}},\n\nThis is to inform you that your ward {{student_name}} ({{class}} - {{section}}, Roll No: {{roll_number}}) was absent on {{date}}.\n\nIf this absence was unplanned, please send a leave application.\n\nRegards,\n{{school_name}}',
    category: 'attendance',
  },
  {
    name: 'Exam Result Published',
    subject: '{{exam_name}} Results Published - {{student_name}}',
    body: 'Dear {{parent_name}},\n\nThe results of {{exam_name}} have been published.\n\nStudent: {{student_name}} ({{class}} - {{section}})\nTotal Marks: {{total_marks}}/{{max_marks}}\nPercentage: {{percentage}}%\nGrade: {{grade}}\nRank: {{rank}}\n\nYou can view the detailed report card on the parent portal.\n\nRegards,\n{{school_name}}',
    category: 'exam',
  },
  {
    name: 'Admission Application Received',
    subject: 'Application Received - {{application_id}}',
    body: 'Dear {{parent_name}},\n\nThank you for submitting the admission application for {{student_name}} to {{class}}.\n\nYour application ID is: {{application_id}}\n\nWe will review your application and get back to you shortly.\n\nRegards,\n{{school_name}}',
    category: 'admission',
  },
  {
    name: 'General Announcement',
    subject: '{{announcement_title}} - {{school_name}}',
    body: 'Dear Parent/Guardian,\n\n{{announcement_body}}\n\nRegards,\n{{school_name}}',
    category: 'general',
  },
  {
    name: 'Bus Delay Notification',
    subject: 'Bus Delay Alert - {{route_name}}',
    body: 'Dear {{parent_name}},\n\nWe want to inform you that the school bus on route {{route_name}} is delayed by approximately {{delay_minutes}} minutes due to {{reason}}.\n\nRevised arrival time at {{stop_name}}: {{revised_time}}\n\nWe apologize for the inconvenience.\n\nRegards,\n{{school_name}}',
    category: 'transport',
    isActive: false,
  },
]

// ============================================================================
// Main Seed Function
// ============================================================================

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('ERROR: Seed script cannot run in production. Set NODE_ENV to development to seed.')
    process.exit(1)
  }

  console.log('[Seed] Starting database seed...')

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12)

  // Clear existing data (order matters — foreign keys)
  console.log('[Seed] Clearing existing data...')
  // Phase 7 tables (Admissions)
  await prisma.admissionCommunication.deleteMany()
  await prisma.admissionPayment.deleteMany()
  await prisma.admissionNote.deleteMany()
  await prisma.admissionStatusHistory.deleteMany()
  await prisma.admissionDocument.deleteMany()
  await prisma.admissionApplication.deleteMany()
  await prisma.admEntranceExamSchedule.deleteMany()
  await prisma.admissionCommTemplate.deleteMany()
  // Phase 6 tables (Exams)
  await prisma.onlineExamAttempt.deleteMany()
  await prisma.onlineExam.deleteMany()
  await prisma.bankQuestion.deleteMany()
  await prisma.questionPaper.deleteMany()
  await prisma.coScholasticRecord.deleteMany()
  await prisma.examSlot.deleteMany()
  await prisma.reportCard.deleteMany()
  await prisma.studentMark.deleteMany()
  await prisma.exam.deleteMany()
  await prisma.gradeScale.deleteMany()
  // Phase 5 tables
  await prisma.ledgerEntry.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.studentFee.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.feeStructure.deleteMany()
  await prisma.feeType.deleteMany()
  // Phase 4 tables
  await prisma.substitution.deleteMany()
  await prisma.timetableEntry.deleteMany()
  await prisma.timetable.deleteMany()
  await prisma.room.deleteMany()
  await prisma.leaveRequest.deleteMany()
  await prisma.leaveBalance.deleteMany()
  await prisma.staffDailyAttendance.deleteMany()
  await prisma.periodAttendance.deleteMany()
  await prisma.studentAttendanceRecord.deleteMany()
  await prisma.studentDailyAttendance.deleteMany()
  await prisma.periodDefinition.deleteMany()
  // Phase 3 tables
  await prisma.staffExitInterview.deleteMany()
  await prisma.staffOnboardingChecklist.deleteMany()
  await prisma.staffOnboardingTask.deleteMany()
  await prisma.staffCertification.deleteMany()
  await prisma.staffSkillRecord.deleteMany()
  await prisma.staffPerformanceReview.deleteMany()
  await prisma.staffProfessionalDevelopment.deleteMany()
  await prisma.staffBankDetails.deleteMany()
  await prisma.staffQualification.deleteMany()
  await prisma.staffAddress.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.designation.deleteMany()
  await prisma.department.deleteMany()
  await prisma.studentPortfolioItem.deleteMany()
  await prisma.studentSkill.deleteMany()
  await prisma.studentSibling.deleteMany()
  await prisma.studentTimelineEvent.deleteMany()
  await prisma.studentDocument.deleteMany()
  await prisma.studentHealthRecord.deleteMany()
  await prisma.studentParent.deleteMany()
  await prisma.studentAddress.deleteMany()
  await prisma.student.deleteMany()
  // Phase 2 tables
  await prisma.classSubject.deleteMany()
  await prisma.section.deleteMany()
  await prisma.class.deleteMany()
  await prisma.subject.deleteMany()
  await prisma.academicYear.deleteMany()
  await prisma.calendarEvent.deleteMany()
  await prisma.emailTemplate.deleteMany()
  await prisma.notificationPreference.deleteMany()
  await prisma.backupConfig.deleteMany()
  await prisma.themeConfig.deleteMany()
  await prisma.schoolAddon.deleteMany()
  await prisma.addon.deleteMany()
  await prisma.schoolProfile.deleteMany()
  // RBAC permission tables
  await prisma.rolePermission.deleteMany()
  await prisma.permission.deleteMany()
  // Phase 1 tables
  await prisma.auditLog.deleteMany()
  await prisma.passwordReset.deleteMany()
  await prisma.session.deleteMany()
  await prisma.user.deleteMany()

  // ==================== PHASE 1: Users ====================

  const createdUsers: Record<string, string> = {}
  for (const user of seedUsers) {
    const created = await prisma.user.create({
      data: {
        email: user.email,
        passwordHash,
        name: user.name,
        role: user.role,
        phone: user.phone || null,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
        isActive: true,
        studentId: user.studentId || null,
        class: user.class || null,
        section: user.section || null,
        rollNumber: user.rollNumber || null,
      },
    })
    createdUsers[user.email] = created.id
    console.log(`[Seed] Created user: ${user.name} (${user.role})`)
  }

  // Link parent to student
  const studentUserId = createdUsers['student@paperbook.in']
  if (studentUserId) {
    await prisma.user.update({
      where: { email: 'parent@paperbook.in' },
      data: { childIds: JSON.stringify([studentUserId]) },
    })
  }

  // ==================== PHASE 2: School Profile ====================

  await prisma.schoolProfile.create({
    data: {
      name: 'Delhi Public School',
      address: '123 Education Lane, Sector 15',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      phone: '+91 11 2345 6789',
      email: 'info@dpsdelhi.edu.in',
      website: 'https://www.dpsdelhi.edu.in',
      principalName: 'Dr. Rajesh Kumar',
      establishedYear: 1985,
      affiliationNumber: 'CBSE/2024/12345',
      affiliationBoard: 'CBSE',
    },
  })
  console.log('[Seed] Created school profile')

  // ==================== PHASE 2: Academic Years ====================

  const academicYear = await prisma.academicYear.create({
    data: { name: '2024-25', startDate: new Date('2024-04-01'), endDate: new Date('2025-03-31'), isCurrent: true, status: 'active' },
  })
  await prisma.academicYear.create({
    data: { name: '2023-24', startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31'), isCurrent: false, status: 'completed' },
  })
  await prisma.academicYear.create({
    data: { name: '2025-26', startDate: new Date('2025-04-01'), endDate: new Date('2026-03-31'), isCurrent: false, status: 'upcoming' },
  })
  console.log('[Seed] Created 3 academic years')

  // ==================== PHASE 2: Classes & Sections ====================

  const teacherId = createdUsers['teacher@paperbook.in'] || null
  const createdClassIds: Record<string, string> = {}

  for (let i = 0; i < classNames.length; i++) {
    const className = classNames[i]
    const sectionNames = classSections[className]

    const cls = await prisma.class.create({
      data: {
        name: className,
        sortOrder: i + 1,
        sections: {
          create: sectionNames.map((name) => ({
            name,
            classTeacherId: teacherId,
          })),
        },
      },
    })
    createdClassIds[className] = cls.id
  }
  console.log(`[Seed] Created ${classNames.length} classes with sections`)

  // ==================== PHASE 2: Subjects ====================

  const createdSubjectIds: Record<string, string> = {}
  for (const sub of subjects) {
    const created = await prisma.subject.create({
      data: {
        name: sub.name,
        code: sub.code,
        type: sub.type,
        maxMarks: sub.maxMarks,
        passingMarks: sub.passingMarks,
      },
    })
    createdSubjectIds[sub.code] = created.id
  }
  console.log(`[Seed] Created ${subjects.length} subjects`)

  // ==================== PHASE 2: Class-Subject mappings ====================

  // Common subjects for Classes 1-8
  const commonSubjects = ['ENG', 'HIN', 'MAT', 'SCI', 'SSC', 'PE', 'ART']
  // Science stream for Classes 9-10
  const secondarySubjects = ['ENG', 'HIN', 'MAT', 'SCI', 'SSC', 'CS', 'PE']
  // Senior secondary subjects (simplified)
  const seniorSubjects = ['ENG', 'PHY', 'CHE', 'MAT', 'CS', 'PE']

  for (const [className, classId] of Object.entries(createdClassIds)) {
    const classNum = parseInt(className.replace('Class ', ''))
    let subjectCodes: string[]
    if (classNum <= 8) subjectCodes = commonSubjects
    else if (classNum <= 10) subjectCodes = secondarySubjects
    else subjectCodes = seniorSubjects

    for (const code of subjectCodes) {
      const subjectId = createdSubjectIds[code]
      if (subjectId) {
        await prisma.classSubject.create({
          data: { classId, subjectId, academicYearId: academicYear.id },
        })
      }
    }
  }
  console.log('[Seed] Created class-subject mappings')

  // ==================== PHASE 2: Calendar Events ====================

  for (const event of calendarEvents) {
    await prisma.calendarEvent.create({
      data: {
        title: event.title,
        description: event.description,
        type: event.type as 'holiday' | 'exam' | 'ptm' | 'sports' | 'cultural' | 'workshop' | 'vacation' | 'other',
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        isRecurring: event.isRecurring,
        appliesToClasses: event.appliesToClasses,
      },
    })
  }
  console.log(`[Seed] Created ${calendarEvents.length} calendar events`)

  // ==================== PHASE 2: Email Templates ====================

  function extractVars(text: string): string[] {
    const matches = text.match(/\{\{(\w+)\}\}/g) || []
    return [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))]
  }

  for (const tmpl of emailTemplates) {
    const variables = extractVars(tmpl.subject + tmpl.body)
    await prisma.emailTemplate.create({
      data: {
        name: tmpl.name,
        subject: tmpl.subject,
        body: tmpl.body,
        category: tmpl.category as 'fee' | 'attendance' | 'exam' | 'admission' | 'general' | 'transport',
        variables,
        isActive: 'isActive' in tmpl ? (tmpl as { isActive: boolean }).isActive : true,
        lastModified: new Date(),
      },
    })
  }
  console.log(`[Seed] Created ${emailTemplates.length} email templates`)

  // ==================== PHASE 2: Singleton Configs ====================

  await prisma.notificationPreference.create({
    data: {
      emailNotifications: true,
      smsNotifications: true,
      feeReminders: true,
      attendanceAlerts: true,
      examResults: true,
      generalAnnouncements: true,
    },
  })

  await prisma.backupConfig.create({
    data: {
      autoBackup: true,
      backupFrequency: 'daily',
      lastBackupAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
      backupRetentionDays: 30,
    },
  })

  await prisma.themeConfig.create({
    data: {
      mode: 'system',
      primaryColor: '#6d28d9',
      accentColor: '#7c3aed',
    },
  })
  console.log('[Seed] Created notification, backup, and theme configs')

  // ============================================================================
  // Phase 3: Students + Staff
  // ============================================================================

  // ==================== Departments ====================

  const departmentNames = [
    'Mathematics', 'Science', 'English', 'Social Studies', 'Hindi',
    'Computer Science', 'Physical Education', 'Art', 'Music', 'Administration',
  ]
  const createdDeptIds: Record<string, string> = {}
  for (const name of departmentNames) {
    const dept = await prisma.department.create({ data: { name } })
    createdDeptIds[name] = dept.id
  }
  console.log(`[Seed] Created ${departmentNames.length} departments`)

  // ==================== Designations ====================

  const designationData = [
    { name: 'Principal', level: 1 },
    { name: 'Vice Principal', level: 2 },
    { name: 'Senior Teacher', level: 3 },
    { name: 'Teacher', level: 4 },
    { name: 'Assistant Teacher', level: 5 },
    { name: 'Lab Assistant', level: 6 },
    { name: 'Librarian', level: 7 },
    { name: 'Accountant', level: 8 },
    { name: 'Clerk', level: 9 },
    { name: 'Peon', level: 10 },
  ]
  const createdDesigIds: Record<string, string> = {}
  for (const d of designationData) {
    const desig = await prisma.designation.create({ data: d })
    createdDesigIds[d.name] = desig.id
  }
  console.log(`[Seed] Created ${designationData.length} designations`)

  // ==================== Sections lookup (we need section IDs) ====================

  const sectionLookup: Record<string, string> = {}
  const allSections = await prisma.section.findMany({ include: { class: true } })
  for (const sec of allSections) {
    sectionLookup[`${sec.class.name}-${sec.name}`] = sec.id
  }

  // ==================== Students (20) ====================

  const seedStudents = [
    { firstName: 'Aarav', lastName: 'Sharma', email: 'aarav.sharma@student.paperbook.in', phone: '+91 90001 00001', gender: 'male' as const, bloodGroup: 'A+', class: 'Class 1', section: 'A', rollNumber: 1, dob: '2017-03-15' },
    { firstName: 'Ananya', lastName: 'Verma', email: 'ananya.verma@student.paperbook.in', phone: '+91 90001 00002', gender: 'female' as const, bloodGroup: 'B+', class: 'Class 1', section: 'B', rollNumber: 1, dob: '2017-06-22' },
    { firstName: 'Vivaan', lastName: 'Kumar', email: 'vivaan.kumar@student.paperbook.in', phone: '+91 90001 00003', gender: 'male' as const, bloodGroup: 'O+', class: 'Class 2', section: 'A', rollNumber: 1, dob: '2016-01-10' },
    { firstName: 'Diya', lastName: 'Singh', email: 'diya.singh@student.paperbook.in', phone: '+91 90001 00004', gender: 'female' as const, bloodGroup: 'AB+', class: 'Class 3', section: 'A', rollNumber: 1, dob: '2015-08-05' },
    { firstName: 'Arjun', lastName: 'Reddy', email: 'arjun.reddy@student.paperbook.in', phone: '+91 90001 00005', gender: 'male' as const, bloodGroup: 'A-', class: 'Class 4', section: 'B', rollNumber: 1, dob: '2014-11-30' },
    { firstName: 'Ishita', lastName: 'Gupta', email: 'ishita.gupta@student.paperbook.in', phone: '+91 90001 00006', gender: 'female' as const, bloodGroup: 'B-', class: 'Class 5', section: 'A', rollNumber: 1, dob: '2013-04-18' },
    { firstName: 'Kabir', lastName: 'Patel', email: 'kabir.patel@student.paperbook.in', phone: '+91 90001 00007', gender: 'male' as const, bloodGroup: 'O+', class: 'Class 5', section: 'B', rollNumber: 1, dob: '2013-07-25' },
    { firstName: 'Meera', lastName: 'Iyer', email: 'meera.iyer@student.paperbook.in', phone: '+91 90001 00008', gender: 'female' as const, bloodGroup: 'A+', class: 'Class 6', section: 'A', rollNumber: 1, dob: '2012-02-14' },
    { firstName: 'Reyansh', lastName: 'Joshi', email: 'reyansh.joshi@student.paperbook.in', phone: '+91 90001 00009', gender: 'male' as const, bloodGroup: 'B+', class: 'Class 6', section: 'B', rollNumber: 1, dob: '2012-09-08' },
    { firstName: 'Saanvi', lastName: 'Nair', email: 'saanvi.nair@student.paperbook.in', phone: '+91 90001 00010', gender: 'female' as const, bloodGroup: 'O-', class: 'Class 7', section: 'A', rollNumber: 1, dob: '2011-12-01' },
    { firstName: 'Dhruv', lastName: 'Mehta', email: 'dhruv.mehta@student.paperbook.in', phone: '+91 90001 00011', gender: 'male' as const, bloodGroup: 'AB+', class: 'Class 7', section: 'B', rollNumber: 1, dob: '2011-05-20' },
    { firstName: 'Anika', lastName: 'Chatterjee', email: 'anika.chatterjee@student.paperbook.in', phone: '+91 90001 00012', gender: 'female' as const, bloodGroup: 'A+', class: 'Class 8', section: 'A', rollNumber: 1, dob: '2010-10-15' },
    { firstName: 'Vihaan', lastName: 'Desai', email: 'vihaan.desai@student.paperbook.in', phone: '+91 90001 00013', gender: 'male' as const, bloodGroup: 'B+', class: 'Class 8', section: 'B', rollNumber: 1, dob: '2010-03-28' },
    { firstName: 'Riya', lastName: 'Kapoor', email: 'riya.kapoor@student.paperbook.in', phone: '+91 90001 00014', gender: 'female' as const, bloodGroup: 'O+', class: 'Class 9', section: 'A', rollNumber: 1, dob: '2009-07-11' },
    { firstName: 'Aditya', lastName: 'Rao', email: 'aditya.rao@student.paperbook.in', phone: '+91 90001 00015', gender: 'male' as const, bloodGroup: 'A-', class: 'Class 9', section: 'B', rollNumber: 1, dob: '2009-01-05' },
    { firstName: 'Prisha', lastName: 'Malhotra', email: 'prisha.malhotra@student.paperbook.in', phone: '+91 90001 00016', gender: 'female' as const, bloodGroup: 'AB-', class: 'Class 10', section: 'A', rollNumber: 2, dob: '2008-06-19' },
    { firstName: 'Siddharth', lastName: 'Bhat', email: 'siddharth.bhat@student.paperbook.in', phone: '+91 90001 00017', gender: 'male' as const, bloodGroup: 'B+', class: 'Class 10', section: 'B', rollNumber: 1, dob: '2008-11-23' },
    { firstName: 'Tara', lastName: 'Pillai', email: 'tara.pillai@student.paperbook.in', phone: '+91 90001 00018', gender: 'female' as const, bloodGroup: 'O+', class: 'Class 11', section: 'A', rollNumber: 1, dob: '2007-04-07' },
    { firstName: 'Rohan', lastName: 'Saxena', email: 'rohan.saxena@student.paperbook.in', phone: '+91 90001 00019', gender: 'male' as const, bloodGroup: 'A+', class: 'Class 12', section: 'A', rollNumber: 1, dob: '2006-08-30' },
    { firstName: 'Kiara', lastName: 'Das', email: 'kiara.das@student.paperbook.in', phone: '+91 90001 00020', gender: 'female' as const, bloodGroup: 'B-', class: 'Class 12', section: 'B', rollNumber: 1, dob: '2006-12-12' },
  ]

  const createdStudentIds: Record<string, string> = {}
  let admSeq = 1

  for (const s of seedStudents) {
    const classId = createdClassIds[s.class]
    const sectionId = sectionLookup[`${s.class}-${s.section}`]
    const admissionNumber = `ADM-2024-${String(admSeq++).padStart(4, '0')}`

    const student = await prisma.student.create({
      data: {
        admissionNumber,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        phone: s.phone,
        dateOfBirth: new Date(s.dob),
        gender: s.gender,
        bloodGroup: s.bloodGroup,
        classId,
        sectionId,
        rollNumber: s.rollNumber,
        admissionDate: new Date('2024-04-01'),
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.firstName}${s.lastName}`,
        status: 'active',
        address: {
          create: {
            street: `${Math.floor(Math.random() * 500) + 1}, Sector ${Math.floor(Math.random() * 50) + 1}`,
            city: 'New Delhi',
            state: 'Delhi',
            pincode: `1100${String(Math.floor(Math.random() * 90) + 10)}`,
          },
        },
        parent: {
          create: {
            fatherName: `Mr. ${s.lastName}`,
            motherName: `Mrs. ${s.lastName}`,
            guardianPhone: s.phone,
            guardianEmail: `parent.${s.lastName.toLowerCase()}@email.com`,
            occupation: ['Engineer', 'Doctor', 'Teacher', 'Business', 'Lawyer'][Math.floor(Math.random() * 5)],
          },
        },
        timelineEvents: {
          create: {
            type: 'admission',
            title: 'Admitted to school',
            description: `Admitted to ${s.class} - ${s.section}`,
          },
        },
      },
    })
    createdStudentIds[s.email] = student.id
  }
  console.log(`[Seed] Created ${seedStudents.length} students with addresses and parents`)

  // Link student user to an actual student (Class 10-A, Prisha Malhotra)
  const prishaId = createdStudentIds['prisha.malhotra@student.paperbook.in']
  if (prishaId && createdUsers['student@paperbook.in']) {
    await prisma.user.update({
      where: { id: createdUsers['student@paperbook.in'] },
      data: { studentId: prishaId },
    })
  }

  // Link parent user to actual student IDs
  if (prishaId && createdUsers['parent@paperbook.in']) {
    await prisma.user.update({
      where: { id: createdUsers['parent@paperbook.in'] },
      data: { childIds: JSON.stringify([createdUsers['student@paperbook.in']]) },
    })
  }

  // Health records for first 5 students
  const healthStudentEmails = seedStudents.slice(0, 5).map((s) => s.email)
  for (const email of healthStudentEmails) {
    await prisma.studentHealthRecord.create({
      data: {
        studentId: createdStudentIds[email],
        allergies: ['Dust', 'Pollen'],
        medicalConditions: [],
        medications: [],
        emergencyContact: { name: 'Guardian', phone: '+91 99999 00000', relation: 'Parent' },
        bloodGroup: 'A+',
        height: 120 + Math.random() * 40,
        weight: 25 + Math.random() * 30,
        visionLeft: '6/6',
        visionRight: '6/6',
        lastCheckupDate: new Date('2024-09-15'),
      },
    })
  }
  console.log('[Seed] Created 5 student health records')

  // Documents for 3 students
  const docStudentEmails = seedStudents.slice(0, 3).map((s) => s.email)
  for (const email of docStudentEmails) {
    await prisma.studentDocument.create({
      data: {
        studentId: createdStudentIds[email],
        type: 'birth_certificate',
        name: 'Birth Certificate',
        fileName: 'birth_certificate.pdf',
        fileSize: 150000,
        mimeType: 'application/pdf',
        url: '/uploads/documents/birth_certificate.pdf',
        uploadedBy: 'Admin User',
        verified: true,
        verifiedBy: 'Admin User',
        verifiedAt: new Date(),
      },
    })
    await prisma.studentDocument.create({
      data: {
        studentId: createdStudentIds[email],
        type: 'photo',
        name: 'Passport Photo',
        fileName: 'photo.jpg',
        fileSize: 50000,
        mimeType: 'image/jpeg',
        url: '/uploads/documents/photo.jpg',
        uploadedBy: 'Admin User',
      },
    })
  }
  console.log('[Seed] Created documents for 3 students')

  // Sibling pairs: student 0 & 1, student 6 & 7
  const sibPairs = [
    [seedStudents[0].email, seedStudents[1].email],
    [seedStudents[6].email, seedStudents[7].email],
  ]
  for (const [emailA, emailB] of sibPairs) {
    const idA = createdStudentIds[emailA]
    const idB = createdStudentIds[emailB]
    await prisma.studentSibling.create({ data: { studentId: idA, siblingId: idB } })
    await prisma.studentSibling.create({ data: { studentId: idB, siblingId: idA } })
  }
  console.log('[Seed] Created 2 sibling pairs')

  // Skills and portfolio for 3 students
  const skillStudents = seedStudents.slice(0, 3)
  const skillCategories = ['academic', 'sports', 'arts'] as const
  for (let i = 0; i < skillStudents.length; i++) {
    const sid = createdStudentIds[skillStudents[i].email]
    await prisma.studentSkill.create({
      data: {
        studentId: sid,
        name: ['Mathematics Olympiad', 'Cricket', 'Painting'][i],
        category: skillCategories[i],
        proficiencyLevel: 3 + i,
        certifications: i === 0 ? ['State Level Certificate'] : [],
        endorsedBy: ['Class Teacher'],
        acquiredDate: new Date('2024-06-01'),
      },
    })
    await prisma.studentPortfolioItem.create({
      data: {
        studentId: sid,
        title: ['Math Competition Winner', 'Inter-school Cricket', 'Art Exhibition'][i],
        type: ['achievement', 'competition', 'project'][i] as 'achievement' | 'competition' | 'project',
        description: `Outstanding performance in ${['mathematics', 'cricket', 'art'][i]}`,
        date: new Date('2024-09-15'),
        tags: [['math', 'olympiad'], ['cricket', 'sports'], ['art', 'creative']][i],
        visibility: 'school',
        featured: i === 0,
      },
    })
  }
  console.log('[Seed] Created skills and portfolio items for 3 students')

  // ==================== Staff (10) ====================

  const seedStaffData = [
    { firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@staff.paperbook.in', phone: '+91 80001 00001', gender: 'male' as const, dept: 'Administration', desig: 'Principal', salary: 120000, spec: 'School Administration' },
    { firstName: 'Sunita', lastName: 'Devi', email: 'sunita.devi@staff.paperbook.in', phone: '+91 80001 00002', gender: 'female' as const, dept: 'Administration', desig: 'Vice Principal', salary: 95000, spec: 'Academic Planning' },
    { firstName: 'Priya', lastName: 'Nair', email: 'teacher@paperbook.in', phone: '+91 98765 43212', gender: 'female' as const, dept: 'Mathematics', desig: 'Senior Teacher', salary: 75000, spec: 'Advanced Mathematics' },
    { firstName: 'Amit', lastName: 'Pandey', email: 'amit.pandey@staff.paperbook.in', phone: '+91 80001 00004', gender: 'male' as const, dept: 'Science', desig: 'Teacher', salary: 60000, spec: 'Physics' },
    { firstName: 'Deepa', lastName: 'Menon', email: 'deepa.menon@staff.paperbook.in', phone: '+91 80001 00005', gender: 'female' as const, dept: 'English', desig: 'Senior Teacher', salary: 70000, spec: 'English Literature' },
    { firstName: 'Ramesh', lastName: 'Yadav', email: 'ramesh.yadav@staff.paperbook.in', phone: '+91 80001 00006', gender: 'male' as const, dept: 'Hindi', desig: 'Teacher', salary: 55000, spec: 'Hindi Grammar' },
    { firstName: 'Kavita', lastName: 'Sharma', email: 'kavita.sharma@staff.paperbook.in', phone: '+91 80001 00007', gender: 'female' as const, dept: 'Computer Science', desig: 'Teacher', salary: 65000, spec: 'Programming' },
    { firstName: 'Suresh', lastName: 'Pillai', email: 'suresh.pillai@staff.paperbook.in', phone: '+91 80001 00008', gender: 'male' as const, dept: 'Physical Education', desig: 'Teacher', salary: 50000, spec: 'Sports Training' },
    { firstName: 'Anjali', lastName: 'Mishra', email: 'anjali.mishra@staff.paperbook.in', phone: '+91 80001 00009', gender: 'female' as const, dept: 'Art', desig: 'Assistant Teacher', salary: 45000, spec: 'Fine Arts' },
    { firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@staff.paperbook.in', phone: '+91 80001 00010', gender: 'male' as const, dept: 'Administration', desig: 'Clerk', salary: 30000, spec: null },
  ]

  const createdStaffIds: Record<string, string> = {}
  let empSeq = 1

  for (const s of seedStaffData) {
    const employeeId = `EMP-${String(empSeq++).padStart(4, '0')}`
    // Link teacher user to staff record
    const linkedUserId = s.email === 'teacher@paperbook.in' ? createdUsers['teacher@paperbook.in'] : null

    const staff = await prisma.staff.create({
      data: {
        employeeId,
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        phone: s.phone,
        dateOfBirth: new Date(`${1970 + Math.floor(Math.random() * 20)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`),
        gender: s.gender,
        departmentId: createdDeptIds[s.dept],
        designationId: createdDesigIds[s.desig],
        joiningDate: new Date('2020-04-01'),
        photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.firstName}${s.lastName}`,
        specialization: s.spec,
        salary: s.salary,
        status: 'active',
        userId: linkedUserId,
        address: {
          create: {
            street: `${Math.floor(Math.random() * 200) + 1}, Block ${String.fromCharCode(65 + Math.floor(Math.random() * 8))}`,
            city: 'New Delhi',
            state: 'Delhi',
            pincode: `1100${String(Math.floor(Math.random() * 90) + 10)}`,
          },
        },
        bankDetails: {
          create: {
            bankName: ['SBI', 'HDFC', 'ICICI', 'PNB', 'Axis'][Math.floor(Math.random() * 5)],
            accountNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
            ifscCode: 'SBIN0001234',
            accountHolderName: `${s.firstName} ${s.lastName}`,
          },
        },
        qualifications: {
          create: [
            { qualification: ['B.Ed', 'M.Ed', 'M.Sc', 'M.A', 'B.A'][Math.floor(Math.random() * 5)], institution: 'Delhi University', year: 2015 },
            { qualification: ['B.Sc', 'B.A', 'B.Com', 'BCA', 'B.Tech'][Math.floor(Math.random() * 5)], institution: 'JNU', year: 2012 },
          ],
        },
      },
    })
    createdStaffIds[s.email] = staff.id
  }
  console.log(`[Seed] Created ${seedStaffData.length} staff members with addresses, bank details, qualifications`)

  // Set department heads
  await prisma.department.update({
    where: { name: 'Mathematics' },
    data: { headStaffId: createdStaffIds['teacher@paperbook.in'] },
  })
  await prisma.department.update({
    where: { name: 'Administration' },
    data: { headStaffId: createdStaffIds['rajesh.kumar@staff.paperbook.in'] },
  })

  // PD records for 2 staff
  await prisma.staffProfessionalDevelopment.create({
    data: {
      staffId: createdStaffIds['teacher@paperbook.in'],
      type: 'workshop',
      title: 'Advanced Teaching Methods Workshop',
      provider: 'NCERT',
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-06-17'),
      status: 'completed',
      hours: 24,
      cost: 5000,
    },
  })
  await prisma.staffProfessionalDevelopment.create({
    data: {
      staffId: createdStaffIds['amit.pandey@staff.paperbook.in'],
      type: 'certification',
      title: 'CBSE Lab Safety Certification',
      provider: 'CBSE Board',
      startDate: new Date('2024-08-01'),
      endDate: new Date('2024-08-05'),
      status: 'completed',
      certificateUrl: '/uploads/certs/lab_safety.pdf',
      hours: 40,
      cost: 8000,
    },
  })
  console.log('[Seed] Created 2 PD records')

  // Performance reviews for 2 staff
  const principalStaffId = createdStaffIds['rajesh.kumar@staff.paperbook.in']
  await prisma.staffPerformanceReview.create({
    data: {
      staffId: createdStaffIds['teacher@paperbook.in'],
      reviewerId: principalStaffId,
      period: 'annual',
      year: 2024,
      ratings: { teaching: 4.5, communication: 4.0, punctuality: 4.8, initiative: 4.2 },
      overallRating: 4.4,
      strengths: 'Excellent teaching methodology, great rapport with students',
      areasOfImprovement: 'Could contribute more to extracurricular activities',
      goals: 'Lead math olympiad team next year',
      status: 'submitted',
    },
  })
  await prisma.staffPerformanceReview.create({
    data: {
      staffId: createdStaffIds['deepa.menon@staff.paperbook.in'],
      reviewerId: principalStaffId,
      period: 'annual',
      year: 2024,
      ratings: { teaching: 4.2, communication: 4.5, punctuality: 4.0, initiative: 4.3 },
      overallRating: 4.25,
      strengths: 'Creative teaching approach, excellent communication skills',
      areasOfImprovement: 'Needs to be more punctual',
      goals: 'Organize inter-school debate competition',
      status: 'acknowledged',
    },
  })
  console.log('[Seed] Created 2 performance reviews')

  // Skills and certifications for 3 staff
  const skillStaffEmails = ['teacher@paperbook.in', 'amit.pandey@staff.paperbook.in', 'kavita.sharma@staff.paperbook.in']
  const staffSkillData = [
    { skillName: 'Curriculum Design', category: 'domain' as const, proficiency: 'expert' as const, years: 8 },
    { skillName: 'Lab Management', category: 'technical' as const, proficiency: 'advanced' as const, years: 5 },
    { skillName: 'Python Programming', category: 'technical' as const, proficiency: 'expert' as const, years: 10 },
  ]
  for (let i = 0; i < skillStaffEmails.length; i++) {
    await prisma.staffSkillRecord.create({
      data: {
        staffId: createdStaffIds[skillStaffEmails[i]],
        skillName: staffSkillData[i].skillName,
        category: staffSkillData[i].category,
        proficiency: staffSkillData[i].proficiency,
        yearsOfExperience: staffSkillData[i].years,
        selfAssessed: true,
      },
    })
    await prisma.staffCertification.create({
      data: {
        staffId: createdStaffIds[skillStaffEmails[i]],
        name: ['CBSE Teaching Certificate', 'Lab Safety Certification', 'Google Certified Educator'][i],
        issuingOrganization: ['CBSE', 'National Safety Council', 'Google'][i],
        credentialId: `CERT-${1000 + i}`,
        issueDate: new Date('2023-01-15'),
        expiryDate: new Date('2025-01-15'),
        doesNotExpire: false,
        status: 'active_cert',
        category: ['teaching', 'safety', 'technical'][i] as 'teaching' | 'safety' | 'technical',
      },
    })
  }
  console.log('[Seed] Created skills and certifications for 3 staff')

  // Onboarding template tasks (8)
  const onboardingTemplates = [
    { category: 'Documentation', name: 'Submit ID proof copies', description: 'Submit copies of Aadhar, PAN, and passport', assignedTo: 'hr', dueInDays: 3, isMandatory: true, order: 1 },
    { category: 'Documentation', name: 'Submit educational certificates', description: 'Submit all degree and diploma certificates', assignedTo: 'hr', dueInDays: 5, isMandatory: true, order: 2 },
    { category: 'Access', name: 'Create email account', description: 'Set up school email account', assignedTo: 'it', dueInDays: 1, isMandatory: true, order: 3 },
    { category: 'Equipment', name: 'Assign laptop/desktop', description: 'Assign necessary computing equipment', assignedTo: 'it', dueInDays: 2, isMandatory: false, order: 4 },
    { category: 'Introduction', name: 'Department introduction', description: 'Introduce to department head and team', assignedTo: 'manager', dueInDays: 1, isMandatory: true, order: 5 },
    { category: 'Training', name: 'School policies orientation', description: 'Complete orientation on school rules and policies', assignedTo: 'hr', dueInDays: 7, isMandatory: true, order: 6 },
    { category: 'Training', name: 'ERP system training', description: 'Complete training on school management system', assignedTo: 'it', dueInDays: 10, isMandatory: true, order: 7 },
    { category: 'Compliance', name: 'Sign code of conduct', description: 'Read and sign the employee code of conduct', assignedTo: 'hr', dueInDays: 3, isMandatory: true, order: 8 },
  ]

  const createdTaskIds: string[] = []
  for (const t of onboardingTemplates) {
    const task = await prisma.staffOnboardingTask.create({ data: t })
    createdTaskIds.push(task.id)
  }
  console.log('[Seed] Created 8 onboarding template tasks')

  // Onboarding checklist for 1 staff (newest staff member)
  const onboardingStaffId = createdStaffIds['anjali.mishra@staff.paperbook.in']
  const onboardingTasks = onboardingTemplates.map((t, i) => ({
    taskId: createdTaskIds[i],
    name: t.name,
    category: t.category,
    description: t.description,
    assignedTo: t.assignedTo,
    isMandatory: t.isMandatory,
    dueDate: new Date(Date.now() + t.dueInDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    completed: i < 3, // first 3 tasks completed
    completedDate: i < 3 ? new Date().toISOString().split('T')[0] : null,
    notes: null,
  }))
  await prisma.staffOnboardingChecklist.create({
    data: {
      staffId: onboardingStaffId,
      status: 'onboarding_in_progress',
      assignedHR: 'Admin User',
      assignedManager: 'Rajesh Kumar',
      tasks: onboardingTasks,
      progress: Math.round((3 / 8) * 100),
      startDate: new Date(),
      targetCompletionDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000),
    },
  })
  console.log('[Seed] Created 1 onboarding checklist')

  // Exit interview for 1 staff
  const exitStaffId = createdStaffIds['vikram.singh@staff.paperbook.in']
  await prisma.staff.update({ where: { id: exitStaffId }, data: { status: 'resigned' } })
  await prisma.staffExitInterview.create({
    data: {
      staffId: exitStaffId,
      lastWorkingDate: new Date('2025-03-31'),
      separationType: 'resignation',
      interviewDate: new Date('2025-03-15'),
      ratings: { workEnvironment: 3.5, management: 3.0, growthOpportunities: 2.5, compensation: 3.0 },
      reasonForLeaving: ['Better opportunity', 'Career growth'],
      handoverStatus: 'handover_in_progress',
      clearanceStatus: {
        hr: { status: 'cleared', clearedBy: 'Admin User', clearedDate: '2025-03-10' },
        finance: { status: 'pending' },
        it: { status: 'pending' },
        admin: { status: 'cleared', clearedBy: 'Rajesh Kumar', clearedDate: '2025-03-12' },
      },
      fnfStatus: 'fnf_pending',
      status: 'scheduled',
    },
  })
  console.log('[Seed] Created 1 exit interview')

  // ============================================================================
  // Phase 4: Attendance + Timetable + Leave
  // ============================================================================

  // ==================== Period Definitions (10) ====================

  const periodDefs = [
    { name: 'Assembly', periodNumber: 0, startTime: '08:00', endTime: '08:30', type: 'period_assembly' as const },
    { name: 'Period 1', periodNumber: 1, startTime: '08:30', endTime: '09:15', type: 'period_class' as const },
    { name: 'Period 2', periodNumber: 2, startTime: '09:15', endTime: '10:00', type: 'period_class' as const },
    { name: 'Period 3', periodNumber: 3, startTime: '10:00', endTime: '10:45', type: 'period_class' as const },
    { name: 'Break', periodNumber: 4, startTime: '10:45', endTime: '11:00', type: 'period_break' as const },
    { name: 'Period 4', periodNumber: 5, startTime: '11:00', endTime: '11:45', type: 'period_class' as const },
    { name: 'Period 5', periodNumber: 6, startTime: '11:45', endTime: '12:30', type: 'period_class' as const },
    { name: 'Lunch', periodNumber: 7, startTime: '12:30', endTime: '13:00', type: 'period_lunch' as const },
    { name: 'Period 6', periodNumber: 8, startTime: '13:00', endTime: '13:45', type: 'period_class' as const },
    { name: 'Period 7', periodNumber: 9, startTime: '13:45', endTime: '14:30', type: 'period_class' as const },
  ]

  const createdPeriodIds: Record<number, string> = {}
  for (const p of periodDefs) {
    const pd = await prisma.periodDefinition.create({ data: p })
    createdPeriodIds[p.periodNumber] = pd.id
  }
  console.log(`[Seed] Created ${periodDefs.length} period definitions`)

  // ==================== Rooms (10) ====================

  const roomData = [
    { name: 'Room 101', type: 'room_classroom' as const, capacity: 40, building: 'Main Block', floor: 'Ground' },
    { name: 'Room 102', type: 'room_classroom' as const, capacity: 40, building: 'Main Block', floor: 'Ground' },
    { name: 'Room 201', type: 'room_classroom' as const, capacity: 40, building: 'Main Block', floor: 'First' },
    { name: 'Room 202', type: 'room_classroom' as const, capacity: 40, building: 'Main Block', floor: 'First' },
    { name: 'Room 301', type: 'room_classroom' as const, capacity: 40, building: 'Main Block', floor: 'Second' },
    { name: 'Science Lab', type: 'room_lab' as const, capacity: 30, building: 'Science Block', floor: 'Ground' },
    { name: 'Computer Lab', type: 'room_lab' as const, capacity: 30, building: 'Science Block', floor: 'First' },
    { name: 'Library', type: 'room_library' as const, capacity: 100, building: 'Main Block', floor: 'Ground' },
    { name: 'Auditorium', type: 'room_auditorium' as const, capacity: 500, building: 'Main Block', floor: 'Ground' },
    { name: 'Sports Hall', type: 'room_sports' as const, capacity: 200, building: 'Sports Complex', floor: 'Ground' },
  ]

  const createdRoomIds: Record<string, string> = {}
  for (const r of roomData) {
    const room = await prisma.room.create({ data: r })
    createdRoomIds[r.name] = room.id
  }
  console.log(`[Seed] Created ${roomData.length} rooms`)

  // ==================== Timetables (2 — Class 10 A and B) ====================

  const class10Id = createdClassIds['Class 10']
  const section10A = sectionLookup['Class 10-A']
  const section10B = sectionLookup['Class 10-B']

  const tt10A = await prisma.timetable.create({
    data: {
      classId: class10Id,
      sectionId: section10A,
      academicYearId: academicYear.id,
      effectiveFrom: new Date('2024-04-01'),
      status: 'tt_published',
    },
  })

  const tt10B = await prisma.timetable.create({
    data: {
      classId: class10Id,
      sectionId: section10B,
      academicYearId: academicYear.id,
      effectiveFrom: new Date('2024-04-01'),
      status: 'tt_published',
    },
  })
  console.log('[Seed] Created 2 timetables (Class 10 A & B)')

  // Timetable entries — Mon-Sat, assign class periods only
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
  const classPeriodNumbers = [1, 2, 3, 5, 6, 8, 9] // skip assembly(0), break(4), lunch(7)
  const ttSubjects = ['ENG', 'HIN', 'MAT', 'SCI', 'SSC', 'CS', 'PE']
  const staffEmails = Object.keys(createdStaffIds)
  // Use teachers (index 2-8 are teachers)
  const teacherStaffIds = staffEmails.slice(2, 9).map(e => createdStaffIds[e])

  let entryCount = 0
  for (const tt of [tt10A, tt10B]) {
    for (const day of days) {
      for (let i = 0; i < classPeriodNumbers.length; i++) {
        const periodNum = classPeriodNumbers[i]
        const subjectCode = ttSubjects[i % ttSubjects.length]
        const subjectId = createdSubjectIds[subjectCode]
        const teacherIdx = (i + (tt === tt10B ? 3 : 0)) % teacherStaffIds.length
        const roomNames = ['Room 101', 'Room 102', 'Room 201', 'Room 202', 'Room 301']
        const roomId = createdRoomIds[roomNames[i % roomNames.length]]

        if (subjectId && createdPeriodIds[periodNum]) {
          await prisma.timetableEntry.create({
            data: {
              timetableId: tt.id,
              dayOfWeek: day,
              periodId: createdPeriodIds[periodNum],
              subjectId,
              teacherId: teacherStaffIds[teacherIdx],
              roomId,
            },
          })
          entryCount++
        }
      }
    }
  }
  console.log(`[Seed] Created ${entryCount} timetable entries`)

  // ==================== Student Attendance (5 days × 2 sections) ====================

  const today = new Date()
  const attendanceDates: Date[] = []
  let d = new Date(today)
  while (attendanceDates.length < 5) {
    d.setDate(d.getDate() - 1)
    const dayOfWeek = d.getDay()
    if (dayOfWeek !== 0) { // Skip Sunday
      attendanceDates.push(new Date(d))
    }
  }
  attendanceDates.reverse()

  // Get students in Class 10 A and B
  const class10AStudents = await prisma.student.findMany({
    where: { classId: class10Id, sectionId: section10A, status: 'active' },
    select: { id: true },
  })
  const class10BStudents = await prisma.student.findMany({
    where: { classId: class10Id, sectionId: section10B, status: 'active' },
    select: { id: true },
  })

  const statusDistribution = ['att_present', 'att_present', 'att_present', 'att_present', 'att_present', 'att_present', 'att_present', 'att_present', 'att_absent', 'att_late', 'att_half_day', 'att_excused'] as const

  for (const attDate of attendanceDates) {
    for (const { sectionId, students } of [
      { sectionId: section10A, students: class10AStudents },
      { sectionId: section10B, students: class10BStudents },
    ]) {
      if (students.length === 0) continue

      const counts = { att_present: 0, att_absent: 0, att_late: 0, att_half_day: 0, att_excused: 0 }
      const dailyAtt = await prisma.studentDailyAttendance.create({
        data: {
          date: attDate,
          classId: class10Id,
          sectionId,
          markedBy: 'Priya Nair',
          totalStudents: students.length,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          halfDayCount: 0,
          excusedCount: 0,
        },
      })

      for (let si = 0; si < students.length; si++) {
        const status = statusDistribution[si % statusDistribution.length]
        counts[status]++
        await prisma.studentAttendanceRecord.create({
          data: {
            dailyAttendanceId: dailyAtt.id,
            studentId: students[si].id,
            status,
            remarks: status === 'att_absent' ? 'Absent without notice' : null,
          },
        })
      }

      await prisma.studentDailyAttendance.update({
        where: { id: dailyAtt.id },
        data: {
          presentCount: counts.att_present,
          absentCount: counts.att_absent,
          lateCount: counts.att_late,
          halfDayCount: counts.att_half_day,
          excusedCount: counts.att_excused,
        },
      })
    }
  }
  console.log(`[Seed] Created student attendance for ${attendanceDates.length} days × 2 sections`)

  // ==================== Period Attendance (3 days × 2 periods for Class 10-A) ====================

  for (let di = 0; di < 3 && di < attendanceDates.length; di++) {
    for (const periodNum of [1, 2]) {
      const periodId = createdPeriodIds[periodNum]
      if (!periodId || class10AStudents.length === 0) continue

      const records = class10AStudents.map((s, si) => ({
        studentId: s.id,
        status: statusDistribution[si % statusDistribution.length] === 'att_present' ? 'present' : 'absent',
        remarks: null,
      }))

      await prisma.periodAttendance.create({
        data: {
          date: attendanceDates[di],
          classId: class10Id,
          sectionId: section10A,
          periodId,
          subjectId: createdSubjectIds[ttSubjects[periodNum - 1]] || null,
          teacherId: teacherStaffIds[0],
          records,
        },
      })
    }
  }
  console.log('[Seed] Created period attendance for 3 days × 2 periods')

  // ==================== Staff Attendance (5 days × 10 staff) ====================

  const activeStaffIds = Object.values(createdStaffIds)
  const staffStatusDist = ['staff_present', 'staff_present', 'staff_present', 'staff_present', 'staff_present', 'staff_present', 'staff_present', 'staff_present', 'staff_absent', 'staff_half_day'] as const

  for (const attDate of attendanceDates) {
    for (let si = 0; si < activeStaffIds.length; si++) {
      const status = staffStatusDist[si % staffStatusDist.length]
      await prisma.staffDailyAttendance.create({
        data: {
          date: attDate,
          staffId: activeStaffIds[si],
          status,
          checkInTime: status !== 'staff_absent' ? '08:00' : null,
          checkOutTime: status === 'staff_present' ? '16:00' : status === 'staff_half_day' ? '12:00' : null,
          remarks: status === 'staff_absent' ? 'Absent' : null,
          markedBy: 'Admin User',
        },
      })
    }
  }
  console.log(`[Seed] Created staff attendance for ${attendanceDates.length} days × ${activeStaffIds.length} staff`)

  // ==================== Leave Balances (10 staff × 4 types) ====================

  const leaveTypes = ['EL', 'CL', 'SL', 'PL'] as const
  const leaveDefaults: Record<string, number> = { EL: 15, CL: 12, SL: 12, PL: 7 }

  for (const sid of activeStaffIds) {
    for (const type of leaveTypes) {
      const used = sid === activeStaffIds[0] ? 2 : sid === activeStaffIds[1] ? 3 : 0
      await prisma.leaveBalance.create({
        data: {
          staffId: sid,
          type,
          academicYearId: academicYear.id,
          total: leaveDefaults[type],
          used: type === 'CL' ? used : 0,
        },
      })
    }
  }
  console.log(`[Seed] Created leave balances for ${activeStaffIds.length} staff × ${leaveTypes.length} types`)

  // ==================== Leave Requests (3) ====================

  // 1. Approved (balance updated)
  await prisma.leaveRequest.create({
    data: {
      staffId: activeStaffIds[2],
      type: 'CL',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-01-16'),
      days: 2,
      reason: 'Family function',
      status: 'leave_approved',
      reviewedBy: 'Admin User',
      reviewRemarks: 'Approved',
      reviewedAt: new Date('2025-01-10'),
    },
  })
  // Update balance for approved leave
  await prisma.leaveBalance.updateMany({
    where: { staffId: activeStaffIds[2], type: 'CL', academicYearId: academicYear.id },
    data: { used: 2 },
  })

  // 2. Pending
  await prisma.leaveRequest.create({
    data: {
      staffId: activeStaffIds[3],
      type: 'EL',
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-03-03'),
      days: 3,
      reason: 'Personal work',
      status: 'leave_pending',
    },
  })

  // 3. Rejected
  await prisma.leaveRequest.create({
    data: {
      staffId: activeStaffIds[4],
      type: 'SL',
      startDate: new Date('2025-02-10'),
      endDate: new Date('2025-02-10'),
      days: 1,
      reason: 'Not feeling well',
      status: 'leave_rejected',
      reviewedBy: 'Dr. Sharma',
      reviewRemarks: 'Please provide medical certificate',
      reviewedAt: new Date('2025-02-09'),
    },
  })
  console.log('[Seed] Created 3 leave requests (1 approved, 1 pending, 1 rejected)')

  // ==================== Substitutions (2) ====================

  // Get a timetable entry for substitution
  const ttEntries = await prisma.timetableEntry.findMany({
    where: { timetableId: tt10A.id },
    take: 2,
  })

  if (ttEntries.length >= 2) {
    // 1. Approved/completed
    await prisma.substitution.create({
      data: {
        date: attendanceDates[0] || new Date(),
        timetableEntryId: ttEntries[0].id,
        originalTeacherId: ttEntries[0].teacherId,
        substituteTeacherId: teacherStaffIds[teacherStaffIds.length - 1],
        reason: 'Original teacher on leave',
        status: 'sub_completed',
        approvedBy: 'Admin User',
        approvedAt: new Date(),
      },
    })

    // 2. Pending
    await prisma.substitution.create({
      data: {
        date: new Date(),
        timetableEntryId: ttEntries[1].id,
        originalTeacherId: ttEntries[1].teacherId,
        substituteTeacherId: teacherStaffIds[0],
        reason: 'Teacher attending conference',
        status: 'sub_pending',
      },
    })
    console.log('[Seed] Created 2 substitutions (1 completed, 1 pending)')
  }

  // ============================================================================
  // Phase 5: Finance / Fees
  // ============================================================================

  // ==================== Fee Types (6) ====================

  const feeTypeData = [
    { name: 'Tuition Fee', category: 'fee_tuition' as const, description: 'Monthly tuition fee for academic instruction' },
    { name: 'Development Fee', category: 'fee_development' as const, description: 'Annual development and infrastructure fee' },
    { name: 'Lab Fee', category: 'fee_lab' as const, description: 'Quarterly laboratory usage fee' },
    { name: 'Computer Fee', category: 'fee_computer' as const, description: 'Quarterly computer lab and IT fee' },
    { name: 'Sports Fee', category: 'fee_sports' as const, description: 'Annual sports and physical education fee' },
    { name: 'Examination Fee', category: 'fee_examination' as const, description: 'Per-examination fee' },
  ]

  const createdFeeTypeIds: Record<string, string> = {}
  for (const ft of feeTypeData) {
    const feeType = await prisma.feeType.create({ data: ft })
    createdFeeTypeIds[ft.name] = feeType.id
  }
  console.log(`[Seed] Created ${feeTypeData.length} fee types`)

  // ==================== Fee Structures (4) ====================

  const allClassNames = classNames // from Phase 2 seed data
  const highSchoolClasses = ['Class 9', 'Class 10', 'Class 11', 'Class 12']
  const middleHighClasses = ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']

  const feeStructureData = [
    {
      feeTypeId: createdFeeTypeIds['Tuition Fee'],
      academicYear: '2024-25',
      applicableClasses: allClassNames,
      amount: 5000,
      frequency: 'freq_monthly' as const,
      dueDay: 10,
      isOptional: false,
    },
    {
      feeTypeId: createdFeeTypeIds['Development Fee'],
      academicYear: '2024-25',
      applicableClasses: allClassNames,
      amount: 15000,
      frequency: 'freq_annual' as const,
      dueDay: 15,
      isOptional: false,
    },
    {
      feeTypeId: createdFeeTypeIds['Lab Fee'],
      academicYear: '2024-25',
      applicableClasses: highSchoolClasses,
      amount: 3000,
      frequency: 'freq_quarterly' as const,
      dueDay: 10,
      isOptional: false,
    },
    {
      feeTypeId: createdFeeTypeIds['Computer Fee'],
      academicYear: '2024-25',
      applicableClasses: middleHighClasses,
      amount: 2000,
      frequency: 'freq_quarterly' as const,
      dueDay: 10,
      isOptional: false,
    },
  ]

  const createdFeeStructureIds: Record<string, string> = {}
  for (const fs of feeStructureData) {
    const feeStructure = await prisma.feeStructure.create({ data: fs })
    createdFeeStructureIds[fs.feeTypeId] = feeStructure.id
  }
  console.log(`[Seed] Created ${feeStructureData.length} fee structures`)

  // ==================== Student Fees (~40) ====================

  const allStudentEmails = seedStudents.map((s) => s.email)
  const tuitionStructureId = createdFeeStructureIds[createdFeeTypeIds['Tuition Fee']]
  const developmentStructureId = createdFeeStructureIds[createdFeeTypeIds['Development Fee']]

  const createdStudentFeeIds: string[] = []
  const paidStudentFeeIds: string[] = []

  // Status distribution for seed: paid(10), partial(4), pending(3), overdue(2), waived(1)
  const feeStatuses = [
    'fps_paid', 'fps_paid', 'fps_paid', 'fps_paid', 'fps_paid',
    'fps_paid', 'fps_paid', 'fps_paid', 'fps_paid', 'fps_paid',
    'fps_partial', 'fps_partial', 'fps_partial', 'fps_partial',
    'fps_pending', 'fps_pending', 'fps_pending',
    'fps_overdue', 'fps_overdue',
    'fps_waived',
  ]

  for (let i = 0; i < allStudentEmails.length; i++) {
    const studentId = createdStudentIds[allStudentEmails[i]]
    if (!studentId) continue

    const tuitionStatus = feeStatuses[i % feeStatuses.length] as any
    const devStatus = feeStatuses[(i + 5) % feeStatuses.length] as any

    // Tuition fee for each student
    const tuitionPaid = tuitionStatus === 'fps_paid' ? 5000
      : tuitionStatus === 'fps_partial' ? 3000
      : tuitionStatus === 'fps_waived' ? 0 : 0
    const tuitionDiscount = tuitionStatus === 'fps_waived' ? 5000 : 0

    const tuitionFee = await prisma.studentFee.create({
      data: {
        studentId,
        feeStructureId: tuitionStructureId,
        feeTypeId: createdFeeTypeIds['Tuition Fee'],
        academicYear: '2024-25',
        totalAmount: 5000,
        paidAmount: tuitionPaid,
        discountAmount: tuitionDiscount,
        dueDate: new Date('2025-01-10'),
        status: tuitionStatus,
      },
    })
    createdStudentFeeIds.push(tuitionFee.id)
    if (tuitionStatus === 'fps_paid' || tuitionStatus === 'fps_partial') {
      paidStudentFeeIds.push(tuitionFee.id)
    }

    // Development fee for each student
    const devPaid = devStatus === 'fps_paid' ? 15000
      : devStatus === 'fps_partial' ? 8000
      : devStatus === 'fps_waived' ? 0 : 0
    const devDiscount = devStatus === 'fps_waived' ? 15000 : 0

    const devFee = await prisma.studentFee.create({
      data: {
        studentId,
        feeStructureId: developmentStructureId,
        feeTypeId: createdFeeTypeIds['Development Fee'],
        academicYear: '2024-25',
        totalAmount: 15000,
        paidAmount: devPaid,
        discountAmount: devDiscount,
        dueDate: new Date('2024-04-15'),
        status: devStatus,
      },
    })
    createdStudentFeeIds.push(devFee.id)
    if (devStatus === 'fps_paid' || devStatus === 'fps_partial') {
      paidStudentFeeIds.push(devFee.id)
    }
  }
  console.log(`[Seed] Created ${createdStudentFeeIds.length} student fees`)

  // ==================== Payments (one per paid/partial StudentFee) ====================

  const paymentModes = ['pm_cash', 'pm_upi', 'pm_bank_transfer', 'pm_cash', 'pm_upi', 'pm_bank_transfer',
    'pm_cheque', 'pm_upi', 'pm_cash', 'pm_online', 'pm_bank_transfer', 'pm_upi'] as const

  let ledgerBalance = 0

  for (let i = 0; i < paidStudentFeeIds.length; i++) {
    const sfId = paidStudentFeeIds[i]
    const sf = await prisma.studentFee.findUnique({
      where: { id: sfId },
      include: { student: true },
    })
    if (!sf) continue

    const amount = Number(sf.paidAmount)
    if (amount <= 0) continue

    const dateNum = String((i % 28) + 1).padStart(2, '0')
    const receiptNumber = `RCP-20250101-${String(i + 1).padStart(4, '0')}`

    await prisma.payment.create({
      data: {
        receiptNumber,
        studentId: sf.studentId,
        studentFeeId: sfId,
        amount,
        paymentMode: paymentModes[i % paymentModes.length],
        transactionRef: i % 3 === 0 ? null : `TXN-${100000 + i}`,
        remarks: null,
        collectedBy: 'Rahul Accounts',
        collectedById: createdUsers['accounts@paperbook.in'] || null,
        collectedAt: new Date(`2025-01-${dateNum}T10:00:00Z`),
        status: 'active',
      },
    })

    // Ledger credit entry
    ledgerBalance += amount
    await prisma.ledgerEntry.create({
      data: {
        date: new Date(`2025-01-${dateNum}`),
        type: 'ledger_credit',
        category: 'fee_collection',
        referenceId: sfId,
        referenceNumber: receiptNumber,
        description: `Fee collection from ${sf.student?.firstName} ${sf.student?.lastName}`,
        amount,
        balance: ledgerBalance,
      },
    })
  }
  console.log(`[Seed] Created ${paymentCount} payments with receipts and ledger entries`)

  // ==================== Expenses (5) ====================

  const expenseData = [
    {
      expenseNumber: 'EXP-20250101-0001',
      category: 'exp_salary' as const,
      description: 'January 2025 teaching staff salaries',
      amount: 500000,
      vendorName: null,
      invoiceNumber: null,
      invoiceDate: null,
      status: 'es_paid' as const,
      requestedBy: 'Admin User',
      requestedAt: new Date('2025-01-01'),
      approvedBy: 'Dr. Sharma',
      approvedAt: new Date('2025-01-02'),
      paidAt: new Date('2025-01-05'),
      paidBy: 'Rahul Accounts',
      paidRef: 'SAL-JAN-2025',
    },
    {
      expenseNumber: 'EXP-20250110-0001',
      category: 'exp_utilities' as const,
      description: 'Electricity bill for December 2024',
      amount: 45000,
      vendorName: 'BSES Delhi',
      invoiceNumber: 'BSES-DEC-2024-1234',
      invoiceDate: new Date('2025-01-05'),
      status: 'es_paid' as const,
      requestedBy: 'Vikram Singh',
      requestedAt: new Date('2025-01-10'),
      approvedBy: 'Dr. Sharma',
      approvedAt: new Date('2025-01-11'),
      paidAt: new Date('2025-01-12'),
      paidBy: 'Rahul Accounts',
      paidRef: 'CHQ-4567',
    },
    {
      expenseNumber: 'EXP-20250115-0001',
      category: 'exp_supplies' as const,
      description: 'Purchase of lab equipment for Physics lab',
      amount: 75000,
      vendorName: 'Scientific Instruments Co.',
      invoiceNumber: 'SIC-2025-0123',
      invoiceDate: new Date('2025-01-14'),
      status: 'es_pending_approval' as const,
      requestedBy: 'Amit Pandey',
      requestedAt: new Date('2025-01-15'),
      approvedBy: null,
      approvedAt: null,
      paidAt: null,
      paidBy: null,
      paidRef: null,
    },
    {
      expenseNumber: 'EXP-20250118-0001',
      category: 'exp_maintenance' as const,
      description: 'Building repair and painting of classrooms',
      amount: 120000,
      vendorName: 'BuildRight Construction',
      invoiceNumber: 'BRC-2025-045',
      invoiceDate: new Date('2025-01-16'),
      status: 'es_approved' as const,
      requestedBy: 'Admin User',
      requestedAt: new Date('2025-01-18'),
      approvedBy: 'Dr. Sharma',
      approvedAt: new Date('2025-01-19'),
      paidAt: null,
      paidBy: null,
      paidRef: null,
    },
    {
      expenseNumber: 'EXP-20250120-0001',
      category: 'exp_events' as const,
      description: 'Sports day prizes and equipment',
      amount: 25000,
      vendorName: 'SportsMart India',
      invoiceNumber: 'SM-2025-789',
      invoiceDate: new Date('2025-01-19'),
      status: 'es_rejected' as const,
      requestedBy: 'Suresh Pillai',
      requestedAt: new Date('2025-01-20'),
      approvedBy: null,
      approvedAt: null,
      rejectedBy: 'Dr. Sharma',
      rejectedAt: new Date('2025-01-21'),
      rejectedReason: 'Budget exceeded for sports category this quarter. Please resubmit next quarter.',
      paidAt: null,
      paidBy: null,
      paidRef: null,
    },
  ]

  for (const exp of expenseData) {
    await prisma.expense.create({
      data: {
        expenseNumber: exp.expenseNumber,
        category: exp.category,
        description: exp.description,
        amount: exp.amount,
        vendorName: exp.vendorName,
        invoiceNumber: exp.invoiceNumber,
        invoiceDate: exp.invoiceDate,
        status: exp.status,
        requestedBy: exp.requestedBy,
        requestedAt: exp.requestedAt,
        approvedBy: exp.approvedBy,
        approvedAt: exp.approvedAt,
        rejectedBy: (exp as any).rejectedBy || null,
        rejectedAt: (exp as any).rejectedAt || null,
        rejectedReason: (exp as any).rejectedReason || null,
        paidAt: exp.paidAt,
        paidBy: exp.paidBy,
        paidRef: exp.paidRef,
      },
    })
  }
  console.log(`[Seed] Created ${expenseData.length} expenses`)

  // Ledger entries for paid expenses
  const paidExpenses = expenseData.filter((e) => e.status === 'es_paid')
  for (const exp of paidExpenses) {
    ledgerBalance -= exp.amount
    await prisma.ledgerEntry.create({
      data: {
        date: exp.paidAt!,
        type: 'ledger_debit',
        category: 'expense_payment',
        referenceNumber: exp.expenseNumber,
        description: `Expense: ${exp.description}`,
        amount: exp.amount,
        balance: ledgerBalance,
      },
    })
  }
  console.log(`[Seed] Created ledger entries for ${paidExpenses.length} paid expenses`)

  // ============================================================================
  // Phase 6: Exams
  // ============================================================================

  // ==================== Grade Scale (1 CBSE default) ====================

  const gradeScale = await prisma.gradeScale.create({
    data: {
      name: 'CBSE Standard Grading',
      isDefault: true,
      ranges: [
        { grade: 'A1', minMarks: 91, maxMarks: 100, description: 'Outstanding' },
        { grade: 'A2', minMarks: 81, maxMarks: 90, description: 'Excellent' },
        { grade: 'B1', minMarks: 71, maxMarks: 80, description: 'Very Good' },
        { grade: 'B2', minMarks: 61, maxMarks: 70, description: 'Good' },
        { grade: 'C1', minMarks: 51, maxMarks: 60, description: 'Above Average' },
        { grade: 'C2', minMarks: 41, maxMarks: 50, description: 'Average' },
        { grade: 'D', minMarks: 33, maxMarks: 40, description: 'Below Average' },
        { grade: 'E', minMarks: 0, maxMarks: 32, description: 'Needs Improvement' },
      ],
    },
  })
  console.log('[Seed] Created CBSE grade scale')

  // ==================== Exams (3) ====================

  const highSchoolSubjectCodes = ['ENG', 'HIN', 'MAT', 'SCI', 'SSC', 'CS', 'PE']
  const allSubjectCodes = ['ENG', 'HIN', 'MAT', 'SCI', 'SSC', 'PE', 'ART']

  const exam1 = await prisma.exam.create({
    data: {
      name: 'Unit Test 1',
      type: 'et_unit_test',
      academicYear: '2024-25',
      term: 'Term 1',
      applicableClasses: ['Class 9', 'Class 10', 'Class 11', 'Class 12'],
      subjects: highSchoolSubjectCodes.map(code => createdSubjectIds[code]).filter(Boolean),
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-07-20'),
      status: 'exs_results_published',
    },
  })

  const exam2 = await prisma.exam.create({
    data: {
      name: 'Mid-Term Examination',
      type: 'et_mid_term',
      academicYear: '2024-25',
      term: 'Term 1',
      applicableClasses: classNames,
      subjects: [...new Set([...allSubjectCodes, ...highSchoolSubjectCodes])].map(code => createdSubjectIds[code]).filter(Boolean),
      startDate: new Date('2024-09-15'),
      endDate: new Date('2024-09-30'),
      status: 'exs_results_published',
    },
  })

  const exam3 = await prisma.exam.create({
    data: {
      name: 'Quarterly Examination',
      type: 'et_quarterly',
      academicYear: '2024-25',
      term: 'Term 2',
      applicableClasses: classNames,
      subjects: [...new Set([...allSubjectCodes, ...highSchoolSubjectCodes])].map(code => createdSubjectIds[code]).filter(Boolean),
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-15'),
      status: 'exs_completed',
    },
  })
  console.log('[Seed] Created 3 exams')

  // ==================== Grade helper ====================

  function getGrade(percentage: number): string {
    if (percentage >= 91) return 'A1'
    if (percentage >= 81) return 'A2'
    if (percentage >= 71) return 'B1'
    if (percentage >= 61) return 'B2'
    if (percentage >= 51) return 'C1'
    if (percentage >= 41) return 'C2'
    if (percentage >= 33) return 'D'
    return 'E'
  }

  // ==================== Student Marks + Report Cards for published exams ====================

  let markCount = 0
  let reportCardCount = 0

  for (const exam of [exam1, exam2]) {
    const applicableClasses = exam.applicableClasses as string[]

    // Collect student marks for report cards
    const studentMarksMap: Record<string, { marks: { subjectName: string; subjectCode: string; maxMarks: number; obtained: number; grade: string }[]; total: number; maxTotal: number }> = {}

    for (const s of seedStudents) {
      const studentId = createdStudentIds[s.email]
      if (!studentId) continue
      if (!applicableClasses.includes(s.class)) continue

      // Determine which subjects this student takes
      const classNum = parseInt(s.class.replace('Class ', ''))
      let studentSubjectCodes: string[]
      if (classNum <= 8) studentSubjectCodes = allSubjectCodes
      else if (classNum <= 10) studentSubjectCodes = highSchoolSubjectCodes
      else studentSubjectCodes = ['ENG', 'PHY', 'CHE', 'MAT', 'CS', 'PE']

      studentMarksMap[studentId] = { marks: [], total: 0, maxTotal: 0 }

      // 5% chance of being absent per subject
      for (const code of studentSubjectCodes) {
        const subjectId = createdSubjectIds[code]
        if (!subjectId) continue

        const isAbsent = Math.random() < 0.05
        // Realistic marks: normal distribution centered around 72 with std dev 15
        const rawMark = isAbsent ? 0 : Math.round(Math.min(100, Math.max(15, 72 + (Math.random() + Math.random() + Math.random() - 1.5) * 30)))
        const grade = isAbsent ? 'E' : getGrade(rawMark)

        await prisma.studentMark.create({
          data: {
            examId: exam.id,
            studentId,
            subjectId,
            marksObtained: rawMark,
            maxMarks: 100,
            grade,
            isAbsent,
            remarks: isAbsent ? 'Absent during examination' : null,
          },
        })
        markCount++

        const subjectInfo = subjects.find(sub => sub.code === code)
        studentMarksMap[studentId].marks.push({
          subjectName: subjectInfo?.name || code,
          subjectCode: code,
          maxMarks: 100,
          obtained: rawMark,
          grade,
        })
        studentMarksMap[studentId].total += rawMark
        studentMarksMap[studentId].maxTotal += 100
      }
    }

    // Generate report cards (sorted by percentage for rank)
    const studentEntries = Object.entries(studentMarksMap).map(([studentId, data]) => ({
      studentId,
      ...data,
      percentage: data.maxTotal > 0 ? (data.total / data.maxTotal) * 100 : 0,
    }))
    studentEntries.sort((a, b) => b.percentage - a.percentage)

    for (let rank = 0; rank < studentEntries.length; rank++) {
      const entry = studentEntries[rank]
      const s = seedStudents.find(st => createdStudentIds[st.email] === entry.studentId)
      if (!s) continue

      await prisma.reportCard.create({
        data: {
          examId: exam.id,
          studentId: entry.studentId,
          studentName: `${s.firstName} ${s.lastName}`,
          studentClass: s.class,
          studentSection: s.section,
          admissionNumber: `ADM-2024-${String(seedStudents.indexOf(s) + 1).padStart(4, '0')}`,
          rollNumber: s.rollNumber,
          academicYear: '2024-25',
          term: exam.term,
          examName: exam.name,
          subjects: entry.marks,
          totalMarks: entry.maxTotal,
          totalObtained: entry.total,
          percentage: Math.round(entry.percentage * 100) / 100,
          grade: getGrade(entry.percentage),
          rank: rank + 1,
          attendance: { totalDays: 120, presentDays: 110 + Math.floor(Math.random() * 10) },
        },
      })
      reportCardCount++
    }
  }
  console.log(`[Seed] Created ${markCount} student marks and ${reportCardCount} report cards`)

  // ==================== Exam Slots (7 for Mid-Term, Class 9-10) ====================

  const midTermSubjects = ['ENG', 'HIN', 'MAT', 'SCI', 'SSC', 'CS', 'PE']
  const invigilators = ['Priya Nair', 'Amit Pandey', 'Deepa Menon', 'Ramesh Yadav', 'Kavita Sharma', 'Suresh Pillai', 'Anjali Mishra']
  const slotRooms = ['Room 101', 'Room 102', 'Room 201', 'Room 202', 'Room 301', 'Science Lab', 'Sports Hall']

  for (let i = 0; i < midTermSubjects.length; i++) {
    const code = midTermSubjects[i]
    const subjectId = createdSubjectIds[code]
    const subjectInfo = subjects.find(s => s.code === code)
    if (!subjectId || !subjectInfo) continue

    const slotDate = new Date('2024-09-15')
    slotDate.setDate(slotDate.getDate() + Math.floor(i / 2) * 2) // 2 exams per day, every other day

    await prisma.examSlot.create({
      data: {
        examId: exam2.id,
        subjectId,
        subjectName: subjectInfo.name,
        subjectCode: code,
        date: slotDate,
        startTime: i % 2 === 0 ? '09:00' : '14:00',
        endTime: i % 2 === 0 ? '12:00' : '17:00',
        room: slotRooms[i],
        invigilator: invigilators[i],
        applicableClasses: ['Class 9', 'Class 10'],
      },
    })
  }
  console.log(`[Seed] Created ${midTermSubjects.length} exam slots for Mid-Term`)

  // ==================== Co-Scholastic Records (40 — 2 per student) ====================

  const coScholasticAreas = ['csa_art', 'csa_sports', 'csa_discipline', 'csa_yoga', 'csa_music', 'csa_work_education'] as const
  const coScholasticGrades = ['A', 'A', 'B+', 'B', 'A-', 'B+', 'A', 'B']

  let coSchCount = 0
  for (const s of seedStudents) {
    const studentId = createdStudentIds[s.email]
    if (!studentId) continue

    for (let a = 0; a < 2; a++) {
      const areaIdx = (seedStudents.indexOf(s) * 2 + a) % coScholasticAreas.length
      await prisma.coScholasticRecord.create({
        data: {
          studentId,
          academicYear: '2024-25',
          term: 'Term 1',
          area: coScholasticAreas[areaIdx],
          grade: coScholasticGrades[(seedStudents.indexOf(s) + a) % coScholasticGrades.length],
          assessedBy: invigilators[Math.floor(Math.random() * invigilators.length)],
          remarks: a === 0 ? 'Shows good participation' : null,
        },
      })
      coSchCount++
    }
  }
  console.log(`[Seed] Created ${coSchCount} co-scholastic records`)

  // ==================== Question Papers (2) ====================

  await prisma.questionPaper.create({
    data: {
      examId: exam2.id,
      subjectId: createdSubjectIds['MAT'],
      subjectName: 'Mathematics',
      subjectCode: 'MAT',
      className: 'Class 10',
      academicYear: '2024-25',
      term: 'Term 1',
      totalMarks: 100,
      duration: '3 hours',
      difficulty: 'pd_medium',
      sections: [
        { name: 'Section A', type: 'MCQ', marks: 20, questions: 20, marksPerQuestion: 1, instructions: 'Choose the correct option' },
        { name: 'Section B', type: 'Short Answer', marks: 30, questions: 6, marksPerQuestion: 5, instructions: 'Answer in 50-80 words' },
        { name: 'Section C', type: 'Long Answer', marks: 50, questions: 5, marksPerQuestion: 10, instructions: 'Answer in 150-200 words with diagrams where necessary' },
      ],
      createdBy: 'Priya Nair',
    },
  })

  await prisma.questionPaper.create({
    data: {
      examId: exam2.id,
      subjectId: createdSubjectIds['ENG'],
      subjectName: 'English',
      subjectCode: 'ENG',
      className: 'Class 10',
      academicYear: '2024-25',
      term: 'Term 1',
      totalMarks: 100,
      duration: '3 hours',
      difficulty: 'pd_medium',
      sections: [
        { name: 'Section A - Reading', type: 'Comprehension', marks: 20, questions: 2, marksPerQuestion: 10, instructions: 'Read the passages and answer questions' },
        { name: 'Section B - Writing', type: 'Essay/Letter', marks: 30, questions: 3, marksPerQuestion: 10, instructions: 'Write as per given format' },
        { name: 'Section C - Grammar', type: 'Short Answer', marks: 20, questions: 10, marksPerQuestion: 2, instructions: 'Answer the grammar questions' },
        { name: 'Section D - Literature', type: 'Long Answer', marks: 30, questions: 3, marksPerQuestion: 10, instructions: 'Answer with reference to context' },
      ],
      createdBy: 'Deepa Menon',
    },
  })
  console.log('[Seed] Created 2 question papers')

  // ==================== Bank Questions (15) ====================

  const bankQuestions = [
    // MCQ - Easy
    { question: 'What is the value of x in the equation 2x + 6 = 14?', type: 'qt_mcq' as const, options: ['x = 2', 'x = 4', 'x = 6', 'x = 8'], correctAnswer: 'x = 4', points: 1, subject: 'Mathematics', topic: 'Algebra', difficulty: 'qd_easy' as const, tags: ['algebra', 'linear-equations'], explanation: 'Subtract 6 from both sides: 2x = 8, then divide by 2: x = 4' },
    { question: 'Which of the following is a factor of x² - 9?', type: 'qt_mcq' as const, options: ['(x+3)', '(x+9)', '(x-9)', '(x+1)'], correctAnswer: '(x+3)', points: 1, subject: 'Mathematics', topic: 'Algebra', difficulty: 'qd_easy' as const, tags: ['algebra', 'factoring'], explanation: 'x² - 9 = (x+3)(x-3), so (x+3) is a factor' },
    { question: 'The sum of angles in a triangle is:', type: 'qt_mcq' as const, options: ['90°', '180°', '270°', '360°'], correctAnswer: '180°', points: 1, subject: 'Mathematics', topic: 'Geometry', difficulty: 'qd_easy' as const, tags: ['geometry', 'triangles'], explanation: 'The angle sum property of a triangle states the sum is always 180°' },
    { question: 'If a = 3 and b = 4, what is a² + b²?', type: 'qt_mcq' as const, options: ['7', '12', '25', '49'], correctAnswer: '25', points: 1, subject: 'Mathematics', topic: 'Algebra', difficulty: 'qd_easy' as const, tags: ['algebra', 'substitution'], explanation: '3² + 4² = 9 + 16 = 25' },
    { question: 'The area of a circle with radius 7 cm is:', type: 'qt_mcq' as const, options: ['44 cm²', '154 cm²', '22 cm²', '308 cm²'], correctAnswer: '154 cm²', points: 1, subject: 'Mathematics', topic: 'Geometry', difficulty: 'qd_easy' as const, tags: ['geometry', 'circles'], explanation: 'A = πr² = 22/7 × 7² = 154 cm²' },
    // Short Answer - Medium
    { question: 'Solve the quadratic equation: x² - 5x + 6 = 0. Find both roots.', type: 'qt_short_answer' as const, options: [], correctAnswer: 'x = 2, x = 3', points: 3, subject: 'Mathematics', topic: 'Algebra', difficulty: 'qd_medium' as const, tags: ['algebra', 'quadratic'], explanation: 'Factor as (x-2)(x-3) = 0, so x = 2 or x = 3' },
    { question: 'Find the HCF and LCM of 12 and 18.', type: 'qt_short_answer' as const, options: [], correctAnswer: 'HCF = 6, LCM = 36', points: 3, subject: 'Mathematics', topic: 'Number Theory', difficulty: 'qd_medium' as const, tags: ['number-theory', 'hcf-lcm'], explanation: '12 = 2² × 3, 18 = 2 × 3², HCF = 2 × 3 = 6, LCM = 2² × 3² = 36' },
    { question: 'Prove that the diagonals of a rectangle are equal.', type: 'qt_short_answer' as const, options: [], correctAnswer: 'Using Pythagoras theorem on right triangles formed by diagonals', points: 5, subject: 'Mathematics', topic: 'Geometry', difficulty: 'qd_medium' as const, tags: ['geometry', 'rectangles', 'proofs'], explanation: 'In rectangle ABCD, AC² = AB² + BC² and BD² = AB² + CD². Since BC = AD, AC = BD.' },
    { question: 'If sin θ = 3/5, find cos θ and tan θ.', type: 'qt_short_answer' as const, options: [], correctAnswer: 'cos θ = 4/5, tan θ = 3/4', points: 3, subject: 'Mathematics', topic: 'Trigonometry', difficulty: 'qd_medium' as const, tags: ['trigonometry', 'ratios'], explanation: 'Using sin²θ + cos²θ = 1: cos θ = 4/5, tan θ = sin θ / cos θ = 3/4' },
    { question: 'Find the 10th term of the arithmetic progression: 3, 7, 11, 15, ...', type: 'qt_short_answer' as const, options: [], correctAnswer: '39', points: 2, subject: 'Mathematics', topic: 'Algebra', difficulty: 'qd_medium' as const, tags: ['algebra', 'AP', 'sequences'], explanation: 'a = 3, d = 4, a₁₀ = a + 9d = 3 + 36 = 39' },
    // True/False - Hard
    { question: 'Every irrational number can be represented as a non-terminating, non-repeating decimal.', type: 'qt_true_false' as const, options: ['True', 'False'], correctAnswer: 'True', points: 1, subject: 'Mathematics', topic: 'Number Theory', difficulty: 'qd_hard' as const, tags: ['number-theory', 'irrational-numbers'], explanation: 'By definition, irrational numbers have non-terminating, non-repeating decimal expansions' },
    { question: 'The tangent to a circle at a point is perpendicular to the radius at that point.', type: 'qt_true_false' as const, options: ['True', 'False'], correctAnswer: 'True', points: 1, subject: 'Mathematics', topic: 'Geometry', difficulty: 'qd_hard' as const, tags: ['geometry', 'circles', 'tangent'], explanation: 'This is a fundamental theorem in circle geometry' },
    { question: 'If two triangles are similar, their areas are in the same ratio as their corresponding sides.', type: 'qt_true_false' as const, options: ['True', 'False'], correctAnswer: 'False', points: 1, subject: 'Mathematics', topic: 'Geometry', difficulty: 'qd_hard' as const, tags: ['geometry', 'similarity'], explanation: 'Areas are in the ratio of the square of corresponding sides, not the sides themselves' },
    { question: 'The product of two consecutive integers is always even.', type: 'qt_true_false' as const, options: ['True', 'False'], correctAnswer: 'True', points: 1, subject: 'Mathematics', topic: 'Number Theory', difficulty: 'qd_hard' as const, tags: ['number-theory', 'even-odd'], explanation: 'One of two consecutive integers must be even, making the product even' },
    { question: 'A quadratic equation can have at most three real roots.', type: 'qt_true_false' as const, options: ['True', 'False'], correctAnswer: 'False', points: 1, subject: 'Mathematics', topic: 'Algebra', difficulty: 'qd_hard' as const, tags: ['algebra', 'quadratic'], explanation: 'A quadratic equation has degree 2, so it can have at most 2 real roots' },
  ]

  const createdBankQuestionIds: string[] = []
  for (const q of bankQuestions) {
    const bq = await prisma.bankQuestion.create({
      data: {
        question: q.question,
        type: q.type,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        tags: q.tags,
        explanation: q.explanation,
        status: 'qs_active',
        createdBy: 'Priya Nair',
        usageCount: Math.floor(Math.random() * 10),
      },
    })
    createdBankQuestionIds.push(bq.id)
  }
  console.log(`[Seed] Created ${bankQuestions.length} bank questions`)

  // ==================== Online Exams (2) + Attempts (3) ====================

  const onlineExam1 = await prisma.onlineExam.create({
    data: {
      title: 'Math Quiz - Chapter 5: Quadratic Equations',
      description: 'A timed quiz covering quadratic equations, factoring, and the quadratic formula. Complete within 30 minutes.',
      duration: 30,
      passingScore: 60,
      questionIds: createdBankQuestionIds.slice(0, 10),
      maxAttempts: 2,
      negativeMarkingEnabled: false,
      security: { fullScreen: true, tabSwitchLimit: 3, copyPasteDisabled: true },
      status: 'oes_completed',
      schedule: { startDate: '2024-11-01T09:00:00Z', endDate: '2024-11-01T17:00:00Z' },
      isScheduled: true,
      createdBy: 'Priya Nair',
    },
  })

  await prisma.onlineExam.create({
    data: {
      title: 'Science Practice Test - Physics Fundamentals',
      description: 'Practice test covering Newton\'s Laws, Motion, and Force. No negative marking.',
      duration: 45,
      passingScore: 50,
      questionIds: createdBankQuestionIds.slice(5, 15),
      maxAttempts: 3,
      negativeMarkingEnabled: false,
      security: { fullScreen: false, tabSwitchLimit: 5, copyPasteDisabled: false },
      status: 'oes_scheduled',
      schedule: { startDate: '2025-04-01T09:00:00Z', endDate: '2025-04-01T17:00:00Z' },
      isScheduled: true,
      createdBy: 'Amit Pandey',
    },
  })
  console.log('[Seed] Created 2 online exams')

  // Attempts for online exam 1
  const attemptStudents = [
    { email: 'prisha.malhotra@student.paperbook.in', name: 'Prisha Malhotra', score: 80, passed: true, status: 'eas_submitted' as const },
    { email: 'siddharth.bhat@student.paperbook.in', name: 'Siddharth Bhat', score: 45, passed: false, status: 'eas_submitted' as const },
    { email: 'riya.kapoor@student.paperbook.in', name: 'Riya Kapoor', score: 30, passed: false, status: 'eas_in_progress' as const },
  ]

  for (const att of attemptStudents) {
    const studentId = createdStudentIds[att.email]
    if (!studentId) continue

    await prisma.onlineExamAttempt.create({
      data: {
        examId: onlineExam1.id,
        studentId,
        studentName: att.name,
        startedAt: new Date('2024-11-01T10:00:00Z'),
        submittedAt: att.status === 'eas_submitted' ? new Date('2024-11-01T10:25:00Z') : null,
        timeSpent: att.status === 'eas_submitted' ? 25 * 60 : 15 * 60,
        score: att.score,
        totalPoints: 100,
        percentage: att.score,
        passed: att.passed,
        tabSwitchCount: Math.floor(Math.random() * 3),
        status: att.status,
        answers: bankQuestions.slice(0, 10).map((q, idx) => ({
          questionId: createdBankQuestionIds[idx],
          selectedAnswer: idx < (att.score / 10) ? q.correctAnswer : 'Wrong answer',
          isCorrect: idx < (att.score / 10),
          timeTaken: 30 + Math.floor(Math.random() * 120),
        })),
        securityViolations: [],
      },
    })
  }
  console.log('[Seed] Created 3 online exam attempts')

  // ============================================================================
  // Phase 7: Admissions
  // ============================================================================

  // ==================== Admission Communication Templates (4) ====================

  const admCommTemplates = [
    {
      name: 'Application Received',
      trigger: 'ct_application_received' as const,
      type: 'comm_email' as const,
      subject: 'Application Received - {{application_number}}',
      body: 'Dear {{parent_name}},\n\nThank you for submitting the admission application for {{student_name}} to {{class}}.\n\nApplication Number: {{application_number}}\n\nWe will review your application and get back to you shortly.\n\nRegards,\nDelhi Public School',
      variables: ['parent_name', 'student_name', 'class', 'application_number'],
    },
    {
      name: 'Status Update',
      trigger: 'ct_status_change' as const,
      type: 'comm_email' as const,
      subject: 'Application Status Update - {{application_number}}',
      body: 'Dear {{parent_name}},\n\nThe status of your admission application ({{application_number}}) for {{student_name}} has been updated to: {{new_status}}.\n\n{{additional_info}}\n\nRegards,\nDelhi Public School',
      variables: ['parent_name', 'student_name', 'application_number', 'new_status', 'additional_info'],
    },
    {
      name: 'Entrance Exam Scheduled',
      trigger: 'ct_exam_scheduled' as const,
      type: 'comm_email' as const,
      subject: 'Entrance Exam Schedule - {{student_name}}',
      body: 'Dear {{parent_name}},\n\nThe entrance examination for {{student_name}} has been scheduled:\n\nDate: {{exam_date}}\nTime: {{exam_time}}\nVenue: {{venue}}\nDuration: {{duration}} minutes\n\nPlease ensure your ward arrives 15 minutes before the exam.\n\nRegards,\nDelhi Public School',
      variables: ['parent_name', 'student_name', 'exam_date', 'exam_time', 'venue', 'duration'],
    },
    {
      name: 'Admission Approved',
      trigger: 'ct_approved' as const,
      type: 'comm_email' as const,
      subject: 'Congratulations! Admission Approved - {{student_name}}',
      body: 'Dear {{parent_name}},\n\nWe are pleased to inform you that the admission application for {{student_name}} to {{class}} has been approved!\n\nPlease complete the following steps:\n1. Pay the admission fee of Rs. {{fee_amount}} by {{due_date}}\n2. Submit original documents for verification\n3. Collect the admission kit from the front office\n\nWelcome to Delhi Public School!\n\nRegards,\nAdmissions Office',
      variables: ['parent_name', 'student_name', 'class', 'fee_amount', 'due_date'],
    },
  ]

  for (const tmpl of admCommTemplates) {
    await prisma.admissionCommTemplate.create({
      data: {
        name: tmpl.name,
        trigger: tmpl.trigger,
        type: tmpl.type,
        subject: tmpl.subject,
        body: tmpl.body,
        variables: tmpl.variables,
        isActive: true,
      },
    })
  }
  console.log(`[Seed] Created ${admCommTemplates.length} admission communication templates`)

  // ==================== Entrance Exam Schedules (2) ====================

  await prisma.admEntranceExamSchedule.create({
    data: {
      class: 'Class 1',
      examDate: new Date('2025-02-15'),
      examTime: '10:00 AM',
      venue: 'Auditorium',
      duration: 60,
      totalMarks: 50,
      passingMarks: 20,
      subjects: ['English', 'Mathematics', 'General Awareness'],
      status: 'aes_completed',
      registeredCount: 15,
      completedCount: 12,
    },
  })

  await prisma.admEntranceExamSchedule.create({
    data: {
      class: 'Class 6',
      examDate: new Date('2025-03-01'),
      examTime: '10:00 AM',
      venue: 'Room 201',
      duration: 90,
      totalMarks: 100,
      passingMarks: 40,
      subjects: ['English', 'Hindi', 'Mathematics', 'Science', 'General Knowledge'],
      status: 'aes_upcoming',
      registeredCount: 8,
      completedCount: 0,
    },
  })
  console.log('[Seed] Created 2 entrance exam schedules')

  // ==================== Admission Applications (8) ====================

  interface AdmissionAppData {
    applicationNumber: string
    status: 'adm_applied' | 'adm_under_review' | 'adm_document_verification' | 'adm_entrance_exam' | 'adm_interview' | 'adm_approved' | 'adm_waitlisted' | 'adm_rejected' | 'adm_enrolled' | 'adm_withdrawn'
    studentName: string
    dateOfBirth: string
    gender: 'male' | 'female'
    email: string
    phone: string
    applyingForClass: string
    previousSchool: string
    previousClass: string
    previousMarks: number
    fatherName: string
    motherName: string
    guardianPhone: string
    guardianEmail: string
    source: 'asrc_website' | 'asrc_referral' | 'asrc_walk_in' | 'asrc_advertisement'
    entranceExamScore?: number
    interviewScore?: number
    waitlistPosition?: number
    admissionFeeStatus?: 'afs_pending' | 'afs_paid'
    admissionFeeAmount?: number
    admissionFeePaid?: number
  }

  const admissionApps: AdmissionAppData[] = [
    {
      applicationNumber: 'APP-2025-0001', status: 'adm_enrolled', studentName: 'Arnav Khanna',
      dateOfBirth: '2019-05-12', gender: 'male', email: 'khanna.family@email.com', phone: '+91 98001 11001',
      applyingForClass: 'Class 1', previousSchool: 'Little Angels Kindergarten', previousClass: 'UKG', previousMarks: 88,
      fatherName: 'Rohit Khanna', motherName: 'Priti Khanna', guardianPhone: '+91 98001 11001', guardianEmail: 'rohit.khanna@email.com',
      source: 'asrc_website', entranceExamScore: 42, interviewScore: 85,
      admissionFeeStatus: 'afs_paid', admissionFeeAmount: 25000, admissionFeePaid: 25000,
    },
    {
      applicationNumber: 'APP-2025-0002', status: 'adm_approved', studentName: 'Myra Reddy',
      dateOfBirth: '2019-08-23', gender: 'female', email: 'reddy.family@email.com', phone: '+91 98001 11002',
      applyingForClass: 'Class 1', previousSchool: 'Sunshine Montessori', previousClass: 'UKG', previousMarks: 92,
      fatherName: 'Venkat Reddy', motherName: 'Lakshmi Reddy', guardianPhone: '+91 98001 11002', guardianEmail: 'venkat.reddy@email.com',
      source: 'asrc_referral', entranceExamScore: 45, interviewScore: 90,
      admissionFeeStatus: 'afs_pending', admissionFeeAmount: 25000, admissionFeePaid: 0,
    },
    {
      applicationNumber: 'APP-2025-0003', status: 'adm_entrance_exam', studentName: 'Ishaan Bose',
      dateOfBirth: '2013-11-07', gender: 'male', email: 'bose.family@email.com', phone: '+91 98001 11003',
      applyingForClass: 'Class 6', previousSchool: 'St. Xavier\'s School', previousClass: 'Class 5', previousMarks: 78,
      fatherName: 'Sourav Bose', motherName: 'Anita Bose', guardianPhone: '+91 98001 11003', guardianEmail: 'sourav.bose@email.com',
      source: 'asrc_walk_in',
    },
    {
      applicationNumber: 'APP-2025-0004', status: 'adm_under_review', studentName: 'Nisha Agarwal',
      dateOfBirth: '2013-03-19', gender: 'female', email: 'agarwal.family@email.com', phone: '+91 98001 11004',
      applyingForClass: 'Class 6', previousSchool: 'Modern School', previousClass: 'Class 5', previousMarks: 82,
      fatherName: 'Manoj Agarwal', motherName: 'Sunita Agarwal', guardianPhone: '+91 98001 11004', guardianEmail: 'manoj.agarwal@email.com',
      source: 'asrc_advertisement',
    },
    {
      applicationNumber: 'APP-2025-0005', status: 'adm_waitlisted', studentName: 'Aryan Jain',
      dateOfBirth: '2009-07-30', gender: 'male', email: 'jain.family@email.com', phone: '+91 98001 11005',
      applyingForClass: 'Class 9', previousSchool: 'Kendriya Vidyalaya', previousClass: 'Class 8', previousMarks: 71,
      fatherName: 'Sanjay Jain', motherName: 'Meena Jain', guardianPhone: '+91 98001 11005', guardianEmail: 'sanjay.jain@email.com',
      source: 'asrc_website', entranceExamScore: 55, waitlistPosition: 3,
      admissionFeeStatus: 'afs_pending', admissionFeeAmount: 25000, admissionFeePaid: 0,
    },
    {
      applicationNumber: 'APP-2025-0006', status: 'adm_rejected', studentName: 'Diya Kapoor',
      dateOfBirth: '2019-01-25', gender: 'female', email: 'kapoor.family@email.com', phone: '+91 98001 11006',
      applyingForClass: 'Class 1', previousSchool: 'Happy Kids Playschool', previousClass: 'UKG', previousMarks: 55,
      fatherName: 'Anil Kapoor', motherName: 'Reena Kapoor', guardianPhone: '+91 98001 11006', guardianEmail: 'anil.kapoor@email.com',
      source: 'asrc_walk_in', entranceExamScore: 15,
    },
    {
      applicationNumber: 'APP-2025-0007', status: 'adm_applied', studentName: 'Vivek Rao',
      dateOfBirth: '2007-09-14', gender: 'male', email: 'rao.family@email.com', phone: '+91 98001 11007',
      applyingForClass: 'Class 11', previousSchool: 'Army Public School', previousClass: 'Class 10', previousMarks: 86,
      fatherName: 'Suresh Rao', motherName: 'Geeta Rao', guardianPhone: '+91 98001 11007', guardianEmail: 'suresh.rao@email.com',
      source: 'asrc_referral',
    },
    {
      applicationNumber: 'APP-2025-0008', status: 'adm_withdrawn', studentName: 'Sanya Pillai',
      dateOfBirth: '2019-06-03', gender: 'female', email: 'pillai.family@email.com', phone: '+91 98001 11008',
      applyingForClass: 'Class 1', previousSchool: 'Tulips Kindergarten', previousClass: 'UKG', previousMarks: 75,
      fatherName: 'Mohan Pillai', motherName: 'Kavita Pillai', guardianPhone: '+91 98001 11008', guardianEmail: 'mohan.pillai@email.com',
      source: 'asrc_website',
    },
  ]

  const createdAppIds: Record<string, string> = {}
  for (const app of admissionApps) {
    const created = await prisma.admissionApplication.create({
      data: {
        applicationNumber: app.applicationNumber,
        status: app.status,
        studentName: app.studentName,
        dateOfBirth: new Date(app.dateOfBirth),
        gender: app.gender,
        email: app.email,
        phone: app.phone,
        applyingForClass: app.applyingForClass,
        previousSchool: app.previousSchool,
        previousClass: app.previousClass,
        previousMarks: app.previousMarks,
        fatherName: app.fatherName,
        motherName: app.motherName,
        guardianPhone: app.guardianPhone,
        guardianEmail: app.guardianEmail,
        source: app.source,
        addressStreet: `${Math.floor(Math.random() * 500) + 1}, Sector ${Math.floor(Math.random() * 50) + 1}`,
        addressCity: 'New Delhi',
        addressState: 'Delhi',
        addressPincode: `1100${String(Math.floor(Math.random() * 90) + 10)}`,
        entranceExamScore: app.entranceExamScore || null,
        interviewScore: app.interviewScore || null,
        waitlistPosition: app.waitlistPosition || null,
        admissionFeeStatus: app.admissionFeeStatus || null,
        admissionFeeAmount: app.admissionFeeAmount || null,
        admissionFeePaid: app.admissionFeePaid || null,
      },
    })
    createdAppIds[app.applicationNumber] = created.id
  }
  console.log(`[Seed] Created ${admissionApps.length} admission applications`)

  // ==================== Admission Documents (16 — 2 per application) ====================

  let admDocCount = 0
  for (const app of admissionApps) {
    const appId = createdAppIds[app.applicationNumber]
    if (!appId) continue

    // Determine doc verification status based on application status
    const isVerified = ['adm_enrolled', 'adm_approved'].includes(app.status)
    const isRejected = app.status === 'adm_rejected'
    const docStatus = isVerified ? 'ads_verified' : isRejected ? 'ads_rejected' : 'ads_pending'

    await prisma.admissionDocument.create({
      data: {
        applicationId: appId,
        type: 'adoc_birth_certificate',
        name: 'Birth Certificate',
        url: `/uploads/admissions/${app.applicationNumber}/birth_certificate.pdf`,
        status: docStatus as 'ads_pending' | 'ads_verified' | 'ads_rejected',
        verifiedBy: isVerified ? 'Admin User' : null,
        verifiedAt: isVerified ? new Date() : null,
        rejectionReason: isRejected ? 'Document quality too poor to verify' : null,
      },
    })
    admDocCount++

    await prisma.admissionDocument.create({
      data: {
        applicationId: appId,
        type: 'adoc_previous_marksheet',
        name: 'Previous Marksheet',
        url: `/uploads/admissions/${app.applicationNumber}/marksheet.pdf`,
        status: docStatus as 'ads_pending' | 'ads_verified' | 'ads_rejected',
        verifiedBy: isVerified ? 'Admin User' : null,
        verifiedAt: isVerified ? new Date() : null,
      },
    })
    admDocCount++
  }
  console.log(`[Seed] Created ${admDocCount} admission documents`)

  // ==================== Admission Status History ====================

  interface StatusTransition {
    appNumber: string
    transitions: { from: string | null; to: string; daysAgo: number; note?: string }[]
  }

  const statusHistories: StatusTransition[] = [
    {
      appNumber: 'APP-2025-0001',
      transitions: [
        { from: null, to: 'adm_applied', daysAgo: 45, note: 'Application submitted online' },
        { from: 'adm_applied', to: 'adm_under_review', daysAgo: 42, note: 'Application assigned for review' },
        { from: 'adm_under_review', to: 'adm_document_verification', daysAgo: 38, note: 'Documents submitted for verification' },
        { from: 'adm_document_verification', to: 'adm_entrance_exam', daysAgo: 30, note: 'Documents verified, exam scheduled' },
        { from: 'adm_entrance_exam', to: 'adm_approved', daysAgo: 20, note: 'Exam score: 42/50, Interview score: 85/100' },
        { from: 'adm_approved', to: 'adm_enrolled', daysAgo: 10, note: 'Fee paid, enrollment completed' },
      ],
    },
    {
      appNumber: 'APP-2025-0002',
      transitions: [
        { from: null, to: 'adm_applied', daysAgo: 40, note: 'Referred by existing parent' },
        { from: 'adm_applied', to: 'adm_under_review', daysAgo: 37 },
        { from: 'adm_under_review', to: 'adm_approved', daysAgo: 25, note: 'Excellent marks and interview performance' },
      ],
    },
    {
      appNumber: 'APP-2025-0003',
      transitions: [
        { from: null, to: 'adm_applied', daysAgo: 20, note: 'Walk-in application' },
        { from: 'adm_applied', to: 'adm_entrance_exam', daysAgo: 15, note: 'Exam scheduled for March 1' },
      ],
    },
    {
      appNumber: 'APP-2025-0004',
      transitions: [
        { from: null, to: 'adm_applied', daysAgo: 12 },
        { from: 'adm_applied', to: 'adm_under_review', daysAgo: 8, note: 'Documents being reviewed' },
      ],
    },
    {
      appNumber: 'APP-2025-0005',
      transitions: [
        { from: null, to: 'adm_applied', daysAgo: 35 },
        { from: 'adm_applied', to: 'adm_under_review', daysAgo: 30 },
        { from: 'adm_under_review', to: 'adm_waitlisted', daysAgo: 18, note: 'Waitlist position: 3. Will be offered if seats available.' },
      ],
    },
    {
      appNumber: 'APP-2025-0006',
      transitions: [
        { from: null, to: 'adm_applied', daysAgo: 50 },
        { from: 'adm_applied', to: 'adm_under_review', daysAgo: 47 },
        { from: 'adm_under_review', to: 'adm_entrance_exam', daysAgo: 35 },
        { from: 'adm_entrance_exam', to: 'adm_rejected', daysAgo: 28, note: 'Exam score 15/50 - below passing marks (20)' },
      ],
    },
    {
      appNumber: 'APP-2025-0007',
      transitions: [
        { from: null, to: 'adm_applied', daysAgo: 3, note: 'Application submitted via referral' },
      ],
    },
    {
      appNumber: 'APP-2025-0008',
      transitions: [
        { from: null, to: 'adm_applied', daysAgo: 30 },
        { from: 'adm_applied', to: 'adm_under_review', daysAgo: 25 },
        { from: 'adm_under_review', to: 'adm_withdrawn', daysAgo: 15, note: 'Parent withdrew - relocating to another city' },
      ],
    },
  ]

  let historyCount = 0
  for (const sh of statusHistories) {
    const appId = createdAppIds[sh.appNumber]
    if (!appId) continue

    for (const t of sh.transitions) {
      const changedAt = new Date()
      changedAt.setDate(changedAt.getDate() - t.daysAgo)

      await prisma.admissionStatusHistory.create({
        data: {
          applicationId: appId,
          fromStatus: t.from as any || null,
          toStatus: t.to as any,
          changedBy: 'Admin User',
          changedAt,
          note: t.note || null,
        },
      })
      historyCount++
    }
  }
  console.log(`[Seed] Created ${historyCount} admission status history entries`)

  // ==================== Admission Notes (8 — 1 per application) ====================

  const admNotes = [
    { appNumber: 'APP-2025-0001', content: 'Strong candidate. Father is in IT sector. Both parents attended the interview. Student shows good communication skills for age group.' },
    { appNumber: 'APP-2025-0002', content: 'Referred by Mr. Sharma (Class 3 parent). Excellent kindergarten report card. Mother is a doctor at AIIMS.' },
    { appNumber: 'APP-2025-0003', content: 'Transfer from ICSE board school. May need bridge course for CBSE curriculum differences. Father works in private sector.' },
    { appNumber: 'APP-2025-0004', content: 'Good academic record from Modern School. Need to verify transfer certificate authenticity. Sports achievements noted.' },
    { appNumber: 'APP-2025-0005', content: 'Decent marks but high competition for Class 9. Father is a school alumni (batch of 2002). Waitlisted - may get seat in July.' },
    { appNumber: 'APP-2025-0006', content: 'Below average entrance exam performance. Parents requested re-exam but policy does not allow. Recommended to apply next year with preparation.' },
    { appNumber: 'APP-2025-0007', content: 'Fresh application for Class 11 Science stream. CBSE Class 10 board result awaited. Father is an Army officer - may have frequent transfers.' },
    { appNumber: 'APP-2025-0008', content: 'Application withdrawn by parent. Family relocating to Bangalore. No refund applicable as no fee was collected.' },
  ]

  for (const note of admNotes) {
    const appId = createdAppIds[note.appNumber]
    if (!appId) continue

    await prisma.admissionNote.create({
      data: {
        applicationId: appId,
        content: note.content,
        createdBy: createdUsers['admin@paperbook.in'] || 'admin',
        createdByName: 'Admin User',
      },
    })
  }
  console.log(`[Seed] Created ${admNotes.length} admission notes`)

  // ==================== Admission Payments (3) ====================

  const admPayments = [
    { appNumber: 'APP-2025-0001', totalAmount: 25000, paidAmount: 25000, status: 'afs_paid' as const, paymentDate: new Date('2025-02-01'), paymentMethod: 'bank_transfer', transactionId: 'TXN-ADM-001', receiptNumber: 'ARCP-2025-001' },
    { appNumber: 'APP-2025-0002', totalAmount: 25000, paidAmount: 0, status: 'afs_pending' as const, paymentDate: null, paymentMethod: null, transactionId: null, receiptNumber: null },
    { appNumber: 'APP-2025-0005', totalAmount: 25000, paidAmount: 0, status: 'afs_pending' as const, paymentDate: null, paymentMethod: null, transactionId: null, receiptNumber: null },
  ]

  for (const pay of admPayments) {
    const appId = createdAppIds[pay.appNumber]
    if (!appId) continue

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 15)

    await prisma.admissionPayment.create({
      data: {
        applicationId: appId,
        totalAmount: pay.totalAmount,
        paidAmount: pay.paidAmount,
        status: pay.status,
        dueDate,
        paymentDate: pay.paymentDate,
        paymentMethod: pay.paymentMethod,
        transactionId: pay.transactionId,
        receiptNumber: pay.receiptNumber,
        feeBreakdown: [
          { item: 'Registration Fee', amount: 5000 },
          { item: 'Admission Fee', amount: 15000 },
          { item: 'Security Deposit', amount: 5000 },
        ],
      },
    })
  }
  console.log(`[Seed] Created ${admPayments.length} admission payments`)

  // ==================== Admission Communications (5) ====================

  const admComms = [
    { appNumber: 'APP-2025-0001', type: 'comm_email' as const, trigger: 'ct_application_received' as const, subject: 'Application Received - APP-2025-0001', message: 'Dear Mr. Rohit Khanna, Thank you for submitting the admission application for Arnav Khanna to Class 1.', daysAgo: 45 },
    { appNumber: 'APP-2025-0001', type: 'comm_email' as const, trigger: 'ct_approved' as const, subject: 'Congratulations! Admission Approved - Arnav Khanna', message: 'Dear Mr. Rohit Khanna, We are pleased to inform you that the admission application for Arnav Khanna to Class 1 has been approved!', daysAgo: 20 },
    { appNumber: 'APP-2025-0003', type: 'comm_email' as const, trigger: 'ct_exam_scheduled' as const, subject: 'Entrance Exam Schedule - Ishaan Bose', message: 'Dear Mr. Sourav Bose, The entrance examination for Ishaan Bose has been scheduled for March 1, 2025 at 10:00 AM in Room 201.', daysAgo: 15 },
    { appNumber: 'APP-2025-0006', type: 'comm_email' as const, trigger: 'ct_rejected' as const, subject: 'Application Update - Diya Kapoor', message: 'Dear Mr. Anil Kapoor, We regret to inform you that the admission application for Diya Kapoor could not be accepted at this time. The entrance exam score was below the required passing marks.', daysAgo: 28 },
    { appNumber: 'APP-2025-0007', type: 'comm_email' as const, trigger: 'ct_application_received' as const, subject: 'Application Received - APP-2025-0007', message: 'Dear Mr. Suresh Rao, Thank you for submitting the admission application for Vivek Rao to Class 11.', daysAgo: 3 },
  ]

  for (const comm of admComms) {
    const appId = createdAppIds[comm.appNumber]
    if (!appId) continue

    const sentAt = new Date()
    sentAt.setDate(sentAt.getDate() - comm.daysAgo)

    const app = admissionApps.find(a => a.applicationNumber === comm.appNumber)!
    await prisma.admissionCommunication.create({
      data: {
        applicationId: appId,
        type: comm.type,
        trigger: comm.trigger,
        recipient: app.guardianEmail,
        subject: comm.subject,
        message: comm.message,
        status: 'cds_delivered',
        sentBy: 'Admin User',
        sentAt,
      },
    })
  }
  console.log(`[Seed] Created ${admComms.length} admission communications`)

  // ==================== Initial Audit Log ====================

  const adminId = createdUsers['admin@paperbook.in']
  if (adminId) {
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        userName: 'Admin User',
        userRole: 'admin',
        action: 'create',
        module: 'settings',
        entityType: 'system',
        entityId: 'seed',
        entityName: 'Database Seed',
        description: 'Database seeded with initial data (Phases 1-7)',
        ipAddress: '127.0.0.1',
      },
    })
  }

  // Seed addons
  const { seedAddons } = await import('../../src/services/addon.service.js')
  await seedAddons()

  // Enable all addons for the school by default
  const school = await prisma.schoolProfile.findFirst()
  if (school) {
    const addons = await prisma.addon.findMany()
    for (const addon of addons) {
      await prisma.schoolAddon.upsert({
        where: { schoolId_addonId: { schoolId: school.id, addonId: addon.id } },
        update: { enabled: true },
        create: { schoolId: school.id, addonId: addon.id, enabled: true, enabledBy: 'seed' },
      })
    }
  }
  console.log('[Seed] Created addons and enabled all for school')

  // Seed RBAC permissions
  const { seedPermissions } = await import('../../src/services/permission.service.js')
  await seedPermissions()
  console.log('[Seed] Created permissions and default role assignments')

  console.log('\n[Seed] Complete!')
  console.log(`  - ${seedUsers.length} users`)
  console.log(`  - 1 school profile`)
  console.log(`  - 3 academic years`)
  console.log(`  - ${classNames.length} classes with sections`)
  console.log(`  - ${subjects.length} subjects with class mappings`)
  console.log(`  - ${calendarEvents.length} calendar events`)
  console.log(`  - ${emailTemplates.length} email templates`)
  console.log(`  - Notification, backup, and theme configs`)
  console.log(`  - ${departmentNames.length} departments, ${designationData.length} designations`)
  console.log(`  - ${seedStudents.length} students (with addresses, parents, health, docs, siblings, skills)`)
  console.log(`  - ${seedStaffData.length} staff (with addresses, qualifications, bank details, PD, reviews, skills, certs)`)
  console.log(`  - ${onboardingTemplates.length} onboarding tasks, 1 checklist, 1 exit interview`)
  console.log(`  - ${periodDefs.length} period definitions, ${roomData.length} rooms`)
  console.log(`  - 2 timetables with ${entryCount} entries`)
  console.log(`  - Student attendance (5 days × 2 sections), period attendance, staff attendance`)
  console.log(`  - Leave balances, 3 leave requests, 2 substitutions`)
  console.log(`  - ${feeTypeData.length} fee types, ${feeStructureData.length} fee structures`)
  console.log(`  - ${createdStudentFeeIds.length} student fees, ${paymentCount} payments`)
  console.log(`  - ${expenseData.length} expenses, ledger entries`)
  console.log(`  - 1 grade scale, 3 exams, ${markCount} student marks, ${reportCardCount} report cards`)
  console.log(`  - ${midTermSubjects.length} exam slots, ${coSchCount} co-scholastic records`)
  console.log(`  - 2 question papers, ${bankQuestions.length} bank questions`)
  console.log(`  - 2 online exams, 3 attempts`)
  console.log(`  - ${admCommTemplates.length} admission templates, 2 entrance exam schedules`)
  console.log(`  - ${admissionApps.length} admission applications with docs, history, notes, payments, communications`)
  console.log(`[Seed] Default password for all accounts: ${DEFAULT_PASSWORD}`)
}

main()
  .catch((e) => {
    console.error('[Seed] Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
