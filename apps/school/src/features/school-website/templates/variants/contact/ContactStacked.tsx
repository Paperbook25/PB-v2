import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, cardClass, field } from '../shared'

export function ContactStacked({ section, theme }: VariantProps) {
  const showMap = field<boolean>(section.content, 'showMap', false)
  const showForm = field<boolean>(section.content, 'showForm', true)
  const mapEmbed = field(section.content, 'mapEmbed', '')
  const additionalInfo = field(section.content, 'additionalInfo', '')
  const title = section.title || 'Contact Us'

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        {/* Info */}
        <div className="mt-10 text-center">
          {additionalInfo ? (
            <p className="text-lg text-gray-600">{additionalInfo}</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-8 text-gray-600">
              <div>
                <p className="text-sm font-semibold text-gray-900">Address</p>
                <p className="mt-1 text-sm">123 School Road, City</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Phone</p>
                <p className="mt-1 text-sm">+91 98765 43210</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Email</p>
                <p className="mt-1 text-sm">info@school.edu</p>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className={`mt-10 p-8 ${cardClass(theme.cardStyle, theme.cornerRadius)}`}>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
              <input
                type="text"
                placeholder="Subject"
                className={`w-full border border-gray-300 px-4 py-2.5 text-sm outline-none ${radiusClass(theme.cornerRadius)}`}
                readOnly
              />
              <textarea
                placeholder="Your Message"
                rows={5}
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

        {/* Map */}
        {showMap && mapEmbed && (
          <div
            className={`mt-10 aspect-video overflow-hidden ${radiusClass(theme.cornerRadius)}`}
            dangerouslySetInnerHTML={{ __html: mapEmbed }}
          />
        )}
      </div>
    </section>
  )
}
