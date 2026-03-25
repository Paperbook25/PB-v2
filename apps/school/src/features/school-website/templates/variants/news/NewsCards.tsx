import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, radiusClass, field } from '../shared'
import type { NewsItem } from '../../../types/school-website.types'

export function NewsCards({ section, theme }: VariantProps) {
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
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((item, idx) => (
            <article
              key={idx}
              className={`overflow-hidden ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
            >
              {/* Image */}
              <div className={`overflow-hidden ${radiusClass(theme.cornerRadius)}`}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="aspect-[16/9] w-full object-cover"
                  />
                ) : (
                  <div
                    className="flex aspect-[16/9] items-center justify-center text-white/50"
                    style={{ backgroundColor: theme.defaultPrimaryColor }}
                  >
                    <span className="text-xs">News Image</span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <time className="text-xs text-gray-400">{item.date}</time>
                <h3 className="mt-1 font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-gray-600">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
