import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface Facility {
  name: string
  description: string
  icon: string
}

export function InfraMinimal({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Our Facilities'
  const description = field(section.content, 'description', '')
  const facilities = field<Facility[]>(section.content, 'facilities', [])

  const fallbackFacilities: Facility[] = [
    { name: 'Science Labs', description: 'Physics, Chemistry & Biology', icon: '🔬' },
    { name: 'Library', description: '20,000+ Books & Digital', icon: '📚' },
    { name: 'Sports Complex', description: 'Multi-sport Facility', icon: '🏟️' },
    { name: 'Computer Lab', description: 'High-speed Internet', icon: '💻' },
    { name: 'Auditorium', description: '500+ Seating Capacity', icon: '🎭' },
    { name: 'Smart Classrooms', description: 'Interactive Boards', icon: '🖥️' },
    { name: 'Art Studio', description: 'Creative Expression', icon: '🎨' },
    { name: 'Medical Room', description: 'First Aid & Nurse', icon: '🏥' },
  ]

  const displayFacilities = facilities.length > 0 ? facilities : fallbackFacilities

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-6xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {sectionTitle}
        </h2>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">{description}</p>
        )}

        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {displayFacilities.map((facility, idx) => (
            <div
              key={idx}
              className={`p-5 text-center transition-shadow hover:shadow-md ${radiusClass(theme.cornerRadius)}`}
              style={{ backgroundColor: `${theme.defaultPrimaryColor}06` }}
            >
              <span className="text-3xl">{facility.icon || '🏫'}</span>
              <h3 className="mt-3 text-sm font-semibold text-gray-900">{facility.name}</h3>
              <p className="mt-1 text-xs text-gray-500">{facility.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
