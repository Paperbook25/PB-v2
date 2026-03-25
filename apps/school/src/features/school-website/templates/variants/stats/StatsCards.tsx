import { useEffect, useRef, useState } from 'react'
import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'
import type { StatsItem } from '../../../types/school-website.types'

/* Simple icon map — renders an SVG icon based on common stat icon names */
function StatIcon({ name, color }: { name: string; color: string }) {
  const lower = (name || '').toLowerCase()
  const cls = 'h-8 w-8'

  if (lower.includes('student') || lower.includes('user') || lower.includes('people')) {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H9m6 0a5.972 5.972 0 00-.786-3.07M9 19.128v-.003c0-1.113.285-2.16.786-3.07m0 0A5.973 5.973 0 0112 15c1.396 0 2.672.476 3.686 1.273M12 12a3 3 0 100-6 3 3 0 000 6z" />
      </svg>
    )
  }
  if (lower.includes('teacher') || lower.includes('faculty')) {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
      </svg>
    )
  }
  if (lower.includes('year') || lower.includes('time') || lower.includes('history')) {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
  if (lower.includes('rate') || lower.includes('percent') || lower.includes('result') || lower.includes('pass')) {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-3.77 1.522m0 0a6.003 6.003 0 01-3.77-1.522" />
      </svg>
    )
  }
  if (lower.includes('award') || lower.includes('trophy') || lower.includes('achieve')) {
    return (
      <svg className={cls} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    )
  }

  // Default: colored dot
  return (
    <div
      className="h-8 w-8 rounded-full flex items-center justify-center"
      style={{ backgroundColor: `${color}18` }}
    >
      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
    </div>
  )
}

export function StatsCards({ section, theme }: VariantProps) {
  const items = field<StatsItem[]>(section.content, 'items', [])
  const title = section.title || 'By the Numbers'
  const subtitle = field(section.content, 'subtitle', '')

  const fallbackItems: StatsItem[] = [
    { label: 'Students', value: '1,200+', icon: 'students' },
    { label: 'Expert Teachers', value: '80+', icon: 'teacher' },
    { label: 'Years of Excellence', value: '25+', icon: 'years' },
    { label: 'Pass Rate', value: '98%', icon: 'rate' },
  ]

  const displayItems = items.length > 0 ? items : fallbackItems
  const pc = theme.defaultPrimaryColor
  const ac = theme.defaultAccentColor

  // Intersection observer for scroll-triggered animation
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Card style variants
  const isGlass = theme.cardStyle === 'glass'
  const isElevated = theme.cardStyle === 'elevated'

  return (
    <section
      ref={sectionRef}
      className={spacingClass(theme.sectionSpacing)}
      style={{ backgroundColor: pc, color: '#fff' }}
    >
      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ backgroundColor: `${ac}20`, color: ac }}
          >
            Our Impact
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-lg text-white/60 max-w-2xl mx-auto">{subtitle}</p>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayItems.map((item, idx) => (
            <div
              key={idx}
              className={`relative p-8 text-center transition-all duration-700 ${radiusClass(theme.cornerRadius)}`}
              style={{
                background: isGlass
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(255,255,255,0.06)',
                backdropFilter: isGlass ? 'blur(12px)' : undefined,
                WebkitBackdropFilter: isGlass ? 'blur(12px)' : undefined,
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: isElevated ? '0 20px 40px rgba(0,0,0,0.15)' : undefined,
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transitionDelay: `${idx * 120}ms`,
              }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div
                  className="h-14 w-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${ac}18` }}
                >
                  <StatIcon name={item.icon || item.label} color={ac} />
                </div>
              </div>

              {/* Number */}
              <p
                className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white"
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
                  transition: `all 0.8s ease-out ${idx * 120 + 200}ms`,
                }}
              >
                {item.value}
              </p>

              {/* Accent underline */}
              <div
                className="mx-auto mt-3 mb-3 h-[3px] rounded-full"
                style={{
                  backgroundColor: ac,
                  width: isVisible ? '2.5rem' : '0',
                  transition: `width 0.6s ease-out ${idx * 120 + 400}ms`,
                }}
              />

              {/* Label */}
              <p className="text-sm font-medium text-white/55 uppercase tracking-wider">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
