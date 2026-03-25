import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field, tint } from '../shared'

interface FeeRow {
  category: string
  tuition: string
  other: string
  total: string
  installments: string
}

export function FeeTable({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Fee Structure'
  const description = field(section.content, 'description', '')
  const fees = field<FeeRow[]>(section.content, 'fees', [])
  const scholarshipInfo = field(section.content, 'scholarshipInfo', '')
  const paymentModes = field<string[]>(section.content, 'paymentModes', [])

  const fallbackFees: FeeRow[] = [
    { category: 'Pre-Primary (Nursery-KG)', tuition: '₹25,000', other: '₹5,000', total: '₹30,000', installments: '3' },
    { category: 'Primary (Class 1-5)', tuition: '₹30,000', other: '₹5,000', total: '₹35,000', installments: '3' },
    { category: 'Middle (Class 6-8)', tuition: '₹35,000', other: '₹7,000', total: '₹42,000', installments: '4' },
    { category: 'Secondary (Class 9-10)', tuition: '₹40,000', other: '₹8,000', total: '₹48,000', installments: '4' },
    { category: 'Sr. Secondary (Class 11-12)', tuition: '₹45,000', other: '₹10,000', total: '₹55,000', installments: '4' },
  ]

  const fallbackPaymentModes = ['Cash', 'Cheque', 'Online Transfer', 'UPI', 'Card']
  const fallbackScholarship = 'Merit-based scholarships available for students scoring above 90%. Up to 50% fee waiver for economically weaker sections.'

  const displayFees = fees.length > 0 ? fees : fallbackFees
  const displayModes = paymentModes.length > 0 ? paymentModes : fallbackPaymentModes
  const displayScholarship = scholarshipInfo || fallbackScholarship

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-5xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {sectionTitle}
        </h2>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">{description}</p>
        )}

        {/* Fee table */}
        <div
          className={`mt-10 overflow-hidden border ${radiusClass(theme.cornerRadius)}`}
          style={{ borderColor: tint(theme.defaultPrimaryColor, 0.15) }}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ backgroundColor: theme.defaultPrimaryColor }}>
                  <th className="px-5 py-3.5 font-semibold text-white">Category</th>
                  <th className="px-5 py-3.5 font-semibold text-white">Tuition</th>
                  <th className="px-5 py-3.5 font-semibold text-white">Other Fees</th>
                  <th className="px-5 py-3.5 font-semibold text-white">Total</th>
                  <th className="px-5 py-3.5 font-semibold text-white">Installments</th>
                </tr>
              </thead>
              <tbody>
                {displayFees.map((row, idx) => (
                  <tr
                    key={idx}
                    className="bg-white"
                    style={idx % 2 !== 0 ? { backgroundColor: tint(theme.defaultPrimaryColor, 0.03) } : undefined}
                  >
                    <td className="px-5 py-3 font-medium text-gray-900">{row.category}</td>
                    <td className="px-5 py-3 text-gray-600">{row.tuition}</td>
                    <td className="px-5 py-3 text-gray-600">{row.other}</td>
                    <td className="px-5 py-3 font-semibold" style={{ color: theme.defaultPrimaryColor }}>
                      {row.total}
                    </td>
                    <td className="px-5 py-3 text-gray-600">{row.installments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scholarship callout */}
        {displayScholarship && (
          <div
            className={`mt-8 border-l-4 p-5 ${radiusClass(theme.cornerRadius)}`}
            style={{
              borderLeftColor: theme.defaultAccentColor,
              backgroundColor: tint(theme.defaultAccentColor, 0.06),
            }}
          >
            <h4 className="font-semibold text-gray-900">Scholarships &amp; Financial Aid</h4>
            <p className="mt-1 text-sm text-gray-600">{displayScholarship}</p>
          </div>
        )}

        {/* Payment modes */}
        {displayModes.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-500">Accepted Payment Modes</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {displayModes.map((mode) => (
                <span
                  key={mode}
                  className={`px-3 py-1 text-xs font-medium ${radiusClass(theme.cornerRadius)}`}
                  style={{
                    backgroundColor: tint(theme.defaultPrimaryColor, 0.08),
                    color: theme.defaultPrimaryColor,
                  }}
                >
                  {mode}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
