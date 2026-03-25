import { useState } from 'react'
import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface FaqItem {
  question: string
  answer: string
}

export function FaqAccordion({ section, theme }: VariantProps) {
  const items = field<FaqItem[]>(section.content, 'items', [])
  const title = section.title || 'Frequently Asked Questions'

  const fallbackItems: FaqItem[] = [
    { question: 'What are the school timings?', answer: 'The school operates from 8:00 AM to 3:00 PM, Monday through Friday. Saturday is reserved for extracurricular activities.' },
    { question: 'What is the admission process?', answer: 'Admissions open in March every year. Parents can fill the online application form, followed by an interaction session with the student.' },
    { question: 'Do you provide transport facilities?', answer: 'Yes, we offer bus transport covering major routes across the city with GPS-tracked vehicles and trained attendants.' },
    { question: 'What curriculum do you follow?', answer: 'We follow the CBSE curriculum with additional emphasis on practical learning and skill development.' },
  ]

  const displayItems = items.length > 0 ? items : fallbackItems
  const [openIndex, setOpenIndex] = useState<number | null>(null)

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

        <div className="mt-12 space-y-3">
          {displayItems.map((item, idx) => {
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
