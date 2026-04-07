import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  School,
  Puzzle,
  Users,
  ScrollText,
  Settings,
  Orbit,
  CreditCard,
  Receipt,
  Target,
  Megaphone,
  BarChart3,
  Activity,
  HeartPulse,
  Shield,
  TicketCheck,
  MessageSquare,
  Globe,
  Plug,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
  { label: 'Website', to: '/website', icon: Globe },
  { label: 'Schools', to: '/schools', icon: School },
  { label: 'CRM', to: '/crm', icon: Target },
  { label: 'Subscriptions', to: '/subscriptions', icon: CreditCard },
  { label: 'Billing', to: '/billing', icon: Receipt },
  { label: 'Tickets', to: '/tickets', icon: TicketCheck },
  { label: 'Communications', to: '/communications', icon: MessageSquare },
  { label: 'Announcements', to: '/announcements', icon: Megaphone },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Usage', to: '/usage', icon: Activity },
  { label: 'Health', to: '/health', icon: HeartPulse },
  { label: 'Security', to: '/security', icon: Shield },
  { label: 'Addons', to: '/addons', icon: Puzzle },
  { label: 'Integrations', to: '/integrations', icon: Plug },
  { label: 'Users', to: '/users', icon: Users },
  { label: 'Audit Log', to: '/audit', icon: ScrollText },
  { label: 'Settings', to: '/settings', icon: Settings },
]

export function AdminSidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Orbit className="h-4.5 w-4.5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-sidebar-foreground">Gravity</h1>
          <p className="text-[10px] font-medium uppercase tracking-wider text-sidebar-muted">
            Portal
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-4 py-3">
        <p className="text-[11px] text-sidebar-muted">
          Gravity Portal v1.0.0
        </p>
      </div>
    </aside>
  )
}
