import { faker } from '@faker-js/faker'
import type {
  SchoolProfile,
  AcademicYear,
  ClassSection,
  SystemUser,
  NotificationPreferences,
  BackupConfig,
  ThemeConfig,
  AuditLogEntry,
  CalendarEvent,
  EmailTemplate,
} from '@/features/settings/types/settings.types'
import { staff } from './staff.data'

// School Profile
export const schoolProfile: SchoolProfile = {
  id: faker.string.uuid(),
  name: 'Delhi Public School',
  address: '123 Education Lane, Sector 15',
  city: 'New Delhi',
  state: 'Delhi',
  pincode: '110001',
  phone: '+91 11 2345 6789',
  email: 'info@dpsdelhi.edu.in',
  website: 'https://www.dpsdelhi.edu.in',
  logo: undefined,
  principalName: 'Dr. Rajesh Kumar',
  establishedYear: 1985,
  affiliationNumber: 'CBSE/2024/12345',
  affiliationBoard: 'CBSE',
}

// Academic Years
export const academicYears: AcademicYear[] = [
  {
    id: faker.string.uuid(),
    name: '2024-25',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    isCurrent: true,
    status: 'active',
  },
  {
    id: faker.string.uuid(),
    name: '2023-24',
    startDate: '2023-04-01',
    endDate: '2024-03-31',
    isCurrent: false,
    status: 'completed',
  },
  {
    id: faker.string.uuid(),
    name: '2025-26',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    isCurrent: false,
    status: 'upcoming',
  },
]

// Classes and Sections
export const classSections: ClassSection[] = [
  { id: faker.string.uuid(), className: 'Class 1', sections: ['A', 'B', 'C'], classTeacherId: staff[0]?.id, classTeacherName: staff[0]?.name },
  { id: faker.string.uuid(), className: 'Class 2', sections: ['A', 'B', 'C'], classTeacherId: staff[1]?.id, classTeacherName: staff[1]?.name },
  { id: faker.string.uuid(), className: 'Class 3', sections: ['A', 'B', 'C', 'D'], classTeacherId: staff[2]?.id, classTeacherName: staff[2]?.name },
  { id: faker.string.uuid(), className: 'Class 4', sections: ['A', 'B', 'C'], classTeacherId: staff[3]?.id, classTeacherName: staff[3]?.name },
  { id: faker.string.uuid(), className: 'Class 5', sections: ['A', 'B', 'C'], classTeacherId: staff[4]?.id, classTeacherName: staff[4]?.name },
  { id: faker.string.uuid(), className: 'Class 6', sections: ['A', 'B', 'C', 'D'], classTeacherId: staff[5]?.id, classTeacherName: staff[5]?.name },
  { id: faker.string.uuid(), className: 'Class 7', sections: ['A', 'B', 'C'], classTeacherId: staff[6]?.id, classTeacherName: staff[6]?.name },
  { id: faker.string.uuid(), className: 'Class 8', sections: ['A', 'B', 'C'], classTeacherId: staff[7]?.id, classTeacherName: staff[7]?.name },
  { id: faker.string.uuid(), className: 'Class 9', sections: ['A', 'B', 'C', 'D'], classTeacherId: staff[8]?.id, classTeacherName: staff[8]?.name },
  { id: faker.string.uuid(), className: 'Class 10', sections: ['A', 'B', 'C'], classTeacherId: staff[9]?.id, classTeacherName: staff[9]?.name },
  { id: faker.string.uuid(), className: 'Class 11', sections: ['A', 'B'], classTeacherId: staff[10]?.id, classTeacherName: staff[10]?.name },
  { id: faker.string.uuid(), className: 'Class 12', sections: ['A', 'B'], classTeacherId: staff[11]?.id, classTeacherName: staff[11]?.name },
]

