import { useState } from 'react'
import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, radiusClass, field } from '../shared'

interface ActivityItem {
  name: string
  category: string
  image: string
  description: string
}

export function StudentLifeGrid({ section, theme }: VariantProps) {
  const items = field<ActivityItem[]>(section.content, 'items', [])
  const title = section.title || 'Student Life'

  const fallbackItems: ActivityItem[] = [
    { name: 'Robotics Club', category: 'Clubs', image: '', description: 'Build and programme robots for national competitions.' },
    { name: 'Basketball', category: 'Sports', image: '', description: 'Competitive basketball with inter-school tournaments.' },
    { name: 'Annual Cultural Fest', category: 'Cultural', image: '', description: 'Three-day extravaganza of music, dance, and drama.' },
    { name: 'Science Olympiad', category: 'Competitions', image: '', description: 'Represent the school at state and national-level Olympiads.' },
    { name: 'Debate Society', category: 'Clubs', image: '', description: 'Sharpen public speaking and critical thinking skills.' },
    { name: 'Swimming', category: 'Sports', image: '', description: 'Olympic-size pool with certified coaches.' },
  ]

  const displayItems = items.length > 0 ? items : fallbackItems
  const categories = ['All', ...Array.from(new Set(displayItems.map((i) => i.category)))]
  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? displayItems : displayItems.filter((i) => i.category === active)

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        {/* Category filter pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActive(cat)}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${radiusClass(theme.cornerRadius)} ${
                active === cat ? 'text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={active === cat ? { backgroundColor: theme.defaultAccentColor } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Photo-card grid */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, idx) => (
            <div key={idx} className={`overflow-hidden ${cardClass(theme.cardStyle, theme.cornerRadius)}`}>
              {item.image ? (
                <img src={item.image} alt={item.name} className="aspect-video w-full object-cover" />
              ) : (
                <div
                  className="flex aspect-video items-center justify-center text-white/50"
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  <span className="text-xs">{item.name}</span>
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <span
                    className={`ml-auto px-2 py-0.5 text-xs font-medium text-white ${radiusClass(theme.cornerRadius)}`}
                    style={{ backgroundColor: theme.defaultAccentColor }}
                  >
                    {item.category}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
