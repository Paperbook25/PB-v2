import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

export function AboutClassic({ section, theme }: VariantProps) {
  const body = field(section.content, 'body', '')
  const image = field(section.content, 'image', '')
  const mission = field(section.content, 'mission', '')
  const vision = field(section.content, 'vision', '')
  const foundedYear = field<number | null>(section.content, 'foundedYear', null)
  const values = field<string[]>(section.content, 'values', [])
  const timeline = field<{ year: string; event: string }[]>(section.content, 'timeline', [])
  const title = section.title || 'About Us'

  const pc = theme.defaultPrimaryColor
  const ac = theme.defaultAccentColor

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-6">
        {/* ===== 2-COLUMN LAYOUT ===== */}
        <div className="grid items-start gap-16 lg:grid-cols-2">

          {/* LEFT: Image with decorative frame */}
          <div className="relative">
            {/* Accent-colored offset shadow */}
            <div
              className={`absolute top-2 left-2 right-[-8px] bottom-[-8px] ${radiusClass(theme.cornerRadius)}`}
              style={{ backgroundColor: `${ac}20`, border: `2px solid ${ac}40` }}
            />

            {image ? (
              <img
                src={image}
                alt={title}
                className={`relative w-full object-cover aspect-[4/3] ${radiusClass(theme.cornerRadius)}`}
                style={{
                  boxShadow: `8px 8px 0px ${ac}`,
                }}
              />
            ) : (
              <div
                className={`relative flex aspect-[4/3] items-center justify-center ${radiusClass(theme.cornerRadius)}`}
                style={{
                  backgroundColor: `${pc}10`,
                  border: `2px dashed ${pc}30`,
                  boxShadow: `8px 8px 0px ${ac}`,
                }}
              >
                <div className="text-center px-8">
                  <svg className="h-16 w-16 mx-auto mb-3 opacity-30" style={{ color: pc }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: `${pc}60` }}>School Image</span>
                </div>
              </div>
            )}

            {/* Founded year badge */}
            {foundedYear && (
              <div
                className={`absolute -bottom-5 -right-4 px-5 py-3 shadow-lg ${radiusClass(theme.cornerRadius)}`}
                style={{ backgroundColor: '#fff', border: `2px solid ${ac}` }}
              >
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: ac }}>
                  Est.
                </span>
                <span className="block text-2xl font-extrabold" style={{ color: pc }}>
                  {foundedYear}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT: Text content */}
          <div>
            {/* Section tag pill */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ backgroundColor: `${ac}12`, color: ac }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: ac }} />
              About Us
            </div>

            <h2
              className="text-3xl font-bold sm:text-4xl lg:text-5xl leading-tight"
              style={{ color: pc }}
            >
              {title}
            </h2>

            {/* Accent bar */}
            <div className="mt-4 mb-6 h-1 w-16 rounded-full" style={{ backgroundColor: ac }} />

            {/* Body text */}
            {body && (
              <p className="text-lg leading-relaxed text-gray-600">{body}</p>
            )}

            {/* Values pills */}
            {values.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {values.map((val, i) => (
                  <span
                    key={i}
                    className={`px-4 py-1.5 text-sm font-medium ${radiusClass('full')}`}
                    style={{ backgroundColor: `${ac}10`, color: ac }}
                  >
                    {val}
                  </span>
                ))}
              </div>
            )}

            {/* Mission / Vision cards */}
            {(mission || vision) && (
              <div className="mt-10 grid gap-5 sm:grid-cols-2">
                {mission && (
                  <div
                    className={`p-6 ${radiusClass(theme.cornerRadius)} border transition-shadow hover:shadow-md`}
                    style={{ borderColor: `${ac}25`, backgroundColor: `${pc}04` }}
                  >
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${ac}12` }}
                    >
                      <svg className="h-5 w-5" style={{ color: ac }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold mb-2" style={{ color: pc }}>
                      Our Mission
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">{mission}</p>
                  </div>
                )}
                {vision && (
                  <div
                    className={`p-6 ${radiusClass(theme.cornerRadius)} border transition-shadow hover:shadow-md`}
                    style={{ borderColor: `${ac}25`, backgroundColor: `${pc}04` }}
                  >
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${ac}12` }}
                    >
                      <svg className="h-5 w-5" style={{ color: ac }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold mb-2" style={{ color: pc }}>
                      Our Vision
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600">{vision}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===== TIMELINE (if available) ===== */}
        {timeline.length > 0 && (
          <div className="mt-20">
            <h3 className="text-2xl font-bold text-center mb-12" style={{ color: pc }}>
              Our Journey
            </h3>
            <div className="relative">
              {/* Vertical connecting line */}
              <div
                className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2"
                style={{ backgroundColor: `${ac}25` }}
              />
              <div className="space-y-10">
                {timeline.map((item, i) => {
                  const isLeft = i % 2 === 0
                  return (
                    <div
                      key={i}
                      className={`relative flex items-start gap-6 md:gap-0 ${
                        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                      }`}
                    >
                      {/* Dot on the line */}
                      <div
                        className="absolute left-4 md:left-1/2 -translate-x-1/2 h-4 w-4 rounded-full border-[3px] z-10"
                        style={{
                          borderColor: ac,
                          backgroundColor: '#fff',
                          boxShadow: `0 0 0 4px ${ac}18`,
                        }}
                      />

                      {/* Content */}
                      <div className={`ml-12 md:ml-0 md:w-1/2 ${isLeft ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                        <span
                          className="inline-block text-sm font-bold mb-1"
                          style={{ color: ac }}
                        >
                          {item.year}
                        </span>
                        <p className="text-gray-700 text-sm leading-relaxed">{item.event}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
