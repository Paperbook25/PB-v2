import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface EventItem {
  title: string
  date: string
  description?: string
}

export function EventsTimeline({ section, theme }: VariantProps) {
  const showCount = field<number>(section.content, 'showCount', 4)
  const title = section.title || 'Upcoming Events'

  const events: EventItem[] = [
    { title: 'Parent-Teacher Meeting', date: '2026-04-05', description: 'Discuss student progress with teachers.' },
    { title: 'Annual Sports Day', date: '2026-04-12', description: 'Inter-house athletics competition.' },
    { title: 'Science Exhibition', date: '2026-04-20', description: 'Student projects on display for all.' },
    { title: 'Summer Camp Registration', date: '2026-05-01', description: 'Register for exciting summer activities.' },
  ].slice(0, showCount)

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })
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

        <div className="relative mt-12">
          {/* Vertical line */}
          <div
            className="absolute left-4 top-0 h-full w-0.5 md:left-1/2 md:-translate-x-px"
            style={{ backgroundColor: `${theme.defaultPrimaryColor}20` }}
          />

          <div className="space-y-10">
            {events.map((ev, idx) => {
              const isLeft = idx % 2 === 0
              return (
                <div
                  key={idx}
                  className={`relative flex items-start gap-6 pl-12 md:pl-0 ${
                    isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Dot */}
                  <div
                    className={`absolute left-2.5 top-1 h-3 w-3 rounded-full border-2 border-white md:left-1/2 md:-translate-x-1/2`}
                    style={{ backgroundColor: theme.defaultPrimaryColor }}
                  />

                  {/* Content card */}
                  <div
                    className={`w-full md:w-[calc(50%-2rem)] ${radiusClass(theme.cornerRadius)} border border-gray-100 bg-white p-5 shadow-sm`}
                  >
                    <time
                      className="text-xs font-medium"
                      style={{ color: theme.defaultAccentColor }}
                    >
                      {formatDate(ev.date)}
                    </time>
                    <h3 className="mt-1 font-semibold text-gray-900">{ev.title}</h3>
                    {ev.description && (
                      <p className="mt-2 text-sm text-gray-600">{ev.description}</p>
                    )}
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden w-[calc(50%-2rem)] md:block" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
