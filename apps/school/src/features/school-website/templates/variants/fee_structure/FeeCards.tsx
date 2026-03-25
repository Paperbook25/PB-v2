import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, radiusClass, field } from '../shared'

interface FeeBreakdown {
  label: string
  amount: string
}

interface FeeCategory {
  category: string
  total: string
  installments: string
  breakdown: FeeBreakdown[]
}

export function FeeCards({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Fee Structure'
  const description = field(section.content, 'description', '')
  const categories = field<FeeCategory[]>(section.content, 'feeCategories', [])
  const scholarshipInfo = field(section.content, 'scholarshipInfo', '')

  const fallbackCategories: FeeCategory[] = [
    {
      category: 'Primary (Class 1-5)',
      total: '₹35,000/yr',
      installments: 'Payable in 3 installments',
      breakdown: [
        { label: 'Tuition Fee', amount: '₹25,000' },
        { label: 'Activity Fee', amount: '₹5,000' },
        { label: 'Lab & Library', amount: '₹3,000' },
        { label: 'Exam Fee', amount: '₹2,000' },
      ],
    },
    {
      category: 'Secondary (Class 6-10)',
      total: '₹45,000/yr',
      installments: 'Payable in 4 installments',
      breakdown: [
        { label: 'Tuition Fee', amount: '₹32,000' },
        { label: 'Activity Fee', amount: '₹5,000' },
        { label: 'Lab & Library', amount: '₹5,000' },
        { label: 'Exam Fee', amount: '₹3,000' },
      ],
    },
    {
      category: 'Sr. Secondary (Class 11-12)',
      total: '₹55,000/yr',
      installments: 'Payable in 4 installments',
      breakdown: [
        { label: 'Tuition Fee', amount: '₹38,000' },
        { label: 'Activity Fee', amount: '₹5,000' },
        { label: 'Lab & Library', amount: '₹7,000' },
        { label: 'Exam Fee', amount: '₹5,000' },
      ],
    },
  ]

  const displayCategories = categories.length > 0 ? categories : fallbackCategories

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

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayCategories.map((cat, idx) => (
            <div
              key={idx}
              className={`flex flex-col overflow-hidden ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
            >
              {/* Card header */}
              <div
                className="px-5 py-4 text-white"
                style={{ backgroundColor: theme.defaultPrimaryColor }}
              >
                <h3 className="text-lg font-semibold">{cat.category}</h3>
                <p className="mt-1 text-2xl font-bold">{cat.total}</p>
              </div>

              {/* Breakdown */}
              <div className="flex-1 p-5">
                <div className="space-y-2">
                  {cat.breakdown.map((item, bIdx) => (
                    <div key={bIdx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium text-gray-900">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 px-5 py-3">
                <p className="text-xs text-gray-500">{cat.installments}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Scholarship info */}
        {(scholarshipInfo || true) && (
          <div
            className={`mt-10 p-6 text-center ${radiusClass(theme.cornerRadius)}`}
            style={{ backgroundColor: `${theme.defaultAccentColor}10` }}
          >
            <h4 className="font-semibold text-gray-900">Scholarships Available</h4>
            <p className="mt-2 text-sm text-gray-600">
              {scholarshipInfo || 'Merit-based scholarships and fee concessions are available. Contact the administration office for details.'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
