import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePublicPage, usePublicPages, usePublicSettings } from '../api/school-website.api'
import { SectionRenderer } from '../components/SectionRenderers'
import { SeoHead } from '../components/SeoHead'
import { WhatsAppWidget } from '../components/WhatsAppWidget'
import { ChatWidget } from '../components/ChatWidget'
import { AnnouncementBar } from '../components/AnnouncementBar'
import { getTemplateConfig } from '../templates/registry'
import type { TemplateTheme } from '../templates/registry'
import type { ContactContent } from '../types/school-website.types'
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const LEGACY_MAP: Record<string, string> = {
  classic: 'school-classic',
  modern: 'school-modern',
  minimal: 'school-minimal',
}

/** Hex color to RGB components */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 }
}

/** Darken a hex color by mixing with black */
function darkenColor(hex: string, amount = 0.35): string {
  const { r, g, b } = hexToRgb(hex)
  const dr = Math.round(r * (1 - amount))
  const dg = Math.round(g * (1 - amount))
  const db = Math.round(b * (1 - amount))
  return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`
}

// ---------------------------------------------------------------------------
// SVG Social Icons
// ---------------------------------------------------------------------------

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  )
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

const SOCIAL_ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  facebook: FacebookIcon,
  twitter: TwitterIcon,
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  linkedin: LinkedinIcon,
}

// ---------------------------------------------------------------------------
// Navigation Variants
// ---------------------------------------------------------------------------

interface NavProps {
  logoUrl: string
  schoolName: string
  primaryColor: string
  accentColor: string
  publishedPages: { slug: string; title: string }[]
  currentSlug: string
  navStyle: TemplateTheme['navStyle']
  hasHero?: boolean
}

function MobileDrawer({
  isOpen,
  onClose,
  publishedPages,
  currentSlug,
  primaryColor,
  accentColor,
  schoolName,
  logoUrl,
}: NavProps & { isOpen: boolean; onClose: () => void }) {
  const { t } = useLanguage()
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-[70] shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <Link to="/s/home" className="flex items-center gap-3" onClick={onClose}>
              {logoUrl ? (
                <img src={logoUrl} alt={schoolName} className="h-10 w-10 object-contain" />
              ) : (
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {schoolName.charAt(0)}
                </div>
              )}
              <span className="font-bold text-gray-900 text-sm truncate">{schoolName}</span>
            </Link>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            {publishedPages.map(p => (
              <Link
                key={p.slug}
                to={`/s/${p.slug}`}
                onClick={onClose}
                className="px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                style={
                  p.slug === currentSlug
                    ? { color: primaryColor, backgroundColor: `${primaryColor}10` }
                    : { color: '#374151' }
                }
              >
                {p.title}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex justify-center">
            <LanguageToggle />
          </div>
          <div className="mt-4 pt-6 border-t border-gray-100">
            <Link
              to="/apply"
              onClick={onClose}
              className="block w-full text-center px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              {t('nav.apply')}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

function LanguageToggle() {
  const { language, setLanguage } = useLanguage()
  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
      className="text-xs px-2.5 py-1 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
      aria-label={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
    >
      {language === 'en' ? '\u0939\u093F\u0902\u0926\u0940' : 'English'}
    </button>
  )
}

function HamburgerButton({ onClick, color = '#374151' }: { onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-lg hover:bg-black/5 transition-colors"
      aria-label="Open menu"
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  )
}

function SolidNav(props: NavProps) {
  const { logoUrl, schoolName, primaryColor, accentColor, publishedPages, currentSlug } = props
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white shadow-sm" style={{ borderBottom: `3px solid ${primaryColor}` }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/s/home" className="flex items-center gap-3 min-w-0">
              {logoUrl ? (
                <img src={logoUrl} alt={schoolName} className="h-12 w-auto object-contain" />
              ) : (
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {schoolName.charAt(0)}
                </div>
              )}
              <span className="font-bold text-gray-900 text-base truncate">{schoolName}</span>
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              {publishedPages.map(p => (
                <Link
                  key={p.slug}
                  to={`/s/${p.slug}`}
                  className="relative px-4 py-2 text-sm font-medium transition-colors"
                  style={
                    p.slug === currentSlug
                      ? { color: primaryColor }
                      : { color: '#4b5563' }
                  }
                >
                  {p.title}
                  {p.slug === currentSlug && (
                    <span
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  )}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <Link
                to="/apply"
                className="hidden sm:inline-flex px-5 py-2 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 hover:shadow-md"
                style={{ backgroundColor: accentColor }}
              >
                {t('nav.apply')}
              </Link>
              <HamburgerButton onClick={() => setMobileOpen(true)} />
            </div>
          </div>
        </div>
      </nav>
      <MobileDrawer {...props} isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}

function FloatingNav(props: NavProps) {
  const { logoUrl, schoolName, primaryColor, accentColor, publishedPages, currentSlug } = props
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useLanguage()

  return (
    <>
      <div className="sticky top-0 z-50 px-4 pt-3">
        <nav className="max-w-6xl mx-auto bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg shadow-black/5 border border-white/50">
          <div className="px-6">
            <div className="flex items-center justify-between h-16">
              <Link to="/s/home" className="flex items-center gap-3 min-w-0">
                {logoUrl ? (
                  <img src={logoUrl} alt={schoolName} className="h-12 w-auto object-contain" />
                ) : (
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {schoolName.charAt(0)}
                  </div>
                )}
                <span className="font-bold text-gray-900 text-base truncate">{schoolName}</span>
              </Link>
              <div className="hidden lg:flex items-center gap-1">
                {publishedPages.map(p => (
                  <Link
                    key={p.slug}
                    to={`/s/${p.slug}`}
                    className="px-4 py-1.5 text-sm font-medium rounded-full transition-all"
                    style={
                      p.slug === currentSlug
                        ? { color: 'white', backgroundColor: primaryColor }
                        : { color: '#4b5563' }
                    }
                  >
                    {p.title}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <LanguageToggle />
                <Link
                  to="/apply"
                  className="hidden sm:inline-flex px-5 py-2 rounded-full text-white text-sm font-semibold transition-all hover:opacity-90 hover:shadow-md"
                  style={{ backgroundColor: accentColor }}
                >
                  {t('nav.apply')}
                </Link>
                <HamburgerButton onClick={() => setMobileOpen(true)} />
              </div>
            </div>
          </div>
        </nav>
      </div>
      <MobileDrawer {...props} isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}

function TransparentNav(props: NavProps) {
  const { logoUrl, schoolName, primaryColor, accentColor, publishedPages, currentSlug, hasHero } = props
  // If the page has no hero section, start as solid immediately
  const [scrolled, setScrolled] = useState(!hasHero)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    if (!hasHero) {
      // No hero — always stay solid
      setScrolled(true)
      return
    }
    const handleScroll = () => setScrolled(window.scrollY > 10)
    handleScroll() // check immediately
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasHero])

  const textColor = scrolled ? '#374151' : '#ffffff'
  const activeColor = scrolled ? primaryColor : '#ffffff'

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrolled ? 'rgba(255,255,255,0.97)' : 'transparent',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          boxShadow: scrolled ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/s/home" className="flex items-center gap-3 min-w-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={schoolName}
                  className="h-12 w-auto object-contain transition-all duration-300"
                  style={{ filter: scrolled ? 'none' : 'brightness(0) invert(1)' }}
                />
              ) : (
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300"
                  style={{
                    backgroundColor: scrolled ? primaryColor : 'rgba(255,255,255,0.2)',
                    color: 'white',
                  }}
                >
                  {schoolName.charAt(0)}
                </div>
              )}
              <span
                className="font-bold text-base truncate transition-colors duration-300"
                style={{ color: textColor }}
              >
                {schoolName}
              </span>
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              {publishedPages.map(p => (
                <Link
                  key={p.slug}
                  to={`/s/${p.slug}`}
                  className="relative px-4 py-2 text-sm font-medium transition-colors duration-300"
                  style={{ color: p.slug === currentSlug ? activeColor : scrolled ? '#6b7280' : 'rgba(255,255,255,0.85)' }}
                >
                  {p.title}
                  {p.slug === currentSlug && (
                    <span
                      className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full transition-colors duration-300"
                      style={{ backgroundColor: activeColor }}
                    />
                  )}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <LanguageToggle />
              <Link
                to="/apply"
                className="hidden sm:inline-flex px-5 py-2 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 hover:shadow-md"
                style={{ backgroundColor: accentColor }}
              >
                {t('nav.apply')}
              </Link>
              <HamburgerButton onClick={() => setMobileOpen(true)} color={textColor} />
            </div>
          </div>
        </div>
      </nav>
      {/* Spacer only when not scrolled — hero sits behind the transparent nav */}
      <MobileDrawer {...props} isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

interface FooterProps {
  logoUrl: string
  schoolName: string
  description: string
  primaryColor: string
  accentColor: string
  publishedPages: { slug: string; title: string }[]
  socialLinks: Record<string, string>
  contactInfo: {
    address?: { street: string; city: string; state: string; pincode: string }
    phones?: { label: string; number: string }[]
    emails?: { label: string; address: string }[]
  }
}

function RichFooter({
  logoUrl,
  schoolName,
  description,
  primaryColor,
  publishedPages,
  socialLinks,
  contactInfo,
}: FooterProps) {
  const { t } = useLanguage()
  const footerBg = darkenColor(primaryColor, 0.35)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const socialEntries = Object.entries(socialLinks).filter(([, url]) => url)

  const addressText = contactInfo.address
    ? [contactInfo.address.street, contactInfo.address.city, contactInfo.address.state, contactInfo.address.pincode]
        .filter(Boolean)
        .join(', ')
    : ''

  return (
    <footer style={{ backgroundColor: footerBg }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Column 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={schoolName}
                  className="h-12 w-12 object-contain bg-white/10 rounded-xl p-1"
                />
              ) : (
                <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center font-bold text-lg">
                  {schoolName.charAt(0)}
                </div>
              )}
              <span className="font-bold text-lg leading-tight">{schoolName}</span>
            </div>
            {description && (
              <p className="text-sm text-white/60 leading-relaxed mb-5 max-w-xs">
                {description.length > 160 ? `${description.slice(0, 160)}...` : description}
              </p>
            )}
            {socialEntries.length > 0 && (
              <div className="flex items-center gap-2">
                {socialEntries.map(([platform, url]) => {
                  const Icon = SOCIAL_ICON_MAP[platform.toLowerCase()]
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                      aria-label={`Visit our ${platform} page`}
                    >
                      {Icon ? <Icon className="w-4 h-4" /> : <span className="text-xs capitalize">{platform.charAt(0)}</span>}
                    </a>
                  )
                })}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/80 mb-5">{t('footer.quickLinks')}</h4>
            <nav className="flex flex-col gap-2.5">
              {publishedPages.map(p => (
                <Link
                  key={p.slug}
                  to={`/s/${p.slug}`}
                  className="text-sm text-white/60 hover:text-white transition-colors"
                >
                  {p.title}
                </Link>
              ))}
              <Link to="/apply" className="text-sm text-white/60 hover:text-white transition-colors">
                Apply Online
              </Link>
            </nav>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/80 mb-5">{t('footer.contactInfo')}</h4>
            <div className="space-y-3">
              {addressText && (
                <div className="flex gap-2.5 text-sm text-white/60">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span>{addressText}</span>
                </div>
              )}
              {contactInfo.phones?.filter(p => p.number).map((phone, i) => (
                <div key={i} className="flex gap-2.5 text-sm text-white/60">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <a href={`tel:${phone.number}`} className="hover:text-white transition-colors">
                    {phone.number}{phone.label ? ` (${phone.label})` : ''}
                  </a>
                </div>
              ))}
              {contactInfo.emails?.filter(e => e.address).map((emailEntry, i) => (
                <div key={i} className="flex gap-2.5 text-sm text-white/60">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <a href={`mailto:${emailEntry.address}`} className="hover:text-white transition-colors">
                    {emailEntry.address}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-white/80 mb-5">{t('footer.newsletter')}</h4>
            <p className="text-sm text-white/50 mb-4">
              Stay updated with the latest news, events, and announcements.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-sm text-emerald-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Thanks for subscribing!
              </div>
            ) : (
              <form
                onSubmit={e => {
                  e.preventDefault()
                  if (email.trim()) setSubscribed(true)
                }}
                className="flex flex-col gap-2.5"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-white/30 focus:bg-white/15 transition-colors"
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: 'white' }}
                >
                  {t('footer.subscribe')}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} {schoolName}. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
            <span>&middot;</span>
            <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
            <span>&middot;</span>
            <span>{t('footer.poweredBy')}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ---------------------------------------------------------------------------
// Scroll-to-Top Button
// ---------------------------------------------------------------------------

function ScrollToTopButton({ accentColor }: { accentColor: string }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-300 hover:shadow-xl hover:scale-105 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      style={{ backgroundColor: accentColor }}
      aria-label="Scroll to top"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
      </svg>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export function PublicSchoolPage() {
  return (
    <LanguageProvider>
      <PublicSchoolPageInner />
    </LanguageProvider>
  )
}

function PublicSchoolPageInner() {
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
  const description = settings?.metaDescription || ''
  const whatsappNumber = (settings as any)?.whatsappNumber || ''
  const announcementEnabled = (settings as any)?.announcementEnabled || false
  const announcementText = (settings as any)?.announcementText || ''
  const announcementLink = (settings as any)?.announcementLink || ''
  const socialLinks = (settings?.socialLinks as Record<string, string>) || {}

  // Resolve template theme
  const theme = useMemo<TemplateTheme>(() => {
    try {
      return getTemplateConfig(templateId).theme
    } catch {
      return {
        defaultPrimaryColor: '#2563eb',
        defaultAccentColor: '#f59e0b',
        defaultFont: 'Inter',
        heroStyle: 'banner',
        cardStyle: 'elevated',
        cornerRadius: 'lg',
        navStyle: 'solid',
        sectionSpacing: 'normal',
      }
    }
  }, [templateId])

  const publishedPages = [
    ...(pages || []),
    { slug: 'blog', title: 'Blog', sortOrder: 99 },
  ]

  // Extract contact info from contact sections across all pages
  const contactInfo = useMemo(() => {
    if (!page) return { address: undefined, phones: undefined, emails: undefined }
    const contactSection = page.sections.find((s: any) => s.type === 'contact')
    if (!contactSection) return { address: undefined, phones: undefined, emails: undefined }
    const content = contactSection.content as unknown as ContactContent
    return {
      address: content?.address,
      phones: content?.phones,
      emails: content?.emails,
    }
  }, [page])

  // CSS custom properties
  const { r: pr, g: pg, b: pb } = hexToRgb(primaryColor)
  const primaryDark = darkenColor(primaryColor, 0.35)
  const cssVars = {
    '--brand-primary': primaryColor,
    '--brand-accent': accentColor,
    '--brand-primary-rgb': `${pr}, ${pg}, ${pb}`,
    '--brand-primary-light': `${primaryColor}0D`,
    '--brand-primary-dark': primaryDark,
    fontFamily,
  } as React.CSSProperties

  // Check if first visible section is a hero (needed for TransparentNav)
  const allVisibleSections = (page?.sections || []).filter((s: any) => s.isVisible !== false)
  const hasHero = allVisibleSections.length > 0 && allVisibleSections[0].type === 'hero'

  // Nav props shared across all variants
  const navProps: NavProps = {
    logoUrl,
    schoolName,
    primaryColor,
    accentColor,
    publishedPages,
    currentSlug: slug,
    navStyle: theme.navStyle,
    hasHero,
  }

  // ---- Loading state ----
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 border-2 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: primaryColor, borderTopColor: 'transparent' }}
          />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // ---- Error / 404 state ----
  if (isError || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" style={cssVars}>
        <div className="text-center">
          <h1 className="text-8xl font-extrabold text-gray-100 mb-2">404</h1>
          <p className="text-lg text-gray-500 mb-6">The page you are looking for does not exist.</p>
          <Link
            to="/s/home"
            className="inline-block px-8 py-3 rounded-xl text-white text-sm font-semibold shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
            style={{ backgroundColor: primaryColor }}
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  // Visible sections
  const visibleSections = allVisibleSections

  return (
    <div className="min-h-screen bg-white animate-fadeIn" style={cssVars}>
      {/* Inline keyframe for fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out both;
        }
      `}</style>

      <SeoHead
        title={(page as any).metaTitle || `${page.title} | ${schoolName}`}
        description={(page as any).metaDescription || description}
        ogTitle={(page as any).metaTitle || page.title}
        ogDescription={(page as any).metaDescription || description}
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
      {theme.navStyle === 'floating' ? (
        <FloatingNav {...navProps} />
      ) : theme.navStyle === 'transparent' ? (
        <TransparentNav {...navProps} />
      ) : (
        <SolidNav {...navProps} />
      )}

      {/* ===== SECTIONS with alternating backgrounds ===== */}
      <main>
        {visibleSections.map((section: any, index: number) => (
          <div
            key={section.id}
            style={{
              backgroundColor: index % 2 === 1 ? `rgba(${pr}, ${pg}, ${pb}, 0.04)` : 'transparent',
            }}
          >
            <SectionRenderer
              section={section}
              template={templateId}
              primaryColor={primaryColor}
              accentColor={accentColor}
            />
          </div>
        ))}
      </main>

      {/* ===== FOOTER ===== */}
      <RichFooter
        logoUrl={logoUrl}
        schoolName={schoolName}
        description={description}
        primaryColor={primaryColor}
        accentColor={accentColor}
        publishedPages={publishedPages}
        socialLinks={socialLinks}
        contactInfo={contactInfo}
      />

      {/* ===== CHATBOT WIDGET ===== */}
      <ChatWidget primaryColor={primaryColor} accentColor={accentColor} schoolName={schoolName} />

      {/* ===== WHATSAPP WIDGET ===== */}
      {whatsappNumber && (
        <WhatsAppWidget phoneNumber={whatsappNumber} schoolName={schoolName} />
      )}

      {/* ===== SCROLL TO TOP ===== */}
      <ScrollToTopButton accentColor={accentColor} />
    </div>
  )
}
