import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, cardClass, field } from '../shared'

export function AboutSplit({ section, theme }: VariantProps) {
  const body = field(section.content, 'body', '')
  const image = field(section.content, 'image', '')
  const mission = field(section.content, 'mission', '')
  const vision = field(section.content, 'vision', '')
  const title = section.title || 'About Us'

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Full-bleed image */}
          <div className={`overflow-hidden ${radiusClass(theme.cornerRadius)}`}>
            {image ? (
              <img src={image} alt={title} className="h-full w-full object-cover" />
            ) : (
              <div
                className="flex aspect-[4/3] items-center justify-center text-white/60"
                style={{ backgroundColor: theme.defaultPrimaryColor }}
              >
                <span className="text-sm">Image placeholder</span>
              </div>
            )}
          </div>

          {/* Text + mission/vision cards */}
          <div>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ color: theme.defaultPrimaryColor }}
            >
              {title}
            </h2>
            {body && (
              <p className="mt-4 text-lg leading-relaxed text-gray-700">{body}</p>
            )}

            <div className="mt-8 space-y-4">
              {mission && (
                <div className={`p-5 ${cardClass(theme.cardStyle, theme.cornerRadius)}`}>
                  <h3
                    className="text-sm font-semibold uppercase tracking-wider"
                    style={{ color: theme.defaultAccentColor }}
                  >
                    Mission
                  </h3>
                  <p className="mt-1 text-gray-600">{mission}</p>
                </div>
              )}
              {vision && (
                <div className={`p-5 ${cardClass(theme.cardStyle, theme.cornerRadius)}`}>
                  <h3
                    className="text-sm font-semibold uppercase tracking-wider"
                    style={{ color: theme.defaultAccentColor }}
                  >
                    Vision
                  </h3>
                  <p className="mt-1 text-gray-600">{vision}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
