import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface Breadcrumb {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: Breadcrumb[]
  actions?: ReactNode
  children?: ReactNode
  /** @deprecated Module color theming has been removed. This prop is ignored. */
  moduleColor?: string
}

export function PageHeader({ title, description, breadcrumbs, actions, children }: PageHeaderProps) {
  return (
    <div className="border-b border-border bg-card px-6 py-5">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center text-sm text-muted-foreground mb-1">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-1.5 text-muted-foreground/60">/</span>
              )}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* Title & Actions */}
      <div className="flex items-center justify-between mt-1">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {/* Optional children content below header */}
      {children}
    </div>
  )
}
