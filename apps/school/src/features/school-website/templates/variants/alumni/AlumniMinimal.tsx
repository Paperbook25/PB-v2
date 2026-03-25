import type { VariantProps } from '../../section-variants'
import { spacingClass, field } from '../shared'

interface AlumniItem {
  name: string
  batch: string
  role: string
  achievement: string
}

export function AlumniMinimal({ section, theme }: VariantProps) {
  const items = field<AlumniItem[]>(section.content, 'items', [])
  const title = section.title || 'Our Alumni'

  const fallbackItems: AlumniItem[] = [
    { name: 'Priya Sharma', batch: '2015', role: 'Software Engineer at Google', achievement: 'Built accessibility tools used by millions' },
    { name: 'Rahul Verma', batch: '2013', role: 'Civil Services (IAS)', achievement: 'District Collector at 28' },
    { name: 'Ananya Patel', batch: '2018', role: 'Research Scholar at MIT', achievement: 'Published 5 papers in quantum computing' },
    { name: 'Vikram Singh', batch: '2016', role: 'Founder, EduTech Startup', achievement: 'Raised $10M in Series A funding' },
    { name: 'Meera Iyer', batch: '2014', role: 'Doctor, AIIMS', achievement: 'National award for rural healthcare initiatives' },
  ]

  const displayItems = items.length > 0 ? items : fallbackItems

  // Group by batch year
  const grouped = displayItems.reduce<Record<string, AlumniItem[]>>((acc, item) => {
    const key = item.batch || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  // Sort batch years descending
  const sortedBatches = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        <div className="mt-12 space-y-8">
          {sortedBatches.map((batch) => (
            <div key={batch}>
              <h3
                className="text-lg font-semibold"
                style={{ color: theme.defaultAccentColor }}
              >
                Batch of {batch}
              </h3>
              <ul className="mt-3 space-y-2 divide-y divide-gray-100">
                {grouped[batch].map((item, idx) => (
                  <li key={idx} className="flex flex-col gap-0.5 py-2 text-sm sm:flex-row sm:items-baseline sm:gap-2">
                    <span className="font-semibold text-gray-900">{item.name}</span>
                    <span className="hidden text-gray-300 sm:inline">&middot;</span>
                    <span className="text-gray-600">{item.role}</span>
                    <span className="hidden text-gray-300 sm:inline">&middot;</span>
                    <span className="text-gray-500">{item.achievement}</span>
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
