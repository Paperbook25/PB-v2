import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, radiusClass, field } from '../shared'

interface Badge {
  name: string
  logo: string
  certNumber: string
  validUntil: string
  verifyLink: string
  description: string
}

export function AccreditationCards({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Accreditations & Affiliations'
  const description = field(section.content, 'description', '')
  const badges = field<Badge[]>(section.content, 'badges', [])

  const fallbackBadges: Badge[] = [
    { name: 'CBSE Affiliation', logo: '', certNumber: 'Aff. No. 123456', validUntil: '2028', verifyLink: '#', description: 'Affiliated with the Central Board of Secondary Education for classes I-XII.' },
    { name: 'NAAC Grade A+', logo: '', certNumber: 'NAAC/2024/A+', validUntil: '2029', verifyLink: '#', description: 'Accredited with the highest grade by the National Assessment and Accreditation Council.' },
    { name: 'ISO 9001:2015', logo: '', certNumber: 'ISO-2024-78901', validUntil: '2027', verifyLink: '#', description: 'Quality management system certified by the International Organization for Standardization.' },
  ]

  const displayBadges = badges.length > 0 ? badges : fallbackBadges

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
          {displayBadges.map((badge, idx) => (
            <div
              key={idx}
              className={`flex flex-col p-6 ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
            >
              {/* Logo */}
              <div className="flex items-center gap-4">
                {badge.logo ? (
                  <img
                    src={badge.logo}
                    alt={badge.name}
                    className={`h-16 w-16 object-contain ${radiusClass(theme.cornerRadius)}`}
                  />
                ) : (
                  <div
                    className={`flex h-16 w-16 items-center justify-center text-sm font-bold text-white ${radiusClass(theme.cornerRadius)}`}
                    style={{ backgroundColor: theme.defaultPrimaryColor }}
                  >
                    {badge.name.slice(0, 3)}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                  <p className="text-xs text-gray-500">{badge.certNumber}</p>
                </div>
              </div>

              {/* Description */}
              {badge.description && (
                <p className="mt-4 flex-1 text-sm text-gray-600">{badge.description}</p>
              )}

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-xs text-gray-400">Valid until {badge.validUntil}</span>
                {badge.verifyLink && (
                  <a
                    href={badge.verifyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium transition-colors hover:underline"
                    style={{ color: theme.defaultAccentColor }}
                  >
                    Verify Certificate
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
