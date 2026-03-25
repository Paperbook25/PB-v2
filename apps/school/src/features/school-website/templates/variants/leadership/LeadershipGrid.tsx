import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, radiusClass, field } from '../shared'

interface Leader {
  name: string
  designation: string
  photo: string
  message: string
}

export function LeadershipGrid({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Our Leadership'
  const description = field(section.content, 'description', '')
  const leaders = field<Leader[]>(section.content, 'leaders', [])

  const fallbackLeaders: Leader[] = [
    { name: 'Dr. Rajesh Kumar', designation: 'Chairman', photo: '', message: 'Committed to excellence in education and holistic development of every student.' },
    { name: 'Mrs. Priya Sharma', designation: 'Principal', photo: '', message: 'Building a community of lifelong learners through innovation and dedication.' },
    { name: 'Mr. Anil Verma', designation: 'Vice Principal', photo: '', message: 'Fostering a supportive environment where every student can thrive.' },
    { name: 'Dr. Sunita Patel', designation: 'Academic Director', photo: '', message: 'Driving curriculum innovation to meet the challenges of the 21st century.' },
  ]

  const displayLeaders = leaders.length > 0 ? leaders : fallbackLeaders

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

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayLeaders.map((leader, idx) => (
            <div
              key={idx}
              className={`overflow-hidden text-center ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
            >
              {/* Photo */}
              {leader.photo ? (
                <img
                  src={leader.photo}
                  alt={leader.name}
                  className="h-56 w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-56 items-center justify-center text-4xl font-bold text-white/40"
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  {leader.name.charAt(0)}
                </div>
              )}

              {/* Info */}
              <div className="p-5">
                <h3 className="font-semibold text-gray-900">{leader.name}</h3>
                <p className="mt-0.5 text-sm" style={{ color: theme.defaultAccentColor }}>
                  {leader.designation}
                </p>
                {leader.message && (
                  <p className="mt-3 text-xs text-gray-500 line-clamp-3">
                    &ldquo;{leader.message}&rdquo;
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
