import {
  BookOpen,
  Search,
  BookMarked,
  Clock,
  Laptop,
  AlertCircle,
  ScanLine,
  History,
  ClipboardCheck,
  List,
  Calendar,
  PenTool,
  BarChart,
  TrendingUp,
  FileText,
  FileQuestion,
  Award,
  GraduationCap,
  Video,
  Users,
  Notebook,
  HelpCircle,
  Eye,
  ClipboardList,
  FileBarChart,
  ShieldCheck,
  Bus,
  Building2,
  Package,
  LayoutDashboard,
  UserPlus,
  UsersRound,
  CalendarClock,
  IndianRupee,
  MessageCircle,
  BarChart3,
  Globe,
  Settings,
  UserCheck,
  Inbox,
  GitBranch,
  Mail,
  CreditCard,
  PieChart,
  Wallet,
  Receipt,
  Landmark,
  FileSpreadsheet,
  MessageSquareWarning,
  Siren,
  Gavel,
  Layout,
  Paintbrush,
  MessagesSquare,
  CalendarDays,
  LineChart,
  Lock,
  Puzzle,
  Plug,
  Wrench,
  Heart,
  ArrowUpCircle,
  IdCard,
  RefreshCw,
  MapPin,
  Navigation,
  Bell,
  BedDouble,
  Utensils,
  Boxes,
  FileArchive,
  Users2,
  Trophy,
  Star,
  Monitor,
  Shield,
  Blocks,
  MessageSquare,
  Fingerprint,
  AlertTriangle,
  Target,
  Play,
  Calculator,
  Route as RouteIcon,
  PenSquare,
  type LucideIcon,
} from 'lucide-react'
import type { Role } from '@/types/common.types'

/* ============================================
   Type System — Discriminated Union for Nav Items
   ============================================ */

export interface ModuleNavLeafItem {
  type: 'item'
  name: string
  href: string
  icon?: LucideIcon
  roles?: Role[]
}

export interface ModuleNavGroup {
  type: 'group'
  name: string
  icon: LucideIcon
  roles?: Role[]
  defaultHref: string
  children: ModuleNavLeafItem[]
}

export type ModuleNavEntry = ModuleNavLeafItem | ModuleNavGroup

/** @deprecated — use ModuleNavLeafItem instead */
export interface ModuleNavItem {
  name: string
  href: string
  icon: LucideIcon
  roles?: Role[]
}

export interface ModuleNavConfig {
  slug: string
  name: string
  icon: LucideIcon
  basePath: string
  items: ModuleNavEntry[]
}

/* ============================================
   Home nav: shown at / (dashboard) route
   ============================================ */

export const HOME_NAV: ModuleNavConfig = {
  slug: 'home',
  name: 'PaperBook',
  icon: LayoutDashboard,
  basePath: '/',
  items: [
    { type: 'item', name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { type: 'item', name: 'People', href: '/people', icon: UsersRound, roles: ['admin', 'principal', 'teacher'] },
    { type: 'item', name: 'Admissions', href: '/admissions', icon: UserPlus, roles: ['admin', 'principal'] },
    { type: 'item', name: 'Finance', href: '/finance', icon: IndianRupee, roles: ['admin', 'principal', 'accountant'] },
    { type: 'item', name: 'Fees', href: '/finance/my-fees', icon: IndianRupee, roles: ['parent', 'student'] },
    { type: 'item', name: 'Exams', href: '/exams', icon: ClipboardCheck, roles: ['admin', 'principal', 'teacher', 'student'] },
    { type: 'item', name: 'LMS', href: '/lms', icon: GraduationCap, roles: ['admin', 'principal', 'teacher', 'student'] },
    { type: 'item', name: 'Library', href: '/library', icon: BookOpen, roles: ['admin', 'principal', 'teacher', 'librarian', 'student'] },
    { type: 'item', name: 'Transport', href: '/transport/tracking', icon: Bus, roles: ['transport_manager', 'parent', 'student'] },
    { type: 'item', name: 'Operations', href: '/operations', icon: Wrench, roles: ['admin', 'principal', 'transport_manager'] },
    { type: 'item', name: 'Management', href: '/management', icon: Building2, roles: ['admin', 'principal'] },
    { type: 'item', name: 'Timetable', href: '/calendar', icon: CalendarClock, roles: ['admin', 'principal', 'teacher', 'student'] },
    { type: 'item', name: 'Visitors', href: '/visitors', icon: Eye, roles: ['admin', 'principal'] },
    { type: 'item', name: 'Behavior', href: '/behavior', icon: MessageSquareWarning, roles: ['admin', 'principal', 'teacher'] },
    { type: 'item', name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'principal', 'accountant'] },
    { type: 'item', name: 'My Portal', href: '/my-portal', icon: MessageCircle, roles: ['student'] },
    { type: 'item', name: 'Parent Portal', href: '/parent-portal', icon: MessageCircle, roles: ['parent', 'teacher'] },
    { type: 'item', name: 'Attendance', href: '/attendance/leave', icon: CalendarDays, roles: ['student', 'parent'] },
    { type: 'item', name: 'Website', href: '/school-website', icon: Globe, roles: ['admin', 'principal'] },
    { type: 'item', name: 'Settings', href: '/settings', icon: Settings, roles: ['admin', 'principal', 'teacher'] },
  ],
}

