import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface FacultyMember {
  name: string
  title: string
  photo: string
  qualifications?: string
  bio?: string
}

export function FacultyGrid({ section, theme }: VariantProps) {
  const description = field(section.content, 'description', '')
  const featured = field<string[]>(section.content, 'featured', [])
  const sectionTitle = section.title || 'Our Faculty'

  // In a real implementation this would fetch faculty from the API based on `featured` IDs.
  // For now we render placeholders.
  const placeholders: FacultyMember[] = Array.from({ length: 8 }, (_, i) => ({
    name: `Faculty Member ${i + 1}`,
    title: 'Teacher',
    photo: '',
  }))

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
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            {description}
          </p>
        )}

        <div className="mt-12 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {placeholders.map((member, idx) => (
            <div key={idx} className="group text-center">
              <div
                className={`relative mx-auto aspect-square w-full overflow-hidden ${radiusClass(theme.cornerRadius)}`}
              >
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center text-2xl font-bold text-white/60"
                    style={{ backgroundColor: theme.defaultPrimaryColor }}
                  >
                    {member.name.charAt(0)}
                  </div>
                )}
                {/* Name overlay on hover */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-3 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="text-sm font-semibold text-white">{member.name}</p>
                  <p className="text-xs text-white/70">{member.title}</p>
                </div>
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900">{member.name}</p>
              <p className="text-xs text-gray-500">{member.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
