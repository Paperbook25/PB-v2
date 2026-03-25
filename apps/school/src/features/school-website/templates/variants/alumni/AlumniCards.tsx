import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, radiusClass, field } from '../shared'

interface AlumniItem {
  name: string
  batch: string
  photo: string
  role: string
  achievement: string
  testimonial: string
  profileUrl?: string
}

export function AlumniCards({ section, theme }: VariantProps) {
  const items = field<AlumniItem[]>(section.content, 'items', [])
  const title = section.title || 'Our Alumni'

  const fallbackItems: AlumniItem[] = [
    { name: 'Priya Sharma', batch: '2015', photo: '', role: 'Software Engineer at Google', achievement: 'Built accessibility tools used by millions', testimonial: 'The foundation I received here shaped my entire career trajectory.' },
    { name: 'Rahul Verma', batch: '2013', photo: '', role: 'Civil Services (IAS)', achievement: 'District Collector at 28', testimonial: 'The values and discipline instilled here stay with me every day.' },
    { name: 'Ananya Patel', batch: '2018', photo: '', role: 'Research Scholar at MIT', achievement: 'Published 5 papers in quantum computing', testimonial: 'The science labs and mentorship programme were truly exceptional.' },
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
            <div key={idx} className={`flex flex-col overflow-hidden ${cardClass(theme.cardStyle, theme.cornerRadius)}`}>
              {/* Photo */}
              {item.photo ? (
                <img src={item.photo} alt={item.name} className="aspect-square w-full object-cover" />
              ) : (
                <div
                  className="flex aspect-square items-center justify-center text-4xl font-bold text-white/50"
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  {item.name.charAt(0)}
                </div>
              )}

              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium text-white ${radiusClass(theme.cornerRadius)}`}
                    style={{ backgroundColor: theme.defaultAccentColor }}
                  >
                    Batch {item.batch}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{item.role}</p>
                <p className="mt-2 text-sm font-medium text-gray-700">{item.achievement}</p>
                <p className="mt-3 flex-1 text-sm italic text-gray-500">
                  &ldquo;{item.testimonial}&rdquo;
                </p>
                {item.profileUrl && (
                  <a
                    href={item.profileUrl}
                    className="mt-4 text-sm font-medium"
                    style={{ color: theme.defaultPrimaryColor }}
                  >
                    View full profile &rarr;
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
