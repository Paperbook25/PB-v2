import type { VariantProps } from '../../section-variants'
import { spacingClass, field } from '../shared'

export function CtaBannerMinimal({ section, theme }: VariantProps) {
  const headline = field(section.content, 'headline', section.title || 'Ready to Begin Your Journey?')
  const subtitle = field(section.content, 'subtitle', 'Take the first step towards an exceptional education for your child.')
  const primaryLinkText = field(section.content, 'primaryButtonText', 'Start Application')
  const primaryLinkUrl = field(section.content, 'primaryButtonUrl', '#admissions')
  const secondaryLinkText = field(section.content, 'secondaryButtonText', 'Get in Touch')
  const secondaryLinkUrl = field(section.content, 'secondaryButtonUrl', '#contact')

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2
          className="text-3xl font-bold sm:text-4xl lg:text-5xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {headline}
        </h2>

        {subtitle && (
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
            {subtitle}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <a
            href={primaryLinkUrl}
            className="text-base font-semibold underline underline-offset-4 transition-colors hover:opacity-80"
            style={{ color: theme.defaultPrimaryColor }}
          >
            {primaryLinkText} &rarr;
          </a>
          {secondaryLinkText && (
            <a
              href={secondaryLinkUrl}
              className="text-base font-semibold underline underline-offset-4 transition-colors hover:opacity-80"
              style={{ color: theme.defaultAccentColor }}
            >
              {secondaryLinkText} &rarr;
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
