import type { VariantProps } from '../../section-variants'
import { spacingClass, field } from '../shared'
import type { StatsItem } from '../../../types/school-website.types'

export function StatsCounters({ section, theme }: VariantProps) {
  const items = field<StatsItem[]>(section.content, 'items', [])
  const title = section.title || 'By the Numbers'

  const fallbackItems: StatsItem[] = [
    { label: 'Students Enrolled', value: '1,200+', icon: '' },
    { label: 'Expert Faculty', value: '80+', icon: '' },
    { label: 'Years of Excellence', value: '25+', icon: '' },
    { label: 'Pass Rate', value: '98%', icon: '' },
  ]

  const displayItems = items.length > 0 ? items : fallbackItems

  return (
    <section
      className={spacingClass(theme.sectionSpacing)}
      style={{ backgroundColor: theme.defaultPrimaryColor, color: '#fff' }}
    >
      <div className="mx-auto max-w-7xl px-6">
        {title && (
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
            {title}
          </h2>
        )}

        <div className="mt-12 flex flex-wrap items-center justify-center divide-x divide-white/20">
          {displayItems.map((item, idx) => (
            <div key={idx} className="px-8 py-4 text-center">
              <p className="text-5xl font-extrabold tracking-tight transition-all duration-700">
                {item.value}
              </p>
              <p className="mt-2 text-sm font-medium uppercase tracking-wider text-white/70">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
