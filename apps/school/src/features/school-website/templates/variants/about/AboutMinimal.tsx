import type { VariantProps } from '../../section-variants'
import { spacingClass, field } from '../shared'

export function AboutMinimal({ section, theme }: VariantProps) {
  const body = field(section.content, 'body', '')
  const mission = field(section.content, 'mission', '')
  const vision = field(section.content, 'vision', '')
  const title = section.title || 'About Us'

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
          <p className="mt-6 text-lg leading-relaxed text-gray-600">{body}</p>
        )}

        {(mission || vision) && (
          <div className="mt-10 space-y-6 text-left">
            {mission && (
              <blockquote
                className="border-l-4 pl-4 italic text-gray-700"
                style={{ borderColor: theme.defaultAccentColor }}
              >
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Mission
                </span>
                {mission}
              </blockquote>
            )}
            {vision && (
              <blockquote
                className="border-l-4 pl-4 italic text-gray-700"
                style={{ borderColor: theme.defaultAccentColor }}
              >
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Vision
                </span>
                {vision}
              </blockquote>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
