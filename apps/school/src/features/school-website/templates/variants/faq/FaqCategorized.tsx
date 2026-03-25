import { useState } from 'react'
import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface FaqItem {
  question: string
  answer: string
  category: string
}

export function FaqCategorized({ section, theme }: VariantProps) {
  const items = field<FaqItem[]>(section.content, 'items', [])
  const title = section.title || 'Frequently Asked Questions'

  const fallbackItems: FaqItem[] = [
    { category: 'Admissions', question: 'When do admissions open?', answer: 'Admissions open in March every year. Visit the admissions page for the detailed schedule.' },
    { category: 'Admissions', question: 'What documents are required?', answer: 'Birth certificate, previous school report card, passport-size photographs, and address proof.' },
    { category: 'Academics', question: 'What curriculum do you follow?', answer: 'We follow the CBSE curriculum with supplementary STEM and arts programmes.' },
    { category: 'Academics', question: 'Are there remedial classes?', answer: 'Yes, remedial sessions are conducted after school hours for students who need additional support.' },
    { category: 'Facilities', question: 'Do you have a library?', answer: 'Our library houses over 15,000 books, digital resources, and a quiet reading zone.' },
    { category: 'Facilities', question: 'Is there a sports complex?', answer: 'Yes, we have courts for basketball, badminton, a swimming pool, and an athletics track.' },
  ]

  const displayItems = items.length > 0 ? items : fallbackItems
  const categories = Array.from(new Set(displayItems.map((i) => i.category)))
  const [activeCategory, setActiveCategory] = useState(categories[0] || '')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const filtered = displayItems.filter((i) => i.category === activeCategory)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        {/* Category pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setActiveCategory(cat)
                setOpenIndex(null)
              }}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${radiusClass(theme.cornerRadius)} ${
                activeCategory === cat
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={activeCategory === cat ? { backgroundColor: theme.defaultAccentColor } : undefined}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion for active category */}
        <div className="mt-8 space-y-3">
          {filtered.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className={`overflow-hidden border border-gray-200 ${radiusClass(theme.cornerRadius)}`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
                >
                  <span className="pr-4 font-medium text-gray-900">{item.question}</span>
                  <svg
                    className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="border-t border-gray-100 px-5 py-4">
                    <p className="text-sm leading-relaxed text-gray-600">{item.answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
