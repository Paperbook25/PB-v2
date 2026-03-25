import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

export function HeroMinimal({ section, theme }: VariantProps) {
  const headline = field(section.content, 'headline', 'Welcome to Our Institution')
  const subtitle = field(section.content, 'subtitle', '')
  const ctaText = field(section.content, 'ctaText', 'Learn More')
  const ctaLink = field(section.content, 'ctaLink', '#')

  return (
    <section
      className={`${spacingClass(theme.sectionSpacing)}`}
      style={{ backgroundColor: `${theme.defaultPrimaryColor}08` }}
    >
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h1
          className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {headline}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 sm:text-xl">
            {subtitle}
          </p>
        )}
        {ctaText && (
          <a
            href={ctaLink}
            className={`mt-8 inline-block border-2 px-8 py-3 text-base font-semibold transition-colors ${radiusClass(theme.cornerRadius)}`}
            style={{
              borderColor: theme.defaultPrimaryColor,
              color: theme.defaultPrimaryColor,
            }}
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  )
}
