import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, field } from '../shared'
import type { StatsItem } from '../../../types/school-website.types'

export function StatsCards({ section, theme }: VariantProps) {
  const items = field<StatsItem[]>(section.content, 'items', [])
  const title = section.title || 'By the Numbers'

  const fallbackItems: StatsItem[] = [
    { label: 'Students', value: '1,200+', icon: '' },
    { label: 'Teachers', value: '80+', icon: '' },
    { label: 'Years', value: '25+', icon: '' },
    { label: 'Pass Rate', value: '98%', icon: '' },
  ]

  const displayItems = items.length > 0 ? items : fallbackItems

  return (
    <section
      className={spacingClass(theme.sectionSpacing)}
      style={{ backgroundColor: `${theme.defaultPrimaryColor}08` }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayItems.map((item, idx) => (
            <div
              key={idx}
              className={`p-8 text-center ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
            >
              <p
                className="text-4xl font-bold"
                style={{ color: theme.defaultPrimaryColor }}
              >
                {item.value}
              </p>
              <p className="mt-2 text-sm font-medium text-gray-500">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
