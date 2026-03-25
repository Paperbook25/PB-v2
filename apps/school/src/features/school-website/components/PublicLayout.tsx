/**
 * Shared layout wrapper for public website pages (blog, blog post, etc.)
 * that aren't rendered via PublicSchoolPage but need the same nav/footer.
 */
import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { usePublicPages, usePublicSettings } from '../api/school-website.api'

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const { data: pages } = usePublicPages()
  const { data: settings } = usePublicSettings()

  const primaryColor = settings?.primaryColor || '#1e3a8a'
  const accentColor = settings?.accentColor || '#f59e0b'
  const fontFamily = settings?.fontFamily || 'Inter'
  const logoUrl = (settings as any)?.logoUrl || ''
  const schoolName = settings?.metaTitle || 'Our School'
  const publishedPages = [
    ...(pages || []),
    { slug: 'blog', title: 'Blog', sortOrder: 99 },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily }}>
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b" style={{ borderBottomColor: `${primaryColor}20` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/s/home" className="flex items-center gap-3 min-w-0">
              {logoUrl ? (
                <img src={logoUrl} alt={schoolName} className="h-12 w-12 object-contain" />
              ) : (
                <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: primaryColor }}>
                  {schoolName.charAt(0)}
                </div>
              )}
              <span className="font-bold text-gray-900 text-base truncate">{schoolName}</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {publishedPages.map(p => (
                <Link
                  key={p.slug}
                  to={`/s/${p.slug}`}
                  className="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={{ color: '#4b5563' }}
                  onMouseEnter={e => (e.currentTarget.style.color = primaryColor)}
                  onMouseLeave={e => (e.currentTarget.style.color = '#4b5563')}
                >
                  {p.title}
                </Link>
              ))}
            </div>

            <Link
              to="/apply"
              className="px-5 py-2 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              Apply Now
            </Link>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="flex-1">
        {children}
      </main>

      {/* FOOTER */}
      <footer style={{ backgroundColor: primaryColor }} className="text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt={schoolName} className="h-10 w-10 object-contain bg-white/10 rounded-lg p-1" />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center font-bold">{schoolName.charAt(0)}</div>
              )}
              <span className="font-bold text-lg">{schoolName}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {publishedPages.map(p => (
                <Link key={p.slug} to={`/s/${p.slug}`} className="text-sm text-white/70 hover:text-white transition-colors">
                  {p.title}
                </Link>
              ))}
            </div>
            <p className="text-xs text-white/50">&copy; {new Date().getFullYear()} {schoolName}. Powered by PaperBook</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
