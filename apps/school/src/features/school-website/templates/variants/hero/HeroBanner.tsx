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
  // Support new slides array format OR legacy single-slide format
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
      // Add defaults if only 1 legacy slide
      ...DEFAULT_SLIDES.slice(1),
    ]

  const secondaryCtaText = field(section.content, 'secondaryCtaText', '')
  const secondaryCtaLink = field(section.content, 'secondaryCtaLink', '#')

  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')

  const goTo = useCallback((idx: number) => {
    setDirection(idx > current ? 'next' : 'prev')
    setCurrent(idx)
  }, [current])

  const goNext = useCallback(() => {
    setDirection('next')
    setCurrent(prev => (prev + 1) % slides.length)
  }, [slides.length])

  const goPrev = useCallback(() => {
    setDirection('prev')
    setCurrent(prev => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(goNext, 6000)
    return () => clearInterval(timer)
  }, [goNext, slides.length])

  const slide = slides[current]

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-gray-900">
      {/* ===== BACKGROUND SLIDES ===== */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-all duration-[1200ms] ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            transform: i === current ? 'scale(1)' : 'scale(1.1)',
          }}
        >
          <img
            src={s.image}
            alt=""
            className="h-full w-full object-cover"
            style={{
              transform: i === current ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 10s ease-out',
            }}
          />
        </div>
      ))}

      {/* ===== OVERLAY ===== */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${theme.defaultPrimaryColor}99 0%, ${theme.defaultPrimaryColor}DD 50%, ${theme.defaultPrimaryColor}F0 100%)`,
        }}
      />

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="relative z-10 flex min-h-[90vh] items-center">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* LEFT: Text Content */}
            <div className="text-white">
              {/* Slide badge */}
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-8"
                style={{ backgroundColor: `${theme.defaultAccentColor}30`, color: theme.defaultAccentColor }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.defaultAccentColor }} />
                {current === 0 ? 'Welcome' : `${current + 1} of ${slides.length}`}
              </div>

              {/* Headline — animates on slide change */}
              <h1
                key={`h-${current}`}
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight"
                style={{ animation: 'fadeSlideUp 0.8s ease-out' }}
              >
                {slide.headline}
              </h1>

              {/* Subtitle */}
              <p
                key={`s-${current}`}
                className="mt-6 text-lg sm:text-xl text-white/80 leading-relaxed max-w-xl font-light"
                style={{ animation: 'fadeSlideUp 0.8s ease-out 0.15s both' }}
              >
                {slide.subtitle}
              </p>

              {/* CTA Buttons */}
              <div
                className="mt-10 flex flex-wrap gap-4"
                style={{ animation: 'fadeSlideUp 0.8s ease-out 0.3s both' }}
              >
                {slide.ctaText && (
                  <a
                    href={slide.ctaLink}
                    className={`inline-flex items-center gap-2 px-8 py-4 text-base font-bold shadow-2xl hover:shadow-lg hover:scale-[1.03] transition-all ${radiusClass(theme.cornerRadius)}`}
                    style={{ backgroundColor: theme.defaultAccentColor, color: '#fff' }}
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
                    className={`inline-flex items-center gap-2 px-8 py-4 text-base font-semibold border-2 border-white/40 text-white hover:bg-white/10 transition-all ${radiusClass(theme.cornerRadius)}`}
                  >
                    {secondaryCtaText}
                  </a>
                )}
              </div>
            </div>

            {/* RIGHT: Content Cards Carousel */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {slides.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`group relative overflow-hidden text-left transition-all duration-500 ${radiusClass(theme.cornerRadius === 'none' ? 'md' : theme.cornerRadius)}`}
                    style={{
                      border: i === current ? `2px solid ${theme.defaultAccentColor}` : '2px solid rgba(255,255,255,0.15)',
                      transform: i === current ? 'scale(1.03)' : 'scale(1)',
                    }}
                  >
                    {/* Card image */}
                    <div className="relative h-32 overflow-hidden">
                      <img
                        src={s.image}
                        alt={s.headline}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background: i === current
                            ? `linear-gradient(to top, ${theme.defaultPrimaryColor}EE 10%, transparent 80%)`
                            : 'linear-gradient(to top, rgba(0,0,0,0.7) 10%, transparent 80%)',
                        }}
                      />
                      {/* Active indicator */}
                      {i === current && (
                        <div
                          className="absolute top-3 right-3 h-2.5 w-2.5 rounded-full animate-pulse"
                          style={{ backgroundColor: theme.defaultAccentColor }}
                        />
                      )}
                    </div>
                    {/* Card text */}
                    <div className="px-4 py-3 bg-white/5 backdrop-blur-sm">
                      <h3 className={`text-sm font-bold leading-snug line-clamp-1 ${i === current ? 'text-white' : 'text-white/70'}`}>
                        {s.headline}
                      </h3>
                      <p className="text-xs text-white/50 mt-1 line-clamp-1">{s.subtitle}</p>
                    </div>
                    {/* Progress bar for active card */}
                    {i === current && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5">
                        <div
                          className="h-full"
                          style={{
                            backgroundColor: theme.defaultAccentColor,
                            animation: 'progressBar 6s linear',
                          }}
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ===== MOBILE SLIDE INDICATORS + ARROWS ===== */}
          <div className="flex items-center justify-between mt-12 lg:mt-16">
            {/* Prev/Next arrows */}
            <div className="flex items-center gap-3">
              <button
                onClick={goPrev}
                className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 transition-colors"
                aria-label="Previous slide"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goNext}
                className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 transition-colors"
                aria-label="Next slide"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: i === current ? '2rem' : '0.5rem',
                    backgroundColor: i === current ? theme.defaultAccentColor : 'rgba(255,255,255,0.3)',
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Slide counter */}
            <span className="text-sm text-white/40 font-mono">
              {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* ===== CSS ANIMATIONS ===== */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  )
}
