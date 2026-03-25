import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, radiusClass, field, tint } from '../shared'

interface Leader {
  name: string
  designation: string
  photo: string
  message: string
}

export function LeadershipFeatured({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Our Leadership'
  const description = field(section.content, 'description', '')
  const leaders = field<Leader[]>(section.content, 'leaders', [])

  const fallbackLeaders: Leader[] = [
    {
      name: 'Dr. Rajesh Kumar',
      designation: 'Chairman',
      photo: '',
      message: 'Our institution has always strived to provide holistic education that nurtures the mind, body, and spirit. We believe in empowering every student to reach their full potential and become responsible citizens of tomorrow.',
    },
    {
      name: 'Mrs. Priya Sharma',
      designation: 'Principal',
      photo: '',
      message: 'We are committed to academic excellence and character building through innovative teaching methods.',
    },
    {
      name: 'Mr. Anil Verma',
      designation: 'Vice Principal',
      photo: '',
      message: 'Student well-being and a nurturing environment are at the core of everything we do.',
    },
  ]

  const displayLeaders = leaders.length > 0 ? leaders : fallbackLeaders
  const primary = displayLeaders[0]
  const others = displayLeaders.slice(1)

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {sectionTitle}
        </h2>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">{description}</p>
        )}

        {/* Featured leader */}
        {primary && (
          <div
            className={`mt-10 flex flex-col gap-8 p-8 md:flex-row md:items-center ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
            style={{ borderTop: `3px solid ${theme.defaultPrimaryColor}` }}
          >
            {/* Photo */}
            <div className="flex-shrink-0">
              {primary.photo ? (
                <img
                  src={primary.photo}
                  alt={primary.name}
                  className={`h-64 w-64 object-cover ${radiusClass(theme.cornerRadius)}`}
                />
              ) : (
                <div
                  className={`flex h-64 w-64 items-center justify-center text-5xl font-bold text-white/50 ${radiusClass(theme.cornerRadius)}`}
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  {primary.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Message */}
            <div className="flex-1">
              <blockquote className="text-lg leading-relaxed text-gray-700 italic">
                &ldquo;{primary.message}&rdquo;
              </blockquote>
              <div className="mt-6">
                <p className="text-lg font-semibold" style={{ color: theme.defaultPrimaryColor }}>{primary.name}</p>
                <p className="text-sm" style={{ color: theme.defaultAccentColor }}>
                  {primary.designation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Other leaders */}
        {others.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((leader, idx) => (
              <div
                key={idx}
                className={`p-6 ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
              >
                <div className="flex items-center gap-4">
                  {leader.photo ? (
                    <img
                      src={leader.photo}
                      alt={leader.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-white/60"
                      style={{ backgroundColor: theme.defaultPrimaryColor }}
                    >
                      {leader.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold" style={{ color: theme.defaultPrimaryColor }}>{leader.name}</p>
                    <p className="text-sm" style={{ color: theme.defaultAccentColor }}>
                      {leader.designation}
                    </p>
                  </div>
                </div>
                {leader.message && (
                  <p className="mt-4 text-sm text-gray-600 line-clamp-4">
                    &ldquo;{leader.message}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
