import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, radiusClass, field } from '../shared'

interface Topper {
  name: string
  photo: string
  score: string
  rank: string
  exam: string
}

interface Stat {
  label: string
  value: string
}

export function ResultsGrid({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Academic Results'
  const description = field(section.content, 'description', '')
  const stats = field<Stat[]>(section.content, 'highlights', [])
  const toppers = field<Topper[]>(section.content, 'toppers', [])

  const fallbackStats: Stat[] = [
    { label: 'Pass Rate', value: '98.5%' },
    { label: 'Distinctions', value: '150+' },
    { label: 'Board Toppers', value: '12' },
    { label: 'Avg Score', value: '82%' },
  ]

  const fallbackToppers: Topper[] = Array.from({ length: 6 }, (_, i) => ({
    name: `Topper ${i + 1}`,
    photo: '',
    score: `${99 - i}%`,
    rank: `#${i + 1}`,
    exam: 'Board Exam 2024',
  }))

  const displayStats = stats.length > 0 ? stats : fallbackStats
  const displayToppers = toppers.length > 0 ? toppers : fallbackToppers

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

        {/* Stats strip */}
        <div
          className={`mt-10 grid grid-cols-2 gap-4 p-6 sm:grid-cols-4 ${radiusClass(theme.cornerRadius)}`}
          style={{ backgroundColor: `${theme.defaultPrimaryColor}10` }}
        >
          {displayStats.map((stat, idx) => (
            <div key={idx} className="text-center">
              <p className="text-3xl font-bold" style={{ color: theme.defaultPrimaryColor }}>
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Topper cards grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayToppers.map((topper, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 p-4 ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
            >
              {topper.photo ? (
                <img
                  src={topper.photo}
                  alt={topper.name}
                  className={`h-20 w-20 flex-shrink-0 object-cover ${radiusClass(theme.cornerRadius)}`}
                />
              ) : (
                <div
                  className={`flex h-20 w-20 flex-shrink-0 items-center justify-center text-xl font-bold text-white/60 ${radiusClass(theme.cornerRadius)}`}
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  {topper.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{topper.name}</p>
                <p className="text-xs text-gray-500">{topper.exam}</p>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-lg font-bold" style={{ color: theme.defaultAccentColor }}>
                    {topper.score}
                  </span>
                  <span className="text-sm text-gray-400">{topper.rank}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
