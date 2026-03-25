import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

export function HeroBanner({ section, theme }: VariantProps) {
  const headline = field(section.content, 'headline', 'Welcome to Our Institution')
  const subtitle = field(section.content, 'subtitle', '')
  const bgImage = field(section.content, 'backgroundImage', '')
  const ctaText = field(section.content, 'ctaText', 'Learn More')
  const ctaLink = field(section.content, 'ctaLink', '#')

  return (
    <section
      className={`relative flex min-h-[70vh] items-center justify-center overflow-hidden ${spacingClass(theme.sectionSpacing)}`}
    >
      {/* Background image */}
      {bgImage ? (
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center text-white">
        <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
          {headline}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85 sm:text-xl">
            {subtitle}
          </p>
        )}
        {ctaText && (
          <a
            href={ctaLink}
            className={`mt-8 inline-block px-8 py-3 text-base font-semibold transition-colors ${radiusClass(theme.cornerRadius)}`}
            style={{ backgroundColor: theme.defaultAccentColor, color: '#fff' }}
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  )
}
