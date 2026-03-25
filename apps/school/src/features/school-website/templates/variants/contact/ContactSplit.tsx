import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, cardClass, field } from '../shared'

export function ContactSplit({ section, theme }: VariantProps) {
  const showMap = field<boolean>(section.content, 'showMap', false)
  const showForm = field<boolean>(section.content, 'showForm', true)
  const mapEmbed = field(section.content, 'mapEmbed', '')
  const additionalInfo = field(section.content, 'additionalInfo', '')
  const title = section.title || 'Contact Us'

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        <div className="mt-12 grid gap-12 md:grid-cols-2">
          {/* Info column */}
          <div>
            {additionalInfo && (
              <p className="text-lg text-gray-600">{additionalInfo}</p>
            )}
            {!additionalInfo && (
              <div className="space-y-6 text-gray-600">
                <div>
                  <h3 className="font-semibold text-gray-900">Address</h3>
                  <p className="mt-1">123 School Road, City, State 123456</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Phone</h3>
                  <p className="mt-1">+91 98765 43210</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="mt-1">info@school.edu</p>
                </div>
              </div>
            )}

            {showMap && mapEmbed && (
              <div
                className={`mt-8 aspect-video overflow-hidden ${radiusClass(theme.cornerRadius)}`}
                dangerouslySetInnerHTML={{ __html: mapEmbed }}
              />
            )}
          </div>

          {/* Form column */}
          {showForm && (
            <div className={`p-8 ${cardClass(theme.cardStyle, theme.cornerRadius)}`}>
              <h3
                className="mb-6 text-lg font-semibold"
                style={{ color: theme.defaultPrimaryColor }}
              >
                Send a Message
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className={`w-full border border-gray-300 px-4 py-2.5 text-sm outline-none ${radiusClass(theme.cornerRadius)}`}
                  readOnly
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className={`w-full border border-gray-300 px-4 py-2.5 text-sm outline-none ${radiusClass(theme.cornerRadius)}`}
                  readOnly
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className={`w-full border border-gray-300 px-4 py-2.5 text-sm outline-none ${radiusClass(theme.cornerRadius)}`}
                  readOnly
                />
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className={`w-full border border-gray-300 px-4 py-2.5 text-sm outline-none ${radiusClass(theme.cornerRadius)}`}
                  readOnly
                />
                <button
                  type="button"
                  className={`w-full px-6 py-2.5 text-sm font-semibold text-white ${radiusClass(theme.cornerRadius)}`}
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  Send Message
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
