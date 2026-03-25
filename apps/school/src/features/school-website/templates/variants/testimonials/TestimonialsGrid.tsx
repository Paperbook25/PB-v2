import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, field } from '../shared'
import type { TestimonialItem } from '../../../types/school-website.types'

export function TestimonialsGrid({ section, theme }: VariantProps) {
  const items = field<TestimonialItem[]>(section.content, 'items', [])
  const title = section.title || 'What People Say'

  const fallbackItems: TestimonialItem[] = [
    { name: 'Parent', role: 'Grade 10 Parent', quote: 'An excellent institution with dedicated teachers and a nurturing environment.', avatar: '' },
    { name: 'Alumni', role: 'Batch of 2022', quote: 'The best years of my academic life.', avatar: '' },
    { name: 'Student', role: 'Current Student', quote: 'The campus and facilities are truly world-class. I love studying here and the extra-curricular activities are amazing.', avatar: '' },
    { name: 'Teacher', role: 'Faculty', quote: 'A wonderful place to teach.', avatar: '' },
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

        {/* Masonry-style via CSS columns */}
        <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3">
          {displayItems.map((item, idx) => (
            <div
              key={idx}
              className={`mb-6 break-inside-avoid p-6 ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
            >
              <p className="text-gray-600 italic">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: theme.defaultPrimaryColor }}
                  >
                    {item.name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
