import type { VariantProps } from '../../section-variants'
import { spacingClass, field } from '../shared'
import type { StatsItem } from '../../../types/school-website.types'

export function StatsMinimal({ section, theme }: VariantProps) {
  const items = field<StatsItem[]>(section.content, 'items', [])

  const fallbackItems: StatsItem[] = [
    { label: 'Students', value: '1,200+', icon: '' },
    { label: 'Faculty', value: '80+', icon: '' },
    { label: 'Years', value: '25+', icon: '' },
    { label: 'Pass Rate', value: '98%', icon: '' },
  ]

  const displayItems = items.length > 0 ? items : fallbackItems

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {displayItems.map((item, idx) => (
            <div key={idx} className="flex items-baseline gap-2">
              <span
                className="text-3xl font-bold"
                style={{ color: theme.defaultPrimaryColor }}
              >
                {item.value}
              </span>
              <span className="text-sm text-gray-500">{item.label}</span>
              {idx < displayItems.length - 1 && (
                <span className="ml-10 hidden h-6 w-px bg-gray-200 md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
