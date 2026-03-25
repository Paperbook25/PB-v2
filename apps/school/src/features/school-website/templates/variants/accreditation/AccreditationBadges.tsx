import type { VariantProps } from '../../section-variants'
import { spacingClass, field } from '../shared'

interface Badge {
  name: string
  logo: string
  certNumber: string
  verifyLink: string
}

export function AccreditationBadges({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Accreditations & Affiliations'
  const description = field(section.content, 'description', '')
  const badges = field<Badge[]>(section.content, 'badges', [])

  const fallbackBadges: Badge[] = [
    { name: 'CBSE', logo: '', certNumber: 'Aff. No. 123456', verifyLink: '#' },
    { name: 'NAAC', logo: '', certNumber: 'Grade A+', verifyLink: '#' },
    { name: 'ISO 9001:2015', logo: '', certNumber: 'Cert-2024-001', verifyLink: '#' },
    { name: 'NABET', logo: '', certNumber: 'QCI/NABET/2024', verifyLink: '#' },
  ]

  const displayBadges = badges.length > 0 ? badges : fallbackBadges

  return (
    <section
      className={spacingClass(theme.sectionSpacing)}
      style={{ backgroundColor: `${theme.defaultPrimaryColor}05` }}
    >
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

        <div className="mt-12 flex flex-wrap items-center justify-center gap-10">
          {displayBadges.map((badge, idx) => (
            <div key={idx} className="group relative text-center">
              {/* Circular badge */}
              <div className="relative mx-auto">
                {badge.logo ? (
                  <img
                    src={badge.logo}
                    alt={badge.name}
                    className="h-24 w-24 rounded-full border-2 border-gray-200 object-contain p-2 transition-shadow group-hover:shadow-lg"
                  />
                ) : (
                  <div
                    className="flex h-24 w-24 items-center justify-center rounded-full border-2 text-sm font-bold text-white transition-shadow group-hover:shadow-lg"
                    style={{
                      backgroundColor: theme.defaultPrimaryColor,
                      borderColor: theme.defaultPrimaryColor,
                    }}
                  >
                    {badge.name.slice(0, 4)}
                  </div>
                )}

                {/* Hover tooltip */}
                <div className="pointer-events-none absolute -bottom-16 left-1/2 z-20 w-48 -translate-x-1/2 rounded-lg bg-gray-900 p-3 text-center opacity-0 shadow-lg transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                  <p className="text-xs font-medium text-white">{badge.certNumber}</p>
                  {badge.verifyLink && badge.verifyLink !== '#' && (
                    <a
                      href={badge.verifyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-xs text-blue-300 underline"
                    >
                      Verify
                    </a>
                  )}
                  <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900" />
                </div>
              </div>
              <p className="mt-3 text-sm font-medium text-gray-700">{badge.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
