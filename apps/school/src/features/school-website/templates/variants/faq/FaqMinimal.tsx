import type { VariantProps } from '../../section-variants'
import { spacingClass, field } from '../shared'

interface FaqItem {
  question: string
  answer: string
}

export function FaqMinimal({ section, theme }: VariantProps) {
  const items = field<FaqItem[]>(section.content, 'items', [])
  const title = section.title || 'Frequently Asked Questions'

  const fallbackItems: FaqItem[] = [
    { question: 'What are the school timings?', answer: 'The school operates from 8:00 AM to 3:00 PM, Monday through Friday.' },
    { question: 'What is the admission process?', answer: 'Admissions open in March. Fill the online form followed by a student interaction session.' },
    { question: 'Do you provide transport?', answer: 'Yes, GPS-tracked buses cover major city routes with trained attendants on board.' },
    { question: 'What curriculum do you follow?', answer: 'We follow the CBSE curriculum with emphasis on practical learning and skill development.' },
    { question: 'Are scholarships available?', answer: 'Merit-based and need-based scholarships are available. Contact the admissions office for details.' },
  ]

  const displayItems = items.length > 0 ? items : fallbackItems

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        <ol className="mt-12 space-y-0 divide-y divide-gray-200">
          {displayItems.map((item, idx) => (
            <li key={idx} className="py-6">
              <div className="flex gap-4">
                <span
                  className="mt-0.5 text-lg font-bold leading-none"
                  style={{ color: theme.defaultAccentColor }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.question}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.answer}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
