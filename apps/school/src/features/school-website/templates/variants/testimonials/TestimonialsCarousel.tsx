import { useState } from 'react'
import type { VariantProps } from '../../section-variants'
import { spacingClass, field } from '../shared'
import type { TestimonialItem } from '../../../types/school-website.types'

export function TestimonialsCarousel({ section, theme }: VariantProps) {
  const items = field<TestimonialItem[]>(section.content, 'items', [])
  const title = section.title || 'What People Say'

  const fallbackItems: TestimonialItem[] = [
    { name: 'Parent', role: 'Grade 10 Parent', quote: 'An excellent institution with dedicated teachers.', avatar: '' },
    { name: 'Alumni', role: 'Batch of 2022', quote: 'The best years of my academic life were spent here.', avatar: '' },
    { name: 'Student', role: 'Current Student', quote: 'The campus and facilities are truly world-class.', avatar: '' },
  ]

  const displayItems = items.length > 0 ? items : fallbackItems
  const [active, setActive] = useState(0)
  const current = displayItems[active]

  return (
    <section
      className={spacingClass(theme.sectionSpacing)}
      style={{ backgroundColor: `${theme.defaultPrimaryColor}06` }}
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2
          className="text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        {current && (
          <div className="mt-12">
            <blockquote className="text-xl leading-relaxed text-gray-700 italic">
              &ldquo;{current.quote}&rdquo;
            </blockquote>

            <div className="mt-8 flex flex-col items-center gap-2">
              {current.avatar ? (
                <img
                  src={current.avatar}
                  alt={current.name}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-white"
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  {current.name.charAt(0)}
                </div>
              )}
              <p className="font-semibold text-gray-900">{current.name}</p>
              <p className="text-sm text-gray-500">{current.role}</p>
            </div>
          </div>
        )}

        {/* Dots navigation */}
        {displayItems.length > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {displayItems.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActive(idx)}
                aria-label={`Go to testimonial ${idx + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  idx === active ? '' : 'bg-gray-300'
                }`}
                style={idx === active ? { backgroundColor: theme.defaultPrimaryColor } : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