/* ============================================
   Module configs: one per route segment
   ============================================ */

export const MODULE_NAV: Record<string, ModuleNavConfig> = {
  /* ─── PEOPLE (grouped) ─── */
  people: {
    slug: 'people',
    name: 'People',
    icon: UsersRound,
    basePath: '/people',
    items: [
      {
        type: 'group',
        name: 'Students',
        icon: GraduationCap,
        defaultHref: '/people',
        children: [
          { type: 'item', name: 'Dashboard', href: '/people', icon: LayoutDashboard },
          { type: 'item', name: 'All Students', href: '/people?tab=students&subtab=list', icon: Users },
          { type: 'item', name: 'Documents', href: '/people?tab=students&subtab=documents', icon: FileText },
          { type: 'item', name: 'Health Records', href: '/people?tab=students&subtab=health', icon: Heart },
          { type: 'item', name: 'Promotions', href: '/people?tab=students&subtab=promotions', icon: ArrowUpCircle },
          { type: 'item', name: 'ID Cards', href: '/people?tab=students&subtab=idcards', icon: IdCard },
        ],
      },
      {
        type: 'group',
        name: 'Staff',
        icon: UserCheck,
        roles: ['admin', 'principal'],
        defaultHref: '/people?tab=staff',
        children: [
          { type: 'item', name: 'All Staff', href: '/people?tab=staff&subtab=list', icon: Users },
          { type: 'item', name: 'Attendance', href: '/people?tab=staff&subtab=attendance', icon: ClipboardCheck },
          { type: 'item', name: 'Leave', href: '/people?tab=staff&subtab=leave', icon: CalendarDays },
          { type: 'item', name: 'Payroll', href: '/people?tab=staff&subtab=payroll', icon: IndianRupee },
          { type: 'item', name: 'Timetable', href: '/people?tab=staff&subtab=timetable', icon: Clock },
          { type: 'item', name: 'Substitutions', href: '/people?tab=staff&subtab=substitutions', icon: RefreshCw },
        ],
      },
      {
        type: 'group',
        name: 'Attendance',
        icon: ClipboardCheck,
        defaultHref: '/people?tab=attendance',
        children: [
          { type: 'item', name: 'Mark', href: '/people?tab=attendance&subtab=mark', icon: ClipboardCheck },
          { type: 'item', name: 'Period', href: '/people?tab=attendance&subtab=period', icon: Calendar },
          { type: 'item', name: 'Reports', href: '/people?tab=attendance&subtab=reports', icon: BarChart3 },
          { type: 'item', name: 'Leave', href: '/people?tab=attendance&subtab=leave', icon: CalendarDays },
          { type: 'item', name: 'Alerts', href: '/people?tab=attendance&subtab=alerts', icon: AlertTriangle },
          { type: 'item', name: 'Late', href: '/people?tab=attendance&subtab=late', icon: Clock },
          { type: 'item', name: 'Notifications', href: '/people?tab=attendance&subtab=notifications', icon: Bell },
          { type: 'item', name: 'Biometric', href: '/people?tab=attendance&subtab=biometric', icon: Fingerprint },
        ],
      },
      {
        type: 'group',
        name: 'Behavior',
        icon: MessageSquareWarning,
        roles: ['admin', 'principal', 'teacher'],
        defaultHref: '/people?tab=behavior',
        children: [
          { type: 'item', name: 'Dashboard', href: '/people?tab=behavior&subtab=dashboard', icon: LayoutDashboard },
          { type: 'item', name: 'Incidents', href: '/people?tab=behavior&subtab=incidents', icon: Siren },
          { type: 'item', name: 'Detentions', href: '/people?tab=behavior&subtab=detentions', icon: Gavel },
        ],
      },
    ],
  },

  /* ─── ADMISSIONS (flat) ─── */
  admissions: {
    slug: 'admissions',
    name: 'Admissions',
    icon: UserPlus,
    basePath: '/admissions',
    items: [
      { type: 'item', name: 'Applications', href: '/admissions', icon: Inbox },
      { type: 'item', name: 'Pipeline', href: '/admissions?tab=pipeline', icon: GitBranch },
      { type: 'item', name: 'Entrance Exams', href: '/admissions?tab=entrance-exams', icon: ClipboardCheck },
      { type: 'item', name: 'Waitlist', href: '/admissions?tab=waitlist', icon: List },
      { type: 'item', name: 'Communications', href: '/admissions?tab=communications', icon: Mail },
      { type: 'item', name: 'Payments', href: '/admissions?tab=payments', icon: CreditCard },
      { type: 'item', name: 'Analytics', href: '/admissions?tab=analytics', icon: PieChart },
    ],
  },

  /* ─── FINANCE (flat) ─── */
  finance: {
    slug: 'finance',
    name: 'Finance',
    icon: IndianRupee,
    basePath: '/finance',
    items: [
      { type: 'item', name: 'Collection', href: '/finance', icon: Wallet },
      { type: 'item', name: 'Outstanding', href: '/finance?tab=outstanding', icon: Receipt },
      { type: 'item', name: 'Fee Setup', href: '/finance?tab=fee-management', icon: Settings },
      { type: 'item', name: 'Expenses', href: '/finance?tab=expenses', icon: CreditCard },
      { type: 'item', name: 'Ledger', href: '/finance?tab=ledger', icon: Landmark },
      { type: 'item', name: 'Reports', href: '/finance?tab=reports', icon: FileSpreadsheet },
    ],
  },

  /* ─── EXAMS (flat — merged route + tab items) ─── */
  exams: {
    slug: 'exams',
    name: 'Exams',
    icon: ClipboardCheck,
    basePath: '/exams',
    items: [
      { type: 'item', name: 'All Exams', href: '/exams', icon: List },
      { type: 'item', name: 'Online Exams', href: '/exams?tab=online', icon: Monitor },
      { type: 'item', name: 'Marks Entry', href: '/exams?tab=marks', icon: PenTool, roles: ['admin', 'principal', 'teacher'] },
      { type: 'item', name: 'Report Cards', href: '/exams?tab=reports', icon: FileText },
      { type: 'item', name: 'Grades', href: '/exams?tab=grades', icon: Award },
      { type: 'item', name: 'Timetable', href: '/exams/timetable', icon: Calendar },
      { type: 'item', name: 'Analytics', href: '/exams/analytics', icon: BarChart },
      { type: 'item', name: 'Progress', href: '/exams/progress', icon: TrendingUp },
      { type: 'item', name: 'Co-Scholastic', href: '/exams/co-scholastic', icon: Award },
      { type: 'item', name: 'Question Papers', href: '/exams/question-papers', icon: FileQuestion },
    ],
  },

  /* ─── LMS (flat) ─── */
  lms: {
    slug: 'lms',
    name: 'LMS',
    icon: GraduationCap,
    basePath: '/lms',
    items: [
      { type: 'item', name: 'Dashboard', href: '/lms', icon: LayoutDashboard },
      { type: 'item', name: 'Courses', href: '/lms?tab=courses', icon: BookOpen },
      { type: 'item', name: 'Live Classes', href: '/lms?tab=live-classes', icon: Video },
      { type: 'item', name: 'Enrollments', href: '/lms?tab=enrollments', icon: Users },
      { type: 'item', name: 'Assignments', href: '/lms?tab=assignments', icon: Target },
      { type: 'item', name: 'Question Bank', href: '/lms?tab=question-bank', icon: HelpCircle },
    ],
  },

  /* ─── LIBRARY (flat) ─── */
  library: {
    slug: 'library',
    name: 'Library',
    icon: BookOpen,
    basePath: '/library',
    items: [
      { type: 'item', name: 'Catalog', href: '/library?tab=catalog', icon: Search },
      { type: 'item', name: 'Issued Books', href: '/library?tab=issued', icon: BookMarked },
      { type: 'item', name: 'Reservations', href: '/library?tab=reservations', icon: Clock },
      { type: 'item', name: 'Digital Library', href: '/library?tab=digital', icon: Laptop },
      { type: 'item', name: 'Fines', href: '/library?tab=fines', icon: AlertCircle },
      { type: 'item', name: 'Scanner', href: '/library?tab=scanner', icon: ScanLine, roles: ['admin', 'principal', 'librarian'] },
      { type: 'item', name: 'History', href: '/library?tab=history', icon: History },
    ],
  },

  /* ─── CALENDAR (flat) ─── */
  calendar: {
    slug: 'calendar',
    name: 'Timetable',
    icon: CalendarClock,
    basePath: '/calendar',
    items: [
      { type: 'item', name: 'Week View', href: '/calendar', icon: CalendarDays },
      { type: 'item', name: 'Day View', href: '/calendar?view=day', icon: Calendar },
      { type: 'item', name: 'Month View', href: '/calendar?view=month', icon: CalendarClock },
    ],
  },

  /* ─── OPERATIONS (grouped) ─── */
  operations: {
    slug: 'operations',
    name: 'Operations',
    icon: Wrench,
    basePath: '/operations',
    items: [
      {
        type: 'group',
        name: 'Transport',
        icon: Bus,
        roles: ['admin', 'principal', 'transport_manager'],
        defaultHref: '/operations?tab=transport',
        children: [
          { type: 'item', name: 'Routes', href: '/operations?tab=transport&subtab=routes', icon: RouteIcon },
          { type: 'item', name: 'Vehicles', href: '/operations?tab=transport&subtab=vehicles', icon: Bus },
          { type: 'item', name: 'Drivers', href: '/operations?tab=transport&subtab=drivers', icon: Users },
          { type: 'item', name: 'Tracking', href: '/operations?tab=transport&subtab=tracking', icon: Navigation },
          { type: 'item', name: 'Stops', href: '/operations?tab=transport&subtab=stops', icon: MapPin },
          { type: 'item', name: 'Maintenance', href: '/operations?tab=transport&subtab=maintenance', icon: Wrench },
          { type: 'item', name: 'Notifications', href: '/operations?tab=transport&subtab=notifications', icon: Bell },
        ],
      },
      {
        type: 'group',
        name: 'Hostel',
        icon: Building2,
        roles: ['admin', 'principal'],
        defaultHref: '/operations?tab=hostel',
        children: [
          { type: 'item', name: 'Dashboard', href: '/operations?tab=hostel&subtab=dashboard', icon: LayoutDashboard },
          { type: 'item', name: 'Rooms', href: '/operations?tab=hostel&subtab=rooms', icon: BedDouble },
          { type: 'item', name: 'Allocations', href: '/operations?tab=hostel&subtab=allocations', icon: Users },
          { type: 'item', name: 'Fees', href: '/operations?tab=hostel&subtab=fees', icon: IndianRupee },
          { type: 'item', name: 'Mess', href: '/operations?tab=hostel&subtab=mess', icon: Utensils },
          { type: 'item', name: 'Attendance', href: '/operations?tab=hostel&subtab=attendance', icon: UserCheck },
        ],
      },
      {
        type: 'group',
        name: 'Assets',
        icon: Package,
        roles: ['admin', 'principal', 'accountant'],
        defaultHref: '/operations?tab=assets',
        children: [
          { type: 'item', name: 'Dashboard', href: '/operations?tab=assets&subtab=dashboard', icon: LayoutDashboard },
          { type: 'item', name: 'Assets', href: '/operations?tab=assets&subtab=assets', icon: Package },
          { type: 'item', name: 'Stock', href: '/operations?tab=assets&subtab=stock', icon: Boxes },
          { type: 'item', name: 'Purchase Orders', href: '/operations?tab=assets&subtab=purchase-orders', icon: ClipboardList },
          { type: 'item', name: 'Vendors', href: '/operations?tab=assets&subtab=vendors', icon: Users },
        ],
      },
    ],
  },

  /* ─── MANAGEMENT (grouped) ─── */
  management: {
    slug: 'management',
    name: 'Management',
    icon: Building2,
    basePath: '/management',
    items: [
      {
        type: 'group',
        name: 'Schedule',
        icon: Calendar,
        roles: ['admin', 'principal', 'teacher', 'accountant'],
        defaultHref: '/management?tab=schedule',
        children: [
          { type: 'item', name: 'Class Timetables', href: '/management?tab=schedule&subtab=timetables', icon: Calendar },
          { type: 'item', name: 'Teacher View', href: '/management?tab=schedule&subtab=teachers', icon: Users },
          { type: 'item', name: 'Room View', href: '/management?tab=schedule&subtab=rooms', icon: Building2 },
          { type: 'item', name: 'Substitutions', href: '/management?tab=schedule&subtab=substitutions', icon: RefreshCw },
        ],
      },
      {
        type: 'group',
        name: 'Documents',
        icon: FileArchive,
        roles: ['admin', 'principal', 'teacher', 'accountant'],
        defaultHref: '/management?tab=docs',
        children: [
          { type: 'item', name: 'Browse', href: '/management?tab=docs&subtab=browse', icon: FileArchive },
          { type: 'item', name: 'Starred', href: '/management?tab=docs&subtab=starred', icon: Star },
          { type: 'item', name: 'Recent Activity', href: '/management?tab=docs&subtab=recent', icon: Clock },
        ],
      },
      {
        type: 'group',
        name: 'Alumni',
        icon: Users2,
        roles: ['admin', 'principal'],
        defaultHref: '/management?tab=alumni',
        children: [
          { type: 'item', name: 'Directory', href: '/management?tab=alumni&subtab=directory', icon: Users },
          { type: 'item', name: 'Batches', href: '/management?tab=alumni&subtab=batches', icon: GraduationCap },
          { type: 'item', name: 'Achievements', href: '/management?tab=alumni&subtab=achievements', icon: Trophy },
          { type: 'item', name: 'Contributions', href: '/management?tab=alumni&subtab=contributions', icon: Heart },
          { type: 'item', name: 'Events', href: '/management?tab=alumni&subtab=events', icon: Calendar },
        ],
      },
    ],
  },

  /* ─── VISITORS (flat) ─── */
  visitors: {
    slug: 'visitors',
    name: 'Visitors',
    icon: Eye,
    basePath: '/visitors',
    items: [
      { type: 'item', name: 'Dashboard', href: '/visitors', icon: ClipboardList },
      { type: 'item', name: 'Visitor Logs', href: '/visitors?tab=logs', icon: List },
      { type: 'item', name: 'Pre-Approved', href: '/visitors?tab=preapproved', icon: ShieldCheck },
      { type: 'item', name: 'Reports', href: '/visitors?tab=reports', icon: FileBarChart },
    ],
  },

  /* ─── REPORTS (flat) ─── */
  reports: {
    slug: 'reports',
    name: 'Reports',
    icon: BarChart3,
    basePath: '/reports',
    items: [
      { type: 'item', name: 'Dashboard', href: '/reports', icon: LayoutDashboard },
      { type: 'item', name: 'Templates', href: '/reports?tab=templates', icon: FileText },
      { type: 'item', name: 'History', href: '/reports?tab=history', icon: History },
      { type: 'item', name: 'Scheduled', href: '/reports?tab=scheduled', icon: Clock },
      { type: 'item', name: 'Analytics', href: '/reports?tab=analytics', icon: LineChart },
    ],
  },

  /* ─── SETTINGS (grouped) ─── */
  settings: {
    slug: 'settings',
    name: 'Settings',
    icon: Settings,
    basePath: '/settings',
    items: [
      {
        type: 'group',
        name: 'General',
        icon: Settings,
        roles: ['admin', 'principal'],
        defaultHref: '/settings',
        children: [
          { type: 'item', name: 'School Profile', href: '/settings?tab=general&subtab=school', icon: Building2 },
          { type: 'item', name: 'Academic Years', href: '/settings?tab=general&subtab=academic', icon: Calendar },
          { type: 'item', name: 'Calendar', href: '/settings?tab=general&subtab=calendar', icon: CalendarDays },
          { type: 'item', name: 'Classes', href: '/settings?tab=general&subtab=classes', icon: Users },
          { type: 'item', name: 'Users', href: '/settings?tab=general&subtab=users', icon: UserCheck },
          { type: 'item', name: 'Templates', href: '/settings?tab=general&subtab=templates', icon: Mail },
          { type: 'item', name: 'Notifications', href: '/settings?tab=general&subtab=notifications', icon: Bell },
          { type: 'item', name: 'Audit Log', href: '/settings?tab=general&subtab=audit', icon: History },
          { type: 'item', name: 'Backup', href: '/settings?tab=general&subtab=backup', icon: FileArchive },
          { type: 'item', name: 'Appearance', href: '/settings?tab=general&subtab=appearance', icon: Paintbrush },
        ],
      },
      { type: 'item', name: 'Permissions', href: '/settings?tab=permissions', icon: Lock, roles: ['admin', 'principal'] },
      { type: 'item', name: 'Modules', href: '/settings?tab=modules', icon: Puzzle, roles: ['admin'] },
      { type: 'item', name: 'Subscription', href: '/settings?tab=subscription', icon: CreditCard, roles: ['admin'] },
      {
        type: 'group',
        name: 'Communication',
        icon: MessageSquare,
        roles: ['admin', 'principal', 'teacher'],
        defaultHref: '/settings?tab=communication',
        children: [
          { type: 'item', name: 'Dashboard', href: '/settings?tab=communication&subtab=dashboard', icon: LayoutDashboard },
          { type: 'item', name: 'Announcements', href: '/settings?tab=communication&subtab=announcements', icon: Bell },
          { type: 'item', name: 'Messages', href: '/settings?tab=communication&subtab=messages', icon: MessagesSquare },
          { type: 'item', name: 'Circulars', href: '/settings?tab=communication&subtab=circulars', icon: Mail },
          { type: 'item', name: 'Surveys', href: '/settings?tab=communication&subtab=surveys', icon: ClipboardList },
          { type: 'item', name: 'Emergency', href: '/settings?tab=communication&subtab=emergency', icon: AlertTriangle },
          { type: 'item', name: 'Events', href: '/settings?tab=communication&subtab=events', icon: Calendar },
        ],
      },
      {
        type: 'group',
        name: 'Integrations',
        icon: Plug,
        roles: ['admin', 'principal'],
        defaultHref: '/settings?tab=integrations',
        children: [
          { type: 'item', name: 'SMS', href: '/settings?tab=integrations&subtab=sms', icon: MessageCircle },
          { type: 'item', name: 'Email', href: '/settings?tab=integrations&subtab=email', icon: Mail },
          { type: 'item', name: 'Payment', href: '/settings?tab=integrations&subtab=payment', icon: CreditCard },
          { type: 'item', name: 'WhatsApp', href: '/settings?tab=integrations&subtab=whatsapp', icon: MessagesSquare },
          { type: 'item', name: 'Biometric', href: '/settings?tab=integrations&subtab=biometric', icon: Fingerprint },
          { type: 'item', name: 'Webhooks', href: '/settings?tab=integrations&subtab=webhooks', icon: GitBranch },
          { type: 'item', name: 'API Keys', href: '/settings?tab=integrations&subtab=api-keys', icon: Lock },
        ],
      },
    ],
  },

  /* ─── BEHAVIOR (flat) ─── */
  behavior: {
    slug: 'behavior',
    name: 'Behavior',
    icon: MessageSquareWarning,
    basePath: '/behavior',
    items: [
      { type: 'item', name: 'Dashboard', href: '/behavior', icon: LayoutDashboard },
      { type: 'item', name: 'Incidents', href: '/behavior?tab=incidents', icon: Siren },
      { type: 'item', name: 'Detentions', href: '/behavior?tab=detentions', icon: Gavel },
    ],
  },

  /* ─── SCHOOL WEBSITE (flat) ─── */
  'school-website': {
    slug: 'school-website',
    name: 'Website Builder',
    icon: Globe,
    basePath: '/school-website',
    items: [
      { type: 'item', name: 'Pages', href: '/school-website', icon: Layout },
      { type: 'item', name: 'Blog', href: '/school-website?tab=blog', icon: PenSquare },
      { type: 'item', name: 'Look & Feel', href: '/school-website?tab=settings', icon: Paintbrush },
      { type: 'item', name: 'Leads', href: '/school-website?tab=leads', icon: Users },
      { type: 'item', name: 'Analytics', href: '/school-website?tab=analytics', icon: LineChart },
      { type: 'item', name: 'Form Analytics', href: '/school-website?tab=form-analytics', icon: Target },
      { type: 'item', name: 'Email Campaigns', href: '/school-website?tab=campaigns', icon: Mail },
    ],
  },

  /* ─── PARENT PORTAL (flat) ─── */
  'parent-portal': {
    slug: 'parent-portal',
    name: 'Parent Portal',
    icon: MessageCircle,
    basePath: '/parent-portal',
    items: [
      { type: 'item', name: 'Messages', href: '/parent-portal', icon: MessagesSquare },
      { type: 'item', name: 'Meetings', href: '/parent-portal?tab=meetings', icon: CalendarDays },
      { type: 'item', name: 'Progress', href: '/parent-portal?tab=progress', icon: TrendingUp },
    ],
  },

  /* ─── STUDENT PORTAL (mirrors parent-portal) ─── */
  'my-portal': {
    slug: 'my-portal',
    name: 'My Portal',
    icon: MessageCircle,
    basePath: '/my-portal',
    items: [
      { type: 'item', name: 'Messages', href: '/my-portal', icon: MessagesSquare },
      { type: 'item', name: 'My Grades', href: '/my-portal?tab=progress', icon: TrendingUp },
    ],
  },
}

