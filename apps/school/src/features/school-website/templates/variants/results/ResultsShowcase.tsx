import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface Topper {
  name: string
  photo: string
  score: string
  rank: string
  exam: string
}

interface Highlight {
  label: string
  value: string
}

export function ResultsShowcase({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Our Results'
  const highlights = field<Highlight[]>(section.content, 'highlights', [])
  const toppers = field<Topper[]>(section.content, 'toppers', [])

  const fallbackHighlights: Highlight[] = [
    { label: 'Pass Rate', value: '98.5%' },
    { label: 'Distinction', value: '45%' },
    { label: 'Top Selections', value: '120+' },
  ]

  const fallbackToppers: Topper[] = [
    { name: 'Student 1', photo: '', score: '99.2%', rank: '#1', exam: 'Board Exam 2024' },
    { name: 'Student 2', photo: '', score: '98.8%', rank: '#2', exam: 'Board Exam 2024' },
    { name: 'Student 3', photo: '', score: '98.5%', rank: '#3', exam: 'Board Exam 2024' },
    { name: 'Student 4', photo: '', score: '97.9%', rank: '#4', exam: 'Board Exam 2024' },
  ]

  const displayHighlights = highlights.length > 0 ? highlights : fallbackHighlights
  const displayToppers = toppers.length > 0 ? toppers : fallbackToppers

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      {/* Hero stats banner */}
      <div
        className="py-16"
        style={{ backgroundColor: theme.defaultPrimaryColor }}
      >
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{sectionTitle}</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-12">
            {displayHighlights.map((h, idx) => (
              <div key={idx} className="text-center">
                <p className="text-5xl font-extrabold text-white">{h.value}</p>
                <p className="mt-2 text-sm font-medium text-white/70">{h.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toppers scrollable row */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <h3 className="text-xl font-semibold text-gray-900">Our Toppers</h3>
        <div className="mt-6 flex gap-6 overflow-x-auto pb-4">
          {displayToppers.map((topper, idx) => (
            <div
              key={idx}
              className={`flex-shrink-0 w-56 overflow-hidden bg-white shadow-md ${radiusClass(theme.cornerRadius)}`}
            >
              {topper.photo ? (
                <img src={topper.photo} alt={topper.name} className="h-56 w-full object-cover" />
              ) : (
                <div
                  className="flex h-56 items-center justify-center text-3xl font-bold text-white/40"
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  {topper.name.charAt(0)}
                </div>
              )}
              <div className="p-4">
                <p className="font-semibold text-gray-900">{topper.name}</p>
                <p className="text-sm text-gray-500">{topper.exam}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span
                    className="text-lg font-bold"
                    style={{ color: theme.defaultAccentColor }}
                  >
                    {topper.score}
                  </span>
                  <span className="text-sm font-medium text-gray-400">{topper.rank}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
