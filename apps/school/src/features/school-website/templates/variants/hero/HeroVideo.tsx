import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

export function HeroVideo({ section, theme }: VariantProps) {
  const headline = field(section.content, 'headline', 'Welcome to Our Institution')
  const subtitle = field(section.content, 'subtitle', '')
  const bgImage = field(section.content, 'backgroundImage', '')
  const ctaText = field(section.content, 'ctaText', 'Learn More')
  const ctaLink = field(section.content, 'ctaLink', '#')

  // If bgImage looks like a YouTube URL, extract the embed ID
  const youtubeMatch = bgImage.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  )
  const youtubeId = youtubeMatch?.[1]

  return (
    <section
      className={`relative flex min-h-[80vh] items-center justify-center overflow-hidden ${spacingClass(theme.sectionSpacing)}`}
    >
      {/* Video / image background */}
      {youtubeId ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&showinfo=0`}
          className="pointer-events-none absolute inset-0 h-[120%] w-[120%] -translate-x-[10%] -translate-y-[10%] object-cover"
          title="Background video"
          allow="autoplay"
          aria-hidden="true"
        />
      ) : bgImage ? (
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content — frosted glass card */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <div className="rounded-2xl bg-white/10 px-8 py-12 backdrop-blur-lg">
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
            {headline}
          </h1>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">{subtitle}</p>
          )}
          {ctaText && (
            <a
              href={ctaLink}
              className={`mt-8 inline-block px-8 py-3 text-base font-semibold text-white transition-colors ${radiusClass(theme.cornerRadius)}`}
              style={{ backgroundColor: theme.defaultAccentColor }}
            >
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}
