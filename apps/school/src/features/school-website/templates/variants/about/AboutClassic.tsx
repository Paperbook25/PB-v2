import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

export function AboutClassic({ section, theme }: VariantProps) {
  const body = field(section.content, 'body', '')
  const image = field(section.content, 'image', '')
  const mission = field(section.content, 'mission', '')
  const vision = field(section.content, 'vision', '')
  const title = section.title || 'About Us'

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        <div className="mt-10 grid items-start gap-12 md:grid-cols-5">
          {/* Text */}
          <div className="md:col-span-3">
            {body && (
              <p className="text-lg leading-relaxed text-gray-700">{body}</p>
            )}

            {(mission || vision) && (
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {mission && (
                  <div
                    className={`p-6 ${radiusClass(theme.cornerRadius)} border-l-4`}
                    style={{ borderColor: theme.defaultAccentColor, backgroundColor: `${theme.defaultPrimaryColor}06` }}
                  >
                    <h3 className="font-semibold" style={{ color: theme.defaultPrimaryColor }}>
                      Our Mission
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">{mission}</p>
                  </div>
                )}
                {vision && (
                  <div
                    className={`p-6 ${radiusClass(theme.cornerRadius)} border-l-4`}
                    style={{ borderColor: theme.defaultAccentColor, backgroundColor: `${theme.defaultPrimaryColor}06` }}
                  >
                    <h3 className="font-semibold" style={{ color: theme.defaultPrimaryColor }}>
                      Our Vision
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">{vision}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Image */}
          <div className="md:col-span-2">
            {image ? (
              <img
                src={image}
                alt={title}
                className={`w-full object-cover ${radiusClass(theme.cornerRadius)}`}
              />
            ) : (
              <div
                className={`flex aspect-[4/3] items-center justify-center text-white/60 ${radiusClass(theme.cornerRadius)}`}
                style={{ backgroundColor: theme.defaultPrimaryColor }}
              >
                <span className="text-sm">Image placeholder</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
