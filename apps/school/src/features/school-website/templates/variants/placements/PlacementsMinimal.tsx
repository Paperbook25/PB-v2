import type { VariantProps } from '../../section-variants'
import { spacingClass, field } from '../shared'

interface Stat {
  label: string
  value: string
}

interface Company {
  name: string
  link: string
}

export function PlacementsMinimal({ section, theme }: VariantProps) {
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
    { name: 'TCS', link: '#' },
    { name: 'Infosys', link: '#' },
    { name: 'Wipro', link: '#' },
    { name: 'Google', link: '#' },
    { name: 'Microsoft', link: '#' },
    { name: 'Amazon', link: '#' },
    { name: 'Deloitte', link: '#' },
    { name: 'Accenture', link: '#' },
  ]

  const displayStats = stats.length > 0 ? stats : fallbackStats
  const displayCompanies = companies.length > 0 ? companies : fallbackCompanies

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

        {/* Inline stats */}
        <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm">
          {displayStats.map((stat, idx) => (
            <p key={idx} className="text-gray-600">
              <span className="font-bold" style={{ color: theme.defaultPrimaryColor }}>
                {stat.value}
              </span>{' '}
              {stat.label}
            </p>
          ))}
        </div>

        {/* Companies as comma-separated links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-700">Recruiting Partners: </span>
            {displayCompanies.map((company, idx) => (
              <span key={idx}>
                {company.link && company.link !== '#' ? (
                  <a
                    href={company.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline transition-colors hover:no-underline"
                    style={{ color: theme.defaultAccentColor }}
                  >
                    {company.name}
                  </a>
                ) : (
                  <span style={{ color: theme.defaultAccentColor }}>{company.name}</span>
                )}
                {idx < displayCompanies.length - 1 && ', '}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  )
}
