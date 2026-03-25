import { useParams, Link } from 'react-router-dom'
import { usePublicPage, usePublicPages, usePublicSettings } from '../api/school-website.api'
import { SectionRenderer } from '../components/SectionRenderers'
import { SeoHead } from '../components/SeoHead'
import { WhatsAppWidget } from '../components/WhatsAppWidget'
import { AnnouncementBar } from '../components/AnnouncementBar'
import { getTemplateConfig } from '../templates/registry'

const LEGACY_MAP: Record<string, string> = {
  classic: 'school-classic',
  modern: 'school-modern',
  minimal: 'school-minimal',
}

export function PublicSchoolPage() {
  const { slug = 'home' } = useParams()
  const { data: page, isLoading, isError } = usePublicPage(slug)
  const { data: pages } = usePublicPages()
  const { data: settings } = usePublicSettings()

  const templateId = LEGACY_MAP[settings?.template || ''] || settings?.template || 'school-modern'
  const primaryColor = settings?.primaryColor || '#1e40af'
  const accentColor = settings?.accentColor || '#f59e0b'
  const fontFamily = settings?.fontFamily || 'Inter'
  const logoUrl = (settings as any)?.logoUrl || ''
  const schoolName = settings?.metaTitle || 'Our School'
  const whatsappNumber = (settings as any)?.whatsappNumber || ''
  const announcementEnabled = (settings as any)?.announcementEnabled || false
  const announcementText = (settings as any)?.announcementText || ''
  const announcementLink = (settings as any)?.announcementLink || ''

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: primaryColor, borderTopColor: 'transparent' }} />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (isError || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
          <p className="text-gray-600 mb-4">Page not found</p>
          <Link to="/s/home" className="inline-block px-6 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: primaryColor }}>Go to Homepage</Link>
        </div>
      </div>
    )
  }

  const publishedPages = pages || []

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily, '--brand-primary': primaryColor, '--brand-accent': accentColor } as React.CSSProperties}>
      <SeoHead
        title={(page as any).metaTitle || `${page.title} | ${schoolName}`}
        description={(page as any).metaDescription || settings?.metaDescription || ''}
        ogTitle={(page as any).metaTitle || page.title}
        ogDescription={(page as any).metaDescription || settings?.metaDescription || ''}
        ogImage={(page as any).ogImage || ''}
        ogUrl={window.location.href}
        jsonLd={(page as any).jsonLd as object}
        faviconUrl={(settings as any)?.faviconUrl || ''}
        gaTrackingId={(settings as any)?.gaTrackingId || ''}
      />
      {/* ===== ANNOUNCEMENT BAR ===== */}
      {announcementEnabled && announcementText && (
        <AnnouncementBar
          text={announcementText}
          link={announcementLink || undefined}
          accentColor={accentColor}
        />
      )}

      {/* ===== NAVIGATION ===== */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            {/* Logo + School Name */}
            <Link to="/s/home" className="flex items-center gap-4 min-w-0">
              {logoUrl ? (
                <img src={logoUrl} alt={schoolName} className="h-20 w-20 object-contain" />
              ) : (
                <div className="h-20 w-20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-md" style={{ backgroundColor: primaryColor }}>
                  {schoolName.charAt(0)}
                </div>
              )}
              <div className="hidden sm:block min-w-0">
                <span className="font-bold text-gray-900 text-lg block truncate leading-tight">{schoolName}</span>
              </div>
            </Link>

            {/* Nav Links */}
            <div className="flex items-center gap-1">
              {publishedPages.map(p => (
                <Link
                  key={p.slug}
                  to={`/s/${p.slug}`}
                  className="px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                  style={p.slug === slug ? { color: primaryColor, backgroundColor: `${primaryColor}10` } : { color: '#4b5563' }}
                  onMouseEnter={e => { if (p.slug !== slug) (e.target as HTMLElement).style.color = primaryColor }}
                  onMouseLeave={e => { if (p.slug !== slug) (e.target as HTMLElement).style.color = '#4b5563' }}
                >
                  {p.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* ===== SECTIONS ===== */}
      <main>
        {page.sections
          .filter((s: any) => s.isVisible !== false)
          .map((section: any) => (
            <SectionRenderer
              key={section.id}
              section={section}
              template={templateId}
              primaryColor={primaryColor}
              accentColor={accentColor}
            />
          ))}
      </main>

      {/* ===== FOOTER ===== */}
      <footer style={{ backgroundColor: primaryColor }} className="text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                {logoUrl ? (
                  <img src={logoUrl} alt={schoolName} className="h-20 w-20 object-contain bg-white/10 rounded-xl p-1.5" />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-2xl">{schoolName.charAt(0)}</div>
                )}
                <span className="font-bold text-lg">{schoolName}</span>
              </div>
              {settings?.metaDescription && (
                <p className="text-sm text-white/70 leading-relaxed">{settings.metaDescription.slice(0, 150)}...</p>
              )}
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white/90">Quick Links</h4>
              <div className="space-y-2">
                {publishedPages.map(p => (
                  <Link key={p.slug} to={`/s/${p.slug}`} className="block text-sm text-white/70 hover:text-white transition-colors">
                    {p.title}
                  </Link>
                ))}
                <Link to="/apply" className="block text-sm text-white/70 hover:text-white transition-colors">Apply Online</Link>
              </div>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold mb-4 text-white/90">Connect With Us</h4>
              {settings?.socialLinks && (
                <div className="flex flex-wrap gap-3">
                  {Object.entries(settings.socialLinks as Record<string, string>)
                    .filter(([, url]) => url)
                    .map(([platform, url]) => (
                      <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm capitalize transition-colors">
                        {platform}
                      </a>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/60">&copy; {new Date().getFullYear()} {schoolName}. All rights reserved.</p>
            <p className="text-xs text-white/40">Powered by PaperBook</p>
          </div>
        </div>
      </footer>

      {/* ===== WHATSAPP WIDGET ===== */}
      {whatsappNumber && (
        <WhatsAppWidget phoneNumber={whatsappNumber} schoolName={schoolName} />
      )}
    </div>
  )
}
