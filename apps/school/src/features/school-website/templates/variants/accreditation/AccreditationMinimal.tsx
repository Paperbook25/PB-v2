import type { VariantProps } from '../../section-variants'
import { spacingClass, field } from '../shared'

interface Badge {
  name: string
  certNumber: string
}

export function AccreditationMinimal({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Accreditations'
  const badges = field<Badge[]>(section.content, 'badges', [])

  const fallbackBadges: Badge[] = [
    { name: 'CBSE Affiliated', certNumber: 'Aff. No. 123456' },
    { name: 'NAAC Grade A+', certNumber: 'NAAC/2024/A+' },
    { name: 'ISO 9001:2015 Certified', certNumber: 'ISO-2024-78901' },
    { name: 'NABET Accredited', certNumber: 'QCI/NABET/2024' },
  ]

  const displayBadges = badges.length > 0 ? badges : fallbackBadges

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {sectionTitle}
        </h2>

        <ul className="mt-8 space-y-3">
          {displayBadges.map((badge, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <svg
                className="h-5 w-5 flex-shrink-0"
                style={{ color: theme.defaultAccentColor }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-gray-900">{badge.name}</span>
              <span className="text-sm text-gray-400">({badge.certNumber})</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
