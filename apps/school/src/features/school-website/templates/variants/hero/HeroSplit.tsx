import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

export function HeroSplit({ section, theme }: VariantProps) {
  const headline = field(section.content, 'headline', 'Welcome to Our Institution')
  const subtitle = field(section.content, 'subtitle', '')
  const bgImage = field(section.content, 'backgroundImage', '')
  const ctaText = field(section.content, 'ctaText', 'Learn More')
  const ctaLink = field(section.content, 'ctaLink', '#')

  return (
    <section className={`${spacingClass(theme.sectionSpacing)}`}>
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-2">
        {/* Text column */}
        <div>
          <h1
            className="text-4xl font-bold leading-tight sm:text-5xl"
            style={{ color: theme.defaultPrimaryColor }}
          >
            {headline}
          </h1>
          {subtitle && (
            <p className="mt-4 text-lg text-gray-600">{subtitle}</p>
          )}
          {ctaText && (
            <a
              href={ctaLink}
              className={`mt-8 inline-block px-8 py-3 text-base font-semibold text-white transition-colors ${radiusClass(theme.cornerRadius)}`}
              style={{ backgroundColor: theme.defaultPrimaryColor }}
            >
              {ctaText}
            </a>
          )}
        </div>

        {/* Image column */}
        <div className={`overflow-hidden ${radiusClass(theme.cornerRadius)}`}>
          {bgImage ? (
            <img
              src={bgImage}
              alt={headline}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="flex aspect-[4/3] items-center justify-center text-white/60"
              style={{ backgroundColor: theme.defaultPrimaryColor }}
            >
              <span className="text-sm">Image placeholder</span>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