/**
 * Get the module config for a given pathname.
 * Handles both single-segment (/people) and multi-segment (/school-website, /parent-portal) paths.
 */
export function getModuleFromPath(pathname: string): ModuleNavConfig | null {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return null

  // Try two-segment key first (e.g. "school-website", "parent-portal")
  const twoSegment = segments.slice(0, 2).join('-')
  if (MODULE_NAV[twoSegment]) return MODULE_NAV[twoSegment]

  // Then try single segment
  const firstSegment = segments[0]
  return MODULE_NAV[firstSegment] ?? null
}

/**
 * Check if a nav entry (leaf or group) matches the current URL.
 * For groups, checks if any child matches.
 */
export function isNavEntryActive(entry: ModuleNavEntry, currentUrl: string): boolean {
  if (entry.type === 'item') {
    return isLeafActive(entry.href, currentUrl)
  }
  return entry.children.some((child) => isLeafActive(child.href, currentUrl))
}

/**
 * Check if a leaf item href matches the current URL (pathname + search).
 */
function isLeafActive(href: string, currentUrl: string): boolean {
  // Exact match
  if (currentUrl === href) return true

  // For hrefs without query params, match on pathname only when no search params
  if (!href.includes('?')) {
    const [currentPath] = currentUrl.split('?')
    return currentPath === href && !currentUrl.includes('?')
  }

  // For hrefs with query params, check that all params in href are present in currentUrl
  const [hrefPath, hrefSearch] = href.split('?')
  const [currentPath, currentSearch] = currentUrl.split('?')
  if (hrefPath !== currentPath) return false
  if (!currentSearch) return false

  const hrefParams = new URLSearchParams(hrefSearch)
  const currentParams = new URLSearchParams(currentSearch)

  for (const [key, val] of hrefParams.entries()) {
    if (currentParams.get(key) !== val) return false
  }
  return true
}
