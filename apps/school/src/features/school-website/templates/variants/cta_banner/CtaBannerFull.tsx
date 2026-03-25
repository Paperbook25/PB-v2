import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

export function CtaBannerFull({ section, theme }: VariantProps) {
  const headline = field(section.content, 'headline', section.title || 'Ready to Begin Your Journey?')
  const subtitle = field(section.content, 'subtitle', 'Take the first step towards an exceptional education for your child.')
  const primaryButtonText = field(section.content, 'primaryButtonText', 'Apply Now')
  const primaryButtonUrl = field(section.content, 'primaryButtonUrl', '#admissions')
  const secondaryButtonText = field(section.content, 'secondaryButtonText', 'Contact Us')
  const secondaryButtonUrl = field(section.content, 'secondaryButtonUrl', '#contact')
  const backgroundImage = field(section.content, 'backgroundImage', '')

  return (
    <section
      className={`relative overflow-hidden ${spacingClass(theme.sectionSpacing)}`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Gradient overlay — if no image, use primary color gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: backgroundImage
            ? 'rgba(0,0,0,0.55)'
            : `linear-gradient(135deg, ${theme.defaultPrimaryColor}, ${theme.defaultAccentColor})`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
          {headline}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
          {subtitle}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={primaryButtonUrl}
            className={`inline-flex items-center justify-center bg-white px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90 ${radiusClass(theme.cornerRadius)}`}
            style={{ color: theme.defaultPrimaryColor }}
          >
            {primaryButtonText}
          </a>
          <a
            href={secondaryButtonUrl}
            className={`inline-flex items-center justify-center border-2 border-white px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 ${radiusClass(theme.cornerRadius)}`}
          >
            {secondaryButtonText}
          </a>
        </div>
      </div>
    </section>
  )
}
