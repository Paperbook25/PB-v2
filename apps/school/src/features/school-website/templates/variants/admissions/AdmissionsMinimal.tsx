import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

export function AdmissionsMinimal({ section, theme }: VariantProps) {
  const body = field(section.content, 'body', 'Admissions are open. Contact us to learn more.')
  const ctaText = field(section.content, 'ctaText', 'Apply Now')
  const ctaLink = field(section.content, 'ctaLink', '#')
  const title = section.title || 'Admissions'

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2
          className="text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>
        {body && (
          <p className="mt-4 text-lg text-gray-600">{body}</p>
        )}
        {ctaText && (
          <a
            href={ctaLink}
            className={`mt-6 inline-block border-2 px-8 py-2.5 text-sm font-semibold transition-colors ${radiusClass(theme.cornerRadius)}`}
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
