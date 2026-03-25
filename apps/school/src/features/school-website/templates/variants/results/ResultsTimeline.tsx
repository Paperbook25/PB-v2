import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface Topper {
  name: string
  photo: string
  score: string
}

interface YearResult {
  year: string
  highlights: string[]
  toppers: Topper[]
}

export function ResultsTimeline({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Results Over the Years'
  const description = field(section.content, 'description', '')
  const yearResults = field<YearResult[]>(section.content, 'yearResults', [])

  const fallbackYears: YearResult[] = [
    {
      year: '2024',
      highlights: ['98.5% pass rate', '45 students scored above 95%', '12 board toppers'],
      toppers: [
        { name: 'Student A', photo: '', score: '99.2%' },
        { name: 'Student B', photo: '', score: '98.8%' },
      ],
    },
    {
      year: '2023',
      highlights: ['97.8% pass rate', '38 students scored above 95%', '10 board toppers'],
      toppers: [
        { name: 'Student C', photo: '', score: '98.5%' },
        { name: 'Student D', photo: '', score: '97.9%' },
      ],
    },
    {
      year: '2022',
      highlights: ['96.5% pass rate', '30 students scored above 95%'],
      toppers: [
        { name: 'Student E', photo: '', score: '97.2%' },
      ],
    },
  ]

  const displayYears = yearResults.length > 0 ? yearResults : fallbackYears

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-4xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {sectionTitle}
        </h2>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">{description}</p>
        )}

        {/* Timeline */}
        <div className="relative mt-12">
          {/* Vertical line */}
          <div
            className="absolute left-6 top-0 h-full w-0.5 sm:left-1/2 sm:-translate-x-px"
            style={{ backgroundColor: `${theme.defaultPrimaryColor}30` }}
          />

          <div className="space-y-12">
            {displayYears.map((yr, idx) => (
              <div key={idx} className="relative">
                {/* Year node */}
                <div
                  className="absolute left-6 z-10 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full text-sm font-bold text-white sm:left-1/2"
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  {yr.year.slice(-2)}
                </div>

                {/* Content */}
                <div className={`ml-16 sm:ml-0 ${idx % 2 === 0 ? 'sm:mr-[55%]' : 'sm:ml-[55%]'}`}>
                  <div className={`p-5 bg-white shadow-sm border border-gray-100 ${radiusClass(theme.cornerRadius)}`}>
                    <h3 className="text-lg font-bold" style={{ color: theme.defaultPrimaryColor }}>
                      {yr.year}
                    </h3>
                    <ul className="mt-3 space-y-1">
                      {yr.highlights.map((h, hIdx) => (
                        <li key={hIdx} className="flex items-start gap-2 text-sm text-gray-600">
                          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {h}
                        </li>
                      ))}
                    </ul>

                    {yr.toppers.length > 0 && (
                      <div className="mt-4 flex gap-3">
                        {yr.toppers.map((t, tIdx) => (
                          <div key={tIdx} className="flex items-center gap-2">
                            {t.photo ? (
                              <img src={t.photo} alt={t.name} className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <div
                                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                                style={{ backgroundColor: theme.defaultAccentColor }}
                              >
                                {t.name.charAt(0)}
                              </div>
                            )}
                            <div className="text-xs">
                              <p className="font-medium text-gray-900">{t.name}</p>
                              <p className="text-gray-500">{t.score}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
