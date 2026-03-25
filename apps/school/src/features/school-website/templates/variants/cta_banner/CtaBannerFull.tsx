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

  const primaryColor = theme.defaultPrimaryColor
  const accentColor = theme.defaultAccentColor

  // Compute a slightly lighter shade for gradient end by mixing with white
  const lighterPrimary = `${primaryColor}CC`

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: backgroundImage
            ? 'rgba(0,0,0,0.55)'
            : `linear-gradient(135deg, ${primaryColor} 0%, ${lighterPrimary} 50%, ${primaryColor} 100%)`,
        }}
      />

      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Decorative blobs */}
      <div
        className="absolute -left-24 -top-24 h-72 w-72 rounded-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      />
      <div
        className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      />
      <div
        className="absolute right-1/4 top-10 h-32 w-32 rounded-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
      />
      <div
        className="absolute bottom-8 left-1/3 h-20 w-20 rounded-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
          {headline}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/80">
          {subtitle}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Primary CTA */}
          <a
            href={primaryButtonUrl}
            className={`inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:brightness-110 ${radiusClass(theme.cornerRadius)}`}
            style={{ backgroundColor: accentColor }}
          >
            {primaryButtonText}
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>

          {/* Secondary CTA */}
          <a
            href={secondaryButtonUrl}
            className={`inline-flex items-center justify-center border-2 border-white px-8 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:bg-white/10 ${radiusClass(theme.cornerRadius)}`}
          >
            {secondaryButtonText}
          </a>
        </div>
      </div>
    </section>
  )
}
