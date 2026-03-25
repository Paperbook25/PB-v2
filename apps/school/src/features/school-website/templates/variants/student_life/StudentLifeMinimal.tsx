import type { VariantProps } from '../../section-variants'
import { spacingClass, field } from '../shared'

interface ActivityItem {
  name: string
  category: string
  description: string
}

export function StudentLifeMinimal({ section, theme }: VariantProps) {
  const items = field<ActivityItem[]>(section.content, 'items', [])
  const title = section.title || 'Student Life'

  const fallbackItems: ActivityItem[] = [
    { name: 'Robotics Club', category: 'Clubs', description: 'Build and programme robots for national competitions.' },
    { name: 'Debate Society', category: 'Clubs', description: 'Public speaking and critical thinking through weekly sessions.' },
    { name: 'Basketball', category: 'Sports', description: 'Competitive basketball with inter-school tournaments.' },
    { name: 'Swimming', category: 'Sports', description: 'Olympic-size pool with certified coaches.' },
    { name: 'Annual Cultural Fest', category: 'Cultural', description: 'Three-day extravaganza of music, dance, and drama.' },
    { name: 'Music Band', category: 'Cultural', description: 'School band performing at assemblies and public events.' },
    { name: 'Science Olympiad', category: 'Competitions', description: 'State and national-level Olympiad participation.' },
    { name: 'Math Olympiad', category: 'Competitions', description: 'Intensive preparation for national mathematics competitions.' },
  ]

  const displayItems = items.length > 0 ? items : fallbackItems

  // Group by category
  const grouped = displayItems.reduce<Record<string, ActivityItem[]>>((acc, item) => {
    const cat = item.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})

  // Simple icon per category keyword
  const categoryIcon = (cat: string) => {
    const lower = cat.toLowerCase()
    if (lower.includes('sport')) {
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
    if (lower.includes('club')) {
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
      )
    }
    if (lower.includes('cultur')) {
      return (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
        </svg>
      )
    }
    // Default: trophy for competitions
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-4.5A3.375 3.375 0 0019.875 10.875 3.375 3.375 0 0016.5 7.5V3.75m-9 15v-4.5A3.375 3.375 0 014.125 10.875 3.375 3.375 0 017.5 7.5V3.75m0 0h9" />
      </svg>
    )
  }

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-4xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        <div className="mt-12 space-y-10">
          {Object.entries(grouped).map(([category, categoryItems]) => (
            <div key={category}>
              <div className="flex items-center gap-2" style={{ color: theme.defaultAccentColor }}>
                {categoryIcon(category)}
                <h3 className="text-lg font-semibold">{category}</h3>
              </div>
              <ul className="mt-4 space-y-3 pl-7">
                {categoryItems.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">{item.name}</span>
                    {item.description && (
                      <span className="text-gray-500"> &mdash; {item.description}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
