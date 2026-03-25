import type { VariantProps } from '../../section-variants'
import { spacingClass, field } from '../shared'
import type { NewsItem } from '../../../types/school-website.types'

export function NewsList({ section, theme }: VariantProps) {
  const items = field<NewsItem[]>(section.content, 'items', [])
  const title = section.title || 'Latest News'

  const fallbackItems: NewsItem[] = [
    { title: 'Annual Day Celebration', body: 'Our annual day was a grand success with cultural performances and awards.', date: '2026-03-15', image: '' },
    { title: 'Science Fair Winners', body: 'Students showcased innovative projects at the inter-school science fair.', date: '2026-03-10', image: '' },
    { title: 'Sports Day 2026', body: 'Track and field events brought out the best athletes in every class.', date: '2026-03-01', image: '' },
  ]

  const displayItems = items.length > 0 ? items : fallbackItems

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        <div className="mt-10 divide-y divide-gray-100">
          {displayItems.map((item, idx) => (
            <article key={idx} className="flex gap-4 py-6">
              {/* Thumbnail */}
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-20 w-20 shrink-0 rounded object-cover"
                />
              ) : (
                <div
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded text-xs text-white/50"
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  News
                </div>
              )}

              <div className="min-w-0">
                <time className="text-xs text-gray-400">{item.date}</time>
                <h3 className="mt-0.5 font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
