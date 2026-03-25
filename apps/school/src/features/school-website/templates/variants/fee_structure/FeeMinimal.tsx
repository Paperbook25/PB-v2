import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface FeeRow {
  category: string
  tuition: string
  other: string
  total: string
}

export function FeeMinimal({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Fee Structure'
  const description = field(section.content, 'description', '')
  const fees = field<FeeRow[]>(section.content, 'fees', [])
  const scholarshipInfo = field(section.content, 'scholarshipInfo', '')

  const fallbackFees: FeeRow[] = [
    { category: 'Pre-Primary', tuition: '₹25,000', other: '₹5,000', total: '₹30,000' },
    { category: 'Primary (1-5)', tuition: '₹30,000', other: '₹5,000', total: '₹35,000' },
    { category: 'Middle (6-8)', tuition: '₹35,000', other: '₹7,000', total: '₹42,000' },
    { category: 'Secondary (9-10)', tuition: '₹40,000', other: '₹8,000', total: '₹48,000' },
    { category: 'Sr. Secondary (11-12)', tuition: '₹45,000', other: '₹10,000', total: '₹55,000' },
  ]

  const displayFees = fees.length > 0 ? fees : fallbackFees
  const displayScholarship = scholarshipInfo || 'Merit-based scholarships available for students scoring above 90%.'

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {sectionTitle}
        </h2>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">{description}</p>
        )}

        {/* Compact table */}
        <div className="mt-10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="pb-3 text-left font-semibold text-gray-900">Category</th>
                <th className="pb-3 text-right font-semibold text-gray-900">Tuition</th>
                <th className="pb-3 text-right font-semibold text-gray-900">Other</th>
                <th className="pb-3 text-right font-semibold text-gray-900">Total</th>
              </tr>
            </thead>
            <tbody>
              {displayFees.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-3 text-gray-700">{row.category}</td>
                  <td className="py-3 text-right text-gray-600">{row.tuition}</td>
                  <td className="py-3 text-right text-gray-600">{row.other}</td>
                  <td
                    className="py-3 text-right font-semibold"
                    style={{ color: theme.defaultPrimaryColor }}
                  >
                    {row.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Scholarship banner */}
        <div
          className={`mt-8 flex items-start gap-3 p-4 ${radiusClass(theme.cornerRadius)}`}
          style={{ backgroundColor: theme.defaultAccentColor, color: '#fff' }}
        >
          <svg className="mt-0.5 h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-sm font-medium">{displayScholarship}</p>
        </div>
      </div>
    </section>
  )
}
