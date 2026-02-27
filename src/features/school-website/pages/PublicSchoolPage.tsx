import { useParams, Link } from 'react-router-dom'
import { usePublicPage, usePublicPages, usePublicSettings } from '../api/school-website.api'
import { SectionRenderer } from '../components/SectionRenderers'

export function PublicSchoolPage() {
  const { slug = 'home' } = useParams()
  const { data: page, isLoading, isError } = usePublicPage(slug)
  const { data: pages } = usePublicPages()
  const { data: settings } = usePublicSettings()

  const template = settings?.template || 'classic'
  const primaryColor = settings?.primaryColor || '#1e40af'
  const fontFamily = settings?.fontFamily || 'Inter'

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (isError || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-300 mb-4">404</h1>
          <p className="text-gray-600">Page not found</p>
          <Link to="/s/home" className="text-blue-600 hover:underline mt-2 inline-block">Go to homepage</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily }}>
      {/* Navigation */}
      {pages && pages.length > 1 && (
        <nav
          className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm"
          style={{ borderColor: `${primaryColor}20` }}
        >
          <div className="max-w-6xl mx-auto px-6 flex items-center h-14 gap-6">
            <span className="font-bold text-gray-900">
              {settings?.metaTitle || 'School'}
            </span>
            <div className="flex-1" />
            {pages.map(p => (
              <Link
                key={p.slug}
                to={`/s/${p.slug}`}
                className={`text-sm font-medium transition ${
                  p.slug === slug
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {p.title}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Sections */}
      {page.sections.map(section => (
        <SectionRenderer key={section.id} section={section} template={template} />
      ))}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm">
            &copy; {new Date().getFullYear()} {settings?.metaTitle || 'School'}. All rights reserved.
          </div>
          {settings?.socialLinks && Object.keys(settings.socialLinks).length > 0 && (
            <div className="flex items-center gap-4">
              {Object.entries(settings.socialLinks)
                .filter(([, url]) => url)
                .map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white capitalize text-sm transition"
                  >
                    {platform}
                  </a>
                ))}
            </div>
          )}
          <div className="text-xs text-gray-600">
            Powered by PaperBook
          </div>
        </div>
      </footer>
    </div>
  )
}
