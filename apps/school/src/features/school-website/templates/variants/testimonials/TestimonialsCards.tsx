import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, radiusClass, field } from '../shared'
import type { TestimonialItem } from '../../../types/school-website.types'

export function TestimonialsCards({ section, theme }: VariantProps) {
  const items = field<TestimonialItem[]>(section.content, 'items', [])
  const title = section.title || 'What People Say'
  const subtitle = field(
    section.content,
    'subtitle',
    'Hear from parents, students, and alumni about their experience with us.',
  )

  const fallbackItems: TestimonialItem[] = [
    {
      name: 'Priya Sharma',
      role: 'Grade 10 Parent',
      quote:
        'An excellent institution with dedicated teachers who go above and beyond. My child has flourished academically and personally.',
      avatar: '',
      rating: 5,
    },
    {
      name: 'Rahul Verma',
      role: 'Batch of 2022',
      quote:
        'The best years of my academic life were spent here. The mentorship and extracurricular opportunities shaped my career.',
      avatar: '',
      rating: 5,
    },
    {
      name: 'Ananya Patel',
      role: 'Current Student',
      quote:
        'The campus and facilities are truly world-class. I love the supportive environment and innovative teaching methods.',
      avatar: '',
      rating: 4,
    },
  ]

  const displayItems = items.length > 0 ? items : fallbackItems

  const primaryColor = theme.defaultPrimaryColor
  const accentColor = theme.defaultAccentColor

  return (
    <section
      className={`relative overflow-hidden ${spacingClass(theme.sectionSpacing)}`}
      style={{ backgroundColor: `${primaryColor}08` }}
    >
      {/* Decorative watermark quote */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 select-none"
        style={{ opacity: 0.04 }}
      >
        <svg
          width="400"
          height="400"
          viewBox="0 0 100 100"
          fill={primaryColor}
          style={{ transform: 'rotate(15deg)' }}
        >
          <text x="0" y="80" fontSize="100" fontFamily="Georgia, serif">
            &#x275D;
          </text>
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <span
            className="inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            Testimonials
          </span>
          <h2
            className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            style={{ color: primaryColor }}
          >
            {title}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-gray-500">
            {subtitle}
          </p>
        </div>

        {/* Cards grid */}
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col bg-white rounded-2xl shadow-md p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Opening quote mark */}
              <svg
                className="mb-4 h-8 w-8 shrink-0"
                viewBox="0 0 24 24"
                fill={accentColor}
                aria-hidden="true"
              >
                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.69 11 13.166 11 15c0 1.933-1.567 3.5-3.5 3.5-1.172 0-2.274-.569-2.917-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.69 21 13.166 21 15c0 1.933-1.567 3.5-3.5 3.5-1.172 0-2.274-.569-2.917-1.179z" />
              </svg>

              {/* Quote text */}
              <p className="flex-1 text-gray-600 italic leading-relaxed">
                {item.quote}
              </p>

              {/* Divider */}
              <div
                className="my-6 h-px w-full"
                style={{ backgroundColor: `${primaryColor}15` }}
              />

              {/* Author info */}
              <div className="flex items-center gap-4">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                  />
                ) : (
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {item.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {item.name}
                  </p>
                  <p className="truncate text-xs text-gray-500">{item.role}</p>
                  {/* Star rating */}
                  {item.rating && item.rating > 0 && (
                    <div className="mt-1 flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, starIdx) => (
                        <span
                          key={starIdx}
                          className="text-xs"
                          style={{
                            color:
                              starIdx < item.rating! ? accentColor : '#D1D5DB',
                          }}
                        >
                          &#9733;
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
