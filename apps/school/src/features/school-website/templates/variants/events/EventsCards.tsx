import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, radiusClass, field, tint } from '../shared'

interface EventItem {
  title: string
  date: string
  description?: string
}

export function EventsCards({ section, theme }: VariantProps) {
  const showCount = field<number>(section.content, 'showCount', 4)
  const title = section.title || 'Upcoming Events'

  // Placeholder events — real implementation fetches from calendar API.
  const events: EventItem[] = [
    { title: 'Parent-Teacher Meeting', date: '2026-04-05', description: 'Discuss student progress with teachers.' },
    { title: 'Annual Sports Day', date: '2026-04-12', description: 'Inter-house athletics competition.' },
    { title: 'Science Exhibition', date: '2026-04-20', description: 'Student projects on display for all.' },
    { title: 'Summer Camp Registration', date: '2026-05-01', description: 'Register for exciting summer activities.' },
  ].slice(0, showCount)

  const formatDate = (d: string) => {
    const date = new Date(d)
    return {
      day: date.getDate().toString().padStart(2, '0'),
      month: date.toLocaleString('en', { month: 'short' }).toUpperCase(),
    }
  }

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {events.map((ev, idx) => {
            const { day, month } = formatDate(ev.date)
            return (
              <div
                key={idx}
                className={`flex gap-5 p-5 ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
                style={{ borderLeft: `3px solid ${tint(theme.defaultPrimaryColor, 0.3)}` }}
              >
                {/* Date badge */}
                <div
                  className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center text-white ${radiusClass(theme.cornerRadius)}`}
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  <span className="text-xl font-bold leading-none">{day}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider">
                    {month}
                  </span>
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900">{ev.title}</h3>
                  {ev.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {ev.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
