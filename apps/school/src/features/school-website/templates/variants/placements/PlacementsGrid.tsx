import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, radiusClass, field } from '../shared'

interface Stat {
  label: string
  value: string
}

interface Company {
  name: string
  logo: string
}

export function PlacementsGrid({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Placements'
  const description = field(section.content, 'description', '')
  const stats = field<Stat[]>(section.content, 'stats', [])
  const companies = field<Company[]>(section.content, 'companies', [])

  const fallbackStats: Stat[] = [
    { label: 'Highest Package', value: '₹24 LPA' },
    { label: 'Average Package', value: '₹8.5 LPA' },
    { label: 'Placement Rate', value: '95%' },
  ]

  const fallbackCompanies: Company[] = [
    { name: 'TCS', logo: '' },
    { name: 'Infosys', logo: '' },
    { name: 'Wipro', logo: '' },
    { name: 'Google', logo: '' },
    { name: 'Microsoft', logo: '' },
    { name: 'Amazon', logo: '' },
    { name: 'Deloitte', logo: '' },
    { name: 'Accenture', logo: '' },
    { name: 'IBM', logo: '' },
    { name: 'HCL', logo: '' },
    { name: 'Cognizant', logo: '' },
    { name: 'Tech Mahindra', logo: '' },
  ]

  const displayStats = stats.length > 0 ? stats : fallbackStats
  const displayCompanies = companies.length > 0 ? companies : fallbackCompanies

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

        {/* Stats row */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {displayStats.map((stat, idx) => (
            <div
              key={idx}
              className={`p-6 text-center ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
            >
              <p className="text-3xl font-bold" style={{ color: theme.defaultPrimaryColor }}>
                {stat.value}
              </p>
              <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Company logos grid */}
        <div className="mt-10">
          <p className="mb-6 text-center text-sm font-medium text-gray-500">Our Recruiting Partners</p>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {displayCompanies.map((company, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-center p-4 ${radiusClass(theme.cornerRadius)} border border-gray-100 bg-white transition-shadow hover:shadow-md`}
              >
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <span
                    className="text-xs font-semibold"
                    style={{ color: theme.defaultPrimaryColor }}
                  >
                    {company.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
