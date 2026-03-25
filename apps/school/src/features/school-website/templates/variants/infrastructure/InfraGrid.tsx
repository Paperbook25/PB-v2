import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, radiusClass, field, tint } from '../shared'

interface Facility {
  name: string
  description: string
  image: string
  icon: string
}

export function InfraGrid({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Our Infrastructure'
  const description = field(section.content, 'description', '')
  const facilities = field<Facility[]>(section.content, 'facilities', [])

  const fallbackFacilities: Facility[] = [
    { name: 'Science Laboratories', description: 'State-of-the-art physics, chemistry, and biology labs with modern equipment.', image: '', icon: '🔬' },
    { name: 'Library', description: 'A well-stocked library with over 20,000 books, journals, and digital resources.', image: '', icon: '📚' },
    { name: 'Sports Complex', description: 'Multi-sport facility with cricket ground, basketball courts, and indoor games.', image: '', icon: '🏟️' },
    { name: 'Computer Lab', description: 'Latest computers with high-speed internet and programming tools.', image: '', icon: '💻' },
    { name: 'Auditorium', description: 'Air-conditioned auditorium seating 500+ for events and seminars.', image: '', icon: '🎭' },
    { name: 'Smart Classrooms', description: 'Interactive smart boards and projectors in every classroom.', image: '', icon: '🖥️' },
  ]

  const displayFacilities = facilities.length > 0 ? facilities : fallbackFacilities

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
          {displayFacilities.map((facility, idx) => (
            <div
              key={idx}
              className={`group overflow-hidden ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
            >
              {facility.image ? (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={facility.image}
                    alt={facility.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {facility.icon && (
                    <span
                      className={`absolute left-3 top-3 flex h-10 w-10 items-center justify-center bg-white text-lg shadow-sm ${radiusClass(theme.cornerRadius)}`}
                    >
                      {facility.icon}
                    </span>
                  )}
                </div>
              ) : (
                <div
                  className="relative flex h-48 items-center justify-center"
                  style={{ backgroundColor: tint(theme.defaultPrimaryColor, 0.06) }}
                >
                  <span className="text-5xl">{facility.icon || '🏫'}</span>
                </div>
              )}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
                <p className="mt-2 text-sm text-gray-600">{facility.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
