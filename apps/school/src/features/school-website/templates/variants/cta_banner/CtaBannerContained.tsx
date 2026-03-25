import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

export function CtaBannerContained({ section, theme }: VariantProps) {
  const headline = field(section.content, 'headline', section.title || 'Ready to Begin Your Journey?')
  const subtitle = field(section.content, 'subtitle', 'Take the first step towards an exceptional education.')
  const primaryButtonText = field(section.content, 'primaryButtonText', 'Apply Now')
  const primaryButtonUrl = field(section.content, 'primaryButtonUrl', '#admissions')
  const secondaryButtonText = field(section.content, 'secondaryButtonText', 'Learn More')
  const secondaryButtonUrl = field(section.content, 'secondaryButtonUrl', '#about')

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-5xl px-6">
        <div
          className={`flex flex-col items-center justify-between gap-6 px-8 py-10 sm:flex-row sm:px-12 ${radiusClass(theme.cornerRadius)}`}
          style={{ backgroundColor: theme.defaultPrimaryColor }}
        >
          {/* Text left */}
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              {headline}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-white/75">{subtitle}</p>
            )}
          </div>

          {/* Buttons right */}
          <div className="flex shrink-0 items-center gap-3">
            <a
              href={primaryButtonUrl}
              className={`inline-flex items-center justify-center bg-white px-6 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 ${radiusClass(theme.cornerRadius)}`}
              style={{ color: theme.defaultPrimaryColor }}
            >
              {primaryButtonText}
            </a>
            {secondaryButtonText && (
              <a
                href={secondaryButtonUrl}
                className={`inline-flex items-center justify-center border border-white/40 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 ${radiusClass(theme.cornerRadius)}`}
              >
                {secondaryButtonText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
