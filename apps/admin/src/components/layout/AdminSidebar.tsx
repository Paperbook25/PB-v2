import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  School,
  Puzzle,
  Users,
  ScrollText,
  Settings,
  ShieldCheck,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard, end: true },
  { label: 'Schools', to: '/schools', icon: School },
  { label: 'Addons', to: '/addons', icon: Puzzle },
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
          <ShieldCheck className="h-4.5 w-4.5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-sidebar-foreground">Paperbook</h1>
          <p className="text-[10px] font-medium uppercase tracking-wider text-sidebar-muted">
            Admin Portal
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
          Paperbook Admin v0.1.0
        </p>
      </div>
    </aside>
  )
}
