import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface AlumniItem {
  name: string
  batch: string
  photo: string
  role: string
  achievement: string
  testimonial: string
}

export function AlumniCarousel({ section, theme }: VariantProps) {
  const items = field<AlumniItem[]>(section.content, 'items', [])
  const title = section.title || 'Our Alumni'

  const fallbackItems: AlumniItem[] = [
    { name: 'Priya Sharma', batch: '2015', photo: '', role: 'Software Engineer at Google', achievement: 'Built accessibility tools used by millions', testimonial: 'The foundation I received here shaped my entire career trajectory.' },
    { name: 'Rahul Verma', batch: '2013', photo: '', role: 'Civil Services (IAS)', achievement: 'District Collector at 28', testimonial: 'The values and discipline instilled here stay with me every day.' },
    { name: 'Ananya Patel', batch: '2018', photo: '', role: 'Research Scholar at MIT', achievement: 'Published 5 papers in quantum computing', testimonial: 'The science labs and mentorship programme were truly exceptional.' },
    { name: 'Vikram Singh', batch: '2016', photo: '', role: 'Founder, EduTech Startup', achievement: 'Raised $10M in Series A funding', testimonial: 'The entrepreneurial spirit was nurtured right from school days.' },
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

        {/* Horizontal scroll carousel with snap */}
        <div className="mt-12 -mx-6 px-6 overflow-x-auto">
          <div className="flex gap-6 snap-x snap-mandatory pb-4" style={{ scrollSnapType: 'x mandatory' }}>
            {displayItems.map((item, idx) => (
              <div
                key={idx}
                className={`flex w-[85vw] max-w-2xl shrink-0 snap-center overflow-hidden border border-gray-200 sm:w-[600px] ${radiusClass(theme.cornerRadius)}`}
              >
                {/* Photo left */}
                <div className="hidden w-48 shrink-0 sm:block">
                  {item.photo ? (
                    <img src={item.photo} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-4xl font-bold text-white/50"
                      style={{ backgroundColor: theme.defaultPrimaryColor }}
                    >
                      {item.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Details right */}
                <div className="flex flex-1 flex-col justify-center p-6">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium text-white ${radiusClass(theme.cornerRadius)}`}
                      style={{ backgroundColor: theme.defaultAccentColor }}
                    >
                      {item.batch}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{item.role}</p>
                  <p className="mt-2 text-sm font-medium text-gray-700">{item.achievement}</p>
                  <p className="mt-3 text-sm italic text-gray-500">
                    &ldquo;{item.testimonial}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