// System Users
export const systemUsers: SystemUser[] = [
  {
    id: faker.string.uuid(),
    email: 'admin@school.edu.in',
    name: 'System Administrator',
    role: 'admin',
    isActive: true,
    lastLogin: faker.date.recent({ days: 1 }).toISOString(),
    createdAt: faker.date.past({ years: 2 }).toISOString(),
  },
  {
    id: faker.string.uuid(),
    email: 'principal@school.edu.in',
    name: 'Dr. Rajesh Kumar',
    role: 'principal',
    isActive: true,
    lastLogin: faker.date.recent({ days: 2 }).toISOString(),
    createdAt: faker.date.past({ years: 2 }).toISOString(),
  },
  {
    id: faker.string.uuid(),
    email: 'accounts@school.edu.in',
    name: 'Priya Sharma',
    role: 'accountant',
    isActive: true,
    lastLogin: faker.date.recent({ days: 1 }).toISOString(),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  },
  {
    id: faker.string.uuid(),
    email: 'library@school.edu.in',
    name: 'Amit Verma',
    role: 'librarian',
    isActive: true,
    lastLogin: faker.date.recent({ days: 3 }).toISOString(),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  },
  {
    id: faker.string.uuid(),
    email: 'reception@school.edu.in',
    name: 'Sunita Devi',
    role: 'receptionist',
    isActive: true,
    lastLogin: faker.date.recent({ days: 1 }).toISOString(),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
  },
  {
    id: faker.string.uuid(),
    email: 'teacher1@school.edu.in',
    name: 'Rahul Gupta',
    role: 'teacher',
    isActive: false,
    lastLogin: faker.date.past({ years: 0.5 }).toISOString(),
    createdAt: faker.date.past({ years: 2 }).toISOString(),
  },
]

// Notification Preferences
export const notificationPreferences: NotificationPreferences = {
  emailNotifications: true,
  smsNotifications: true,
  feeReminders: true,
  attendanceAlerts: true,
  examResults: true,
  generalAnnouncements: true,
}

// Backup Configuration
export const backupConfig: BackupConfig = {
  autoBackup: true,
  backupFrequency: 'daily',
  lastBackupAt: faker.date.recent({ days: 1 }).toISOString(),
  backupRetentionDays: 30,
}

// Theme Configuration
export const themeConfig: ThemeConfig = {
  mode: 'system',
  primaryColor: '#6d28d9',
  accentColor: '#7c3aed',
}

// ==================== AUDIT LOG ====================

const auditActions: Array<{ action: AuditLogEntry['action']; module: AuditLogEntry['module']; entityType: string; description: string }> = [
  { action: 'update', module: 'students', entityType: 'Student', description: 'Updated student profile - address changed' },
  { action: 'create', module: 'finance', entityType: 'FeePayment', description: 'Recorded fee payment of ₹15,000' },
  { action: 'login', module: 'auth', entityType: 'Session', description: 'User logged in from Chrome/Windows' },
  { action: 'update', module: 'settings', entityType: 'SchoolProfile', description: 'Updated school phone number' },
  { action: 'delete', module: 'library', entityType: 'Book', description: 'Deleted book "Old Mathematics Guide"' },
  { action: 'create', module: 'admissions', entityType: 'Application', description: 'Created new application for Class 5' },
  { action: 'status_change', module: 'staff', entityType: 'LeaveRequest', description: 'Approved leave request for 3 days' },
  { action: 'export', module: 'finance', entityType: 'Report', description: 'Exported fee collection report for November 2024' },
  { action: 'update', module: 'attendance', entityType: 'AttendanceRecord', description: 'Marked attendance for Class 10-A (32 students)' },
  { action: 'create', module: 'exams', entityType: 'Exam', description: 'Created Unit Test 3 for Class 9' },
  { action: 'update', module: 'finance', entityType: 'FeeStructure', description: 'Updated tuition fee for Class 11 from ₹45,000 to ₹48,000' },
  { action: 'delete', module: 'students', entityType: 'Document', description: 'Deleted outdated transfer certificate' },
  { action: 'login', module: 'auth', entityType: 'Session', description: 'User logged in from Safari/macOS' },
  { action: 'create', module: 'transport', entityType: 'Route', description: 'Added new transport route - Route F North Extension' },
  { action: 'status_change', module: 'admissions', entityType: 'Application', description: 'Changed application status from "Under Review" to "Approved"' },
  { action: 'import', module: 'students', entityType: 'BulkImport', description: 'Imported 45 student records from CSV' },
  { action: 'update', module: 'settings', entityType: 'BackupConfig', description: 'Changed backup frequency from daily to weekly' },
  { action: 'create', module: 'library', entityType: 'Book', description: 'Added 20 copies of "NCERT Science Class 10"' },
  { action: 'logout', module: 'auth', entityType: 'Session', description: 'User logged out' },
  { action: 'update', module: 'exams', entityType: 'Marks', description: 'Entered marks for Class 10-B Math Unit Test' },
]

