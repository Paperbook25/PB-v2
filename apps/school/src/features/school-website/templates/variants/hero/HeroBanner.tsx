import { useState, useEffect, useCallback } from 'react'
import type { VariantProps } from '../../section-variants'
import { radiusClass, field } from '../shared'

interface HeroSlide {
  image: string
  headline: string
  subtitle: string
  ctaText: string
  ctaLink: string
}

const DEFAULT_SLIDES: HeroSlide[] = [
  { image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1600', headline: 'Welcome to Our Institution', subtitle: 'Building futures through quality education', ctaText: 'Learn More', ctaLink: '#' },
  { image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600', headline: 'World-Class Infrastructure', subtitle: 'Smart classrooms, modern labs, and extensive sports facilities', ctaText: 'Explore Campus', ctaLink: '#' },
  { image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600', headline: 'Excellence in Academics', subtitle: 'Consistently outstanding board results and competitive exam selections', ctaText: 'View Results', ctaLink: '#' },
  { image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1600', headline: 'Holistic Development', subtitle: '50+ clubs, sports teams, and cultural activities', ctaText: 'Student Life', ctaLink: '#' },
]

export function HeroBanner({ section, theme }: VariantProps) {
  const rawSlides = field(section.content, 'slides', null) as unknown as HeroSlide[] | null
  const slides: HeroSlide[] = Array.isArray(rawSlides) && rawSlides.length > 0
    ? rawSlides
    : [{
        image: field(section.content, 'backgroundImage', DEFAULT_SLIDES[0].image),
        headline: field(section.content, 'headline', DEFAULT_SLIDES[0].headline),
        subtitle: field(section.content, 'subtitle', DEFAULT_SLIDES[0].subtitle),
        ctaText: field(section.content, 'ctaText', DEFAULT_SLIDES[0].ctaText),
        ctaLink: field(section.content, 'ctaLink', DEFAULT_SLIDES[0].ctaLink),
      },
      ...DEFAULT_SLIDES.slice(1),
    ]

  const secondaryCtaText = field(section.content, 'secondaryCtaText', '')
  const secondaryCtaLink = field(section.content, 'secondaryCtaLink', '#')

  // Extract trust badges from content or use defaults
  const trustBadges = field<string[]>(section.content, 'trustBadges', [])
  const displayBadges = trustBadges.length > 0
    ? trustBadges
    : ['CBSE Affiliated', 'ISO 9001:2015 Certified', '25+ Years of Excellence']

  const [current, setCurrent] = useState(0)
  const [previous, setPrevious] = useState(-1)

  const goTo = useCallback((idx: number) => {
    setPrevious(current)
    setCurrent(idx)
  }, [current])

  const goNext = useCallback(() => {
    setPrevious(current)
    setCurrent(prev => (prev + 1) % slides.length)
  }, [current, slides.length])

  const goPrev = useCallback(() => {
    setPrevious(current)
    setCurrent(prev => (prev - 1 + slides.length) % slides.length)
  }, [current, slides.length])

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(goNext, 8000)
    return () => clearInterval(timer)
  }, [goNext, slides.length])

  // Reset previous after crossfade completes
  useEffect(() => {
    if (previous === -1) return
    const t = setTimeout(() => setPrevious(-1), 1200)
    return () => clearTimeout(t)
  }, [previous])

  const slide = slides[current]
  const pc = theme.defaultPrimaryColor
  const ac = theme.defaultAccentColor

  return (
    <section className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* ===== BACKGROUND SLIDES with Ken Burns ===== */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            opacity: i === current ? 1 : i === previous ? 0 : 0,
            transition: 'opacity 1.2s ease-in-out',
            zIndex: i === current ? 2 : i === previous ? 1 : 0,
          }}
        >
          <img
            src={s.image}
            alt=""
            className="h-full w-full object-cover"
            style={{
              animation: i === current ? 'heroBannerKenBurns 8s ease-out forwards' : 'none',
              willChange: 'transform',
            }}
          />
        </div>
      ))}

      {/* ===== GRADIENT OVERLAY — primary color from left ===== */}
      <div
        className="absolute inset-0 z-[3]"
        style={{
          background: `linear-gradient(to right, ${pc}CC 0%, ${pc}99 35%, ${pc}44 65%, transparent 100%)`,
        }}
      />
      {/* Additional bottom gradient for readability */}
      <div
        className="absolute inset-0 z-[3]"
        style={{
          background: `linear-gradient(to top, ${pc}DD 0%, transparent 40%)`,
        }}
      />

      {/* ===== DECORATIVE GEOMETRIC ELEMENTS ===== */}
      <div className="absolute inset-0 z-[4] pointer-events-none overflow-hidden">
        {/* Large circle, top-right */}
        <div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-[0.07]"
          style={{ border: `2px solid ${ac}` }}
        />
        {/* Small circle, bottom-left */}
        <div
          className="absolute bottom-40 left-10 h-20 w-20 rounded-full opacity-[0.1]"
          style={{ backgroundColor: ac }}
        />
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 flex min-h-screen items-center">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* LEFT: Text Content — left-aligned */}
            <div className="lg:col-span-7 text-white">
              {/* Accent bar above headline */}
              <div
                key={`bar-${current}`}
                className="h-1 w-12 mb-8"
                style={{
                  backgroundColor: ac,
                  animation: 'heroBannerFadeSlideUp 0.6s ease-out both',
                }}
              />

              {/* Slide badge */}
              <div
                key={`badge-${current}`}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-6"
                style={{
                  backgroundColor: `${ac}20`,
                  color: ac,
                  animation: 'heroBannerFadeSlideUp 0.6s ease-out 0.1s both',
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ac }} />
                {current === 0 ? 'Welcome' : `Discover More`}
              </div>

              {/* Headline */}
              <h1
                key={`h-${current}`}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.05] tracking-tight"
                style={{ animation: 'heroBannerFadeSlideUp 0.8s ease-out 0.15s both' }}
              >
                {slide.headline}
              </h1>

              {/* Subtitle */}
              <p
                key={`s-${current}`}
                className="mt-6 text-lg sm:text-xl text-white/75 leading-relaxed max-w-xl font-light"
                style={{ animation: 'heroBannerFadeSlideUp 0.8s ease-out 0.3s both' }}
              >
                {slide.subtitle}
              </p>

              {/* CTA Buttons */}
              <div
                key={`cta-${current}`}
                className="mt-10 flex flex-wrap gap-4"
                style={{ animation: 'heroBannerFadeSlideUp 0.8s ease-out 0.45s both' }}
              >
                {slide.ctaText && (
                  <a
                    href={slide.ctaLink}
                    className={`inline-flex items-center gap-2 px-8 py-4 text-base font-bold shadow-2xl hover:shadow-lg hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 ${radiusClass(theme.cornerRadius)}`}
                    style={{ backgroundColor: ac, color: '#fff' }}
                  >
                    {slide.ctaText}
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                )}
                {secondaryCtaText && current === 0 && (
                  <a
                    href={secondaryCtaLink}
                    className={`inline-flex items-center gap-2 px-8 py-4 text-base font-semibold border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-200 ${radiusClass(theme.cornerRadius)}`}
                  >
                    {secondaryCtaText}
                  </a>
                )}
              </div>
            </div>

            {/* RIGHT: Glass-morphism Content Cards (desktop) */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="grid grid-cols-2 gap-4">
                {slides.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`group relative overflow-hidden text-left transition-all duration-500 ${radiusClass(theme.cornerRadius === 'none' ? 'md' : theme.cornerRadius)}`}
                    style={{
                      background: i === current
                        ? `linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 100%)`
                        : 'rgba(255,255,255,0.06)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      border: i === current ? `2px solid ${ac}88` : '1px solid rgba(255,255,255,0.12)',
                      transform: i === current ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: i === current ? `0 8px 32px ${ac}22` : 'none',
                    }}
                  >
                    {/* Card image */}
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={s.image}
                        alt={s.headline}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: i === current
                            ? `linear-gradient(to top, ${pc}EE 5%, transparent 70%)`
                            : 'linear-gradient(to top, rgba(0,0,0,0.65) 5%, transparent 70%)',
                        }}
                      />
                      {/* Active pulse dot */}
                      {i === current && (
                        <div
                          className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full animate-pulse"
                          style={{ backgroundColor: ac }}
                        />
                      )}
                    </div>
                    {/* Card text */}
                    <div className="px-4 py-3">
                      <h3 className={`text-sm font-bold leading-snug line-clamp-1 ${i === current ? 'text-white' : 'text-white/60'}`}>
                        {s.headline}
                      </h3>
                      <p className="text-xs text-white/40 mt-1 line-clamp-1">{s.subtitle}</p>
                    </div>
                    {/* Progress bar for active card */}
                    {i === current && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px]">
                        <div
                          className="h-full"
                          style={{
                            backgroundColor: ac,
                            animation: 'heroBannerProgressBar 8s linear',
                          }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ===== BOTTOM NAVIGATION ROW ===== */}
          <div className="flex items-center justify-between mt-16 lg:mt-20">
            {/* Slide counter — bottom-left */}
            <span className="text-sm text-white/40 font-mono tracking-wider">
              <span className="text-white font-semibold" style={{ color: ac }}>
                {String(current + 1).padStart(2, '0')}
              </span>
              {' / '}
              {String(slides.length).padStart(2, '0')}
            </span>

            {/* Dot indicators — center */}
            <div className="flex items-center gap-2.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="h-2.5 rounded-full transition-all duration-500 hover:opacity-80"
                  style={{
                    width: i === current ? '2.5rem' : '0.625rem',
                    backgroundColor: i === current ? ac : 'rgba(255,255,255,0.25)',
                    boxShadow: i === current ? `0 0 12px ${ac}66` : 'none',
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Navigation arrows — bottom-right */}
            <div className="flex items-center gap-3">
              <button
                onClick={goPrev}
                className="h-12 w-12 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 hover:bg-white/5 transition-all duration-200"
                aria-label="Previous slide"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goNext}
                className="h-12 w-12 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-105"
                style={{ backgroundColor: `${ac}33`, border: `1px solid ${ac}55` }}
                aria-label="Next slide"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TRUST BADGES STRIP ===== */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10"
        style={{ backgroundColor: `${pc}EE`, borderTop: `1px solid rgba(255,255,255,0.08)` }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            {displayBadges.map((badge, i) => (
              <span key={i} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white/60 uppercase tracking-wider">
                {i > 0 && (
                  <span className="hidden sm:inline-block h-1 w-1 rounded-full" style={{ backgroundColor: ac }} />
                )}
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ===== CSS ANIMATIONS ===== */}
      <style>{`
        @keyframes heroBannerKenBurns {
          from { transform: scale(1); }
          to { transform: scale(1.1); }
        }
        @keyframes heroBannerFadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroBannerProgressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  )
}
