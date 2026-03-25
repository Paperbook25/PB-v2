import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface Stat {
  label: string
  value: string
}

interface Company {
  name: string
  logo: string
}

export function PlacementsShowcase({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Placement Highlights'
  const stats = field<Stat[]>(section.content, 'stats', [])
  const companies = field<Company[]>(section.content, 'companies', [])

  const fallbackStats: Stat[] = [
    { label: 'Highest Package', value: '₹24 LPA' },
    { label: 'Average Package', value: '₹8.5 LPA' },
    { label: 'Placement Rate', value: '95%' },
    { label: 'Recruiting Companies', value: '60+' },
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
  ]

  const displayStats = stats.length > 0 ? stats : fallbackStats
  const displayCompanies = companies.length > 0 ? companies : fallbackCompanies

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
            {displayStats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-4xl font-extrabold text-white sm:text-5xl">{stat.value}</p>
                <p className="mt-2 text-sm font-medium text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scrolling company logo marquee */}
      <div className="overflow-hidden bg-gray-50 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-6 text-center text-sm font-medium text-gray-500">Our Recruiting Partners</p>
          <div className="flex animate-[scroll_20s_linear_infinite] gap-12">
            {[...displayCompanies, ...displayCompanies].map((company, idx) => (
              <div key={idx} className="flex flex-shrink-0 items-center">
                {company.logo ? (
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-10 w-auto object-contain grayscale transition-all hover:grayscale-0"
                  />
                ) : (
                  <div
                    className={`flex h-12 items-center px-5 text-sm font-semibold ${radiusClass(theme.cornerRadius)}`}
                    style={{
                      backgroundColor: `${theme.defaultPrimaryColor}10`,
                      color: theme.defaultPrimaryColor,
                    }}
                  >
                    {company.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
