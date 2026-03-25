import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface ActivityItem {
  name: string
  category: string
  image: string
  description: string
}

export function StudentLifeMasonry({ section, theme }: VariantProps) {
  const items = field<ActivityItem[]>(section.content, 'items', [])
  const title = section.title || 'Student Life'

  const fallbackItems: ActivityItem[] = [
    { name: 'Robotics Club', category: 'Clubs', image: '', description: 'Build and programme robots for national competitions.' },
    { name: 'Basketball', category: 'Sports', image: '', description: 'Competitive basketball with inter-school tournaments.' },
    { name: 'Annual Cultural Fest', category: 'Cultural', image: '', description: 'Three-day extravaganza of music, dance, drama, and art exhibitions for the entire school community.' },
    { name: 'Science Olympiad', category: 'Competitions', image: '', description: 'Represent the school at state and national-level Olympiads.' },
    { name: 'Debate Society', category: 'Clubs', image: '', description: 'Sharpen public speaking and critical thinking skills through weekly sessions and inter-school tournaments.' },
    { name: 'Swimming', category: 'Sports', image: '', description: 'Olympic-size pool with certified coaches.' },
    { name: 'Music Band', category: 'Cultural', image: '', description: 'School band performing at assemblies and public events.' },
    { name: 'Math Olympiad', category: 'Competitions', image: '', description: 'Intensive preparation and participation in national mathematics competitions.' },
  ]

  const displayItems = items.length > 0 ? items : fallbackItems

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        {/* CSS columns masonry */}
        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
          {displayItems.map((item, idx) => {
            const tall = idx % 3 === 0
            return (
              <div
                key={idx}
                className={`group relative mb-5 break-inside-avoid overflow-hidden ${radiusClass(theme.cornerRadius)}`}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      tall ? 'aspect-[3/4]' : 'aspect-[4/3]'
                    }`}
                  />
                ) : (
                  <div
                    className={`flex items-center justify-center text-white/40 ${
                      tall ? 'aspect-[3/4]' : 'aspect-[4/3]'
                    }`}
                    style={{ backgroundColor: theme.defaultPrimaryColor }}
                  >
                    <span className="text-xs">{item.name}</span>
                  </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span
                    className={`mb-1 inline-block w-fit px-2 py-0.5 text-xs font-medium text-white ${radiusClass(theme.cornerRadius)}`}
                    style={{ backgroundColor: theme.defaultAccentColor }}
                  >
                    {item.category}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                  <p className="mt-1 text-sm text-white/80">{item.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
