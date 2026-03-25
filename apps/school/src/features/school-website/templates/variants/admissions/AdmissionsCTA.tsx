import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

export function AdmissionsCTA({ section, theme }: VariantProps) {
  const body = field(section.content, 'body', 'Admissions are now open for the upcoming academic year.')
  const ctaText = field(section.content, 'ctaText', 'Apply Now')
  const ctaLink = field(section.content, 'ctaLink', '#')
  const title = section.title || 'Admissions Open'

  return (
    <section
      className={spacingClass(theme.sectionSpacing)}
      style={{ backgroundColor: theme.defaultPrimaryColor }}
    >
      <div className="mx-auto max-w-4xl px-6 text-center text-white">
        <h2 className="text-3xl font-bold sm:text-4xl">{title}</h2>
        {body && (
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">{body}</p>
        )}
        {ctaText && (
          <a
            href={ctaLink}
            className={`mt-8 inline-block px-10 py-3 text-base font-semibold transition-colors ${radiusClass(theme.cornerRadius)}`}
            style={{ backgroundColor: theme.defaultAccentColor, color: '#fff' }}
          >
            {ctaText}
          </a>
        )}
      </div>
    </section>
  )
}
