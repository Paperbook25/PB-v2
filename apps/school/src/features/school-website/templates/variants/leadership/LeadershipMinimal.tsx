import type { VariantProps } from '../../section-variants'
import { spacingClass, field } from '../shared'

interface Leader {
  name: string
  designation: string
  photo: string
  message: string
}

export function LeadershipMinimal({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Our Leadership'
  const leaders = field<Leader[]>(section.content, 'leaders', [])

  const fallbackLeaders: Leader[] = [
    { name: 'Dr. Rajesh Kumar', designation: 'Chairman', photo: '', message: 'Committed to excellence in education and holistic development of every student.' },
    { name: 'Mrs. Priya Sharma', designation: 'Principal', photo: '', message: 'Building a community of lifelong learners through innovation and dedication.' },
    { name: 'Mr. Anil Verma', designation: 'Vice Principal', photo: '', message: 'Fostering a supportive environment where every student can thrive.' },
  ]

  const displayLeaders = leaders.length > 0 ? leaders : fallbackLeaders

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {sectionTitle}
        </h2>

        <div className="mt-10 space-y-8">
          {displayLeaders.map((leader, idx) => (
            <div key={idx} className="flex items-start gap-4">
              {/* Small circular photo */}
              {leader.photo ? (
                <img
                  src={leader.photo}
                  alt={leader.name}
                  className="h-12 w-12 flex-shrink-0 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  {leader.name.charAt(0)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="font-semibold text-gray-900">{leader.name}</h3>
                  <span className="text-sm" style={{ color: theme.defaultAccentColor }}>
                    {leader.designation}
                  </span>
                </div>
                {leader.message && (
                  <p className="mt-1 text-sm text-gray-600">{leader.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
