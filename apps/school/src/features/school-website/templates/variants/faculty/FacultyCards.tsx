import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, field } from '../shared'

interface FacultyMember {
  name: string
  title: string
  photo: string
  qualifications?: string
  bio?: string
}

export function FacultyCards({ section, theme }: VariantProps) {
  const description = field(section.content, 'description', '')
  const sectionTitle = section.title || 'Our Faculty'

  // Placeholder data — real implementation would use featured IDs from API.
  const placeholders: FacultyMember[] = Array.from({ length: 6 }, (_, i) => ({
    name: `Faculty Member ${i + 1}`,
    title: 'Senior Teacher',
    photo: '',
    qualifications: 'M.Ed., B.Sc.',
    bio: 'Passionate educator with over 10 years of teaching experience.',
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

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {placeholders.map((member, idx) => (
            <div
              key={idx}
              className={`flex gap-4 p-5 ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
            >
              {/* Photo */}
              <div className="shrink-0">
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-20 w-20 items-center justify-center rounded-full text-xl font-bold text-white"
                    style={{ backgroundColor: theme.defaultPrimaryColor }}
                  >
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="min-w-0">
                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                <p
                  className="text-sm font-medium"
                  style={{ color: theme.defaultAccentColor }}
                >
                  {member.title}
                </p>
                {member.qualifications && (
                  <p className="mt-1 text-xs text-gray-500">{member.qualifications}</p>
                )}
                {member.bio && (
                  <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                    {member.bio}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