const auditUsers = [
  { id: 'u1', name: 'System Administrator', role: 'admin' },
  { id: 'u2', name: 'Dr. Rajesh Kumar', role: 'principal' },
  { id: 'u3', name: 'Priya Sharma', role: 'accountant' },
  { id: 'u4', name: 'Amit Verma', role: 'librarian' },
  { id: 'u5', name: 'Sunita Devi', role: 'receptionist' },
  { id: 'u6', name: 'Rahul Gupta', role: 'teacher' },
]

export const auditLogs: AuditLogEntry[] = auditActions.map((entry, i) => {
  const user = auditUsers[i % auditUsers.length]
  return {
    id: `audit-${i + 1}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: entry.action,
    module: entry.module,
    entityType: entry.entityType,
    entityId: `entity-${faker.string.alphanumeric(6)}`,
    entityName: entry.entityType,
    description: entry.description,
    changes: entry.action === 'update' ? [
      { field: 'value', oldValue: 'Previous', newValue: 'Updated' },
    ] : undefined,
    ipAddress: `192.168.1.${10 + i}`,
    timestamp: faker.date.recent({ days: Math.max(1, 30 - i) }).toISOString(),
  }
})

// ==================== ACADEMIC CALENDAR ====================

export const calendarEvents: CalendarEvent[] = [
  { id: 'ce1', title: 'Republic Day', description: 'National holiday - school closed', type: 'holiday', startDate: '2025-01-26', endDate: '2025-01-26', isRecurring: true, appliesToClasses: [], createdAt: '2024-04-01T00:00:00Z' },
  { id: 'ce2', title: 'Annual Sports Day', description: 'Inter-house sports competition at school ground', type: 'sports', startDate: '2025-02-15', endDate: '2025-02-15', isRecurring: false, appliesToClasses: [], createdAt: '2024-04-01T00:00:00Z' },
  { id: 'ce3', title: 'Unit Test 3', description: 'Third unit test for all classes', type: 'exam', startDate: '2025-02-20', endDate: '2025-02-28', isRecurring: false, appliesToClasses: [], createdAt: '2024-04-01T00:00:00Z' },
  { id: 'ce4', title: 'Holi Holiday', description: 'Holi festival - school closed', type: 'holiday', startDate: '2025-03-14', endDate: '2025-03-14', isRecurring: true, appliesToClasses: [], createdAt: '2024-04-01T00:00:00Z' },
  { id: 'ce5', title: 'PTM - Junior Classes', description: 'Parent-teacher meeting for Classes 1-5', type: 'ptm', startDate: '2025-03-08', endDate: '2025-03-08', isRecurring: false, appliesToClasses: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'], createdAt: '2024-04-01T00:00:00Z' },
  { id: 'ce6', title: 'Annual Day', description: 'Annual cultural program and prize distribution', type: 'cultural', startDate: '2025-03-22', endDate: '2025-03-22', isRecurring: false, appliesToClasses: [], createdAt: '2024-04-01T00:00:00Z' },
  { id: 'ce7', title: 'Final Exams', description: 'Annual final examination', type: 'exam', startDate: '2025-03-01', endDate: '2025-03-15', isRecurring: false, appliesToClasses: ['Class 9', 'Class 10', 'Class 11', 'Class 12'], createdAt: '2024-04-01T00:00:00Z' },
  { id: 'ce8', title: 'Summer Vacation', description: 'Summer break', type: 'vacation', startDate: '2025-05-01', endDate: '2025-06-15', isRecurring: true, appliesToClasses: [], createdAt: '2024-04-01T00:00:00Z' },
  { id: 'ce9', title: 'Teacher Training Workshop', description: 'NEP 2020 implementation workshop', type: 'workshop', startDate: '2025-04-05', endDate: '2025-04-06', isRecurring: false, appliesToClasses: [], createdAt: '2024-04-01T00:00:00Z' },
  { id: 'ce10', title: 'Independence Day', description: 'National holiday - flag hoisting ceremony', type: 'holiday', startDate: '2025-08-15', endDate: '2025-08-15', isRecurring: true, appliesToClasses: [], createdAt: '2024-04-01T00:00:00Z' },
  { id: 'ce11', title: 'PTM - Senior Classes', description: 'Parent-teacher meeting for Classes 6-12', type: 'ptm', startDate: '2025-03-15', endDate: '2025-03-15', isRecurring: false, appliesToClasses: ['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'], createdAt: '2024-04-01T00:00:00Z' },
  { id: 'ce12', title: 'Dussehra Break', description: 'Dussehra holiday', type: 'holiday', startDate: '2025-10-02', endDate: '2025-10-03', isRecurring: true, appliesToClasses: [], createdAt: '2024-04-01T00:00:00Z' },
  { id: 'ce13', title: 'Diwali Vacation', description: 'Diwali holiday break', type: 'vacation', startDate: '2025-10-20', endDate: '2025-10-27', isRecurring: true, appliesToClasses: [], createdAt: '2024-04-01T00:00:00Z' },
  { id: 'ce14', title: 'Half-Yearly Exams', description: 'Mid-term examination', type: 'exam', startDate: '2025-09-15', endDate: '2025-09-30', isRecurring: false, appliesToClasses: [], createdAt: '2024-04-01T00:00:00Z' },
  { id: 'ce15', title: 'Christmas Break', description: 'Winter holiday', type: 'vacation', startDate: '2025-12-24', endDate: '2026-01-01', isRecurring: true, appliesToClasses: [], createdAt: '2024-04-01T00:00:00Z' },
]

// ==================== EMAIL TEMPLATES ====================

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'et1',
    name: 'Fee Reminder',
    subject: 'Fee Payment Reminder - {{school_name}}',
    body: `Dear {{parent_name}},

This is a reminder that the fee payment for {{student_name}} ({{class}} {{section}}) is pending.

Amount Due: ₹{{amount_due}}
Due Date: {{due_date}}
Fee Type: {{fee_type}}

Please make the payment at the earliest to avoid late fee charges.

Regards,
{{school_name}}
Accounts Department`,
    category: 'fee',
    variables: ['parent_name', 'student_name', 'class', 'section', 'amount_due', 'due_date', 'fee_type', 'school_name'],
    isActive: true,
    lastModified: '2024-12-01T00:00:00Z',
    createdAt: '2024-04-01T00:00:00Z',
  },
  {
    id: 'et2',
    name: 'Fee Receipt Confirmation',
    subject: 'Payment Received - Receipt #{{receipt_number}}',
    body: `Dear {{parent_name}},

We have received your fee payment for {{student_name}}.

Receipt Number: {{receipt_number}}
Amount Paid: ₹{{amount_paid}}
Payment Date: {{payment_date}}
Payment Mode: {{payment_mode}}

Thank you for the timely payment.

Regards,
{{school_name}}`,
    category: 'fee',
    variables: ['parent_name', 'student_name', 'receipt_number', 'amount_paid', 'payment_date', 'payment_mode', 'school_name'],
    isActive: true,
    lastModified: '2024-11-15T00:00:00Z',
    createdAt: '2024-04-01T00:00:00Z',
  },
  {
    id: 'et3',
    name: 'Daily Absence Alert',
    subject: 'Absence Notification - {{student_name}} - {{date}}',
    body: `Dear {{parent_name}},

This is to inform you that {{student_name}} ({{class}} {{section}}, Roll No. {{roll_number}}) was marked absent on {{date}}.

If this is unexpected, please contact the school office immediately.

Regards,
{{school_name}}`,
    category: 'attendance',
    variables: ['parent_name', 'student_name', 'class', 'section', 'roll_number', 'date', 'school_name'],
    isActive: true,
    lastModified: '2024-10-20T00:00:00Z',
    createdAt: '2024-04-01T00:00:00Z',
  },
  {
    id: 'et4',
    name: 'Exam Result Published',
    subject: '{{exam_name}} Results Published - {{student_name}}',
    body: `Dear {{parent_name}},

The results for {{exam_name}} have been published.

Student: {{student_name}} ({{class}} {{section}})
Total Marks: {{total_marks}} / {{max_marks}}
Percentage: {{percentage}}%
Grade: {{grade}}
Rank: {{rank}}

You can view the detailed report card on the parent portal.

Regards,
{{school_name}}`,
    category: 'exam',
    variables: ['parent_name', 'student_name', 'class', 'section', 'exam_name', 'total_marks', 'max_marks', 'percentage', 'grade', 'rank', 'school_name'],
    isActive: true,
    lastModified: '2024-11-30T00:00:00Z',
    createdAt: '2024-04-01T00:00:00Z',
  },
  {
    id: 'et5',
    name: 'Admission Application Received',
    subject: 'Application Received - {{application_id}}',
    body: `Dear {{parent_name}},

We have received your application for admission to {{class}} at {{school_name}}.

Application ID: {{application_id}}
Student Name: {{student_name}}
Applied For: {{class}}
Status: Under Review

We will notify you once your application has been reviewed.

Regards,
{{school_name}}
Admissions Office`,
    category: 'admission',
    variables: ['parent_name', 'student_name', 'class', 'application_id', 'school_name'],
    isActive: true,
    lastModified: '2024-09-15T00:00:00Z',
    createdAt: '2024-04-01T00:00:00Z',
  },
  {
    id: 'et6',
    name: 'General Announcement',
    subject: '{{announcement_title}} - {{school_name}}',
    body: `Dear Parents,

{{announcement_body}}

For any queries, please contact the school office.

Regards,
{{school_name}}`,
    category: 'general',
    variables: ['announcement_title', 'announcement_body', 'school_name'],
    isActive: true,
    lastModified: '2024-12-10T00:00:00Z',
    createdAt: '2024-04-01T00:00:00Z',
  },
  {
    id: 'et7',
    name: 'Bus Delay Notification',
    subject: 'Bus Delay Alert - {{route_name}}',
    body: `Dear {{parent_name}},

The school bus on {{route_name}} is running approximately {{delay_minutes}} minutes late today due to {{reason}}.

Revised pickup time at {{stop_name}}: {{revised_time}}

We apologize for the inconvenience.

Regards,
{{school_name}}
Transport Department`,
    category: 'transport',
    variables: ['parent_name', 'route_name', 'delay_minutes', 'reason', 'stop_name', 'revised_time', 'school_name'],
    isActive: false,
    lastModified: '2024-08-20T00:00:00Z',
    createdAt: '2024-08-01T00:00:00Z',
  },
]
