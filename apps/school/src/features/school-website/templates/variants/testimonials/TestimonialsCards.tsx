import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, field } from '../shared'
import type { TestimonialItem } from '../../../types/school-website.types'

export function TestimonialsCards({ section, theme }: VariantProps) {
  const items = field<TestimonialItem[]>(section.content, 'items', [])
  const title = section.title || 'What People Say'

  const fallbackItems: TestimonialItem[] = [
    { name: 'Parent', role: 'Grade 10 Parent', quote: 'An excellent institution with dedicated teachers.', avatar: '' },
    { name: 'Alumni', role: 'Batch of 2022', quote: 'The best years of my academic life were spent here.', avatar: '' },
    { name: 'Student', role: 'Current Student', quote: 'The campus and facilities are truly world-class.', avatar: '' },
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
            <div
              key={idx}
              className={`flex flex-col p-6 ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
            >
              <p className="flex-1 text-gray-600 italic">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
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
