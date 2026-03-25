import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, cardClass, field } from '../shared'

export function AdmissionsForm({ section, theme }: VariantProps) {
  const body = field(section.content, 'body', 'Fill out the form below to start your application.')
  const title = section.title || 'Apply for Admission'

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-start gap-12 md:grid-cols-2">
          {/* Info */}
          <div>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ color: theme.defaultPrimaryColor }}
            >
              {title}
            </h2>
            {body && (
              <p className="mt-4 text-lg text-gray-600">{body}</p>
            )}

            <ul className="mt-8 space-y-3 text-gray-700">
              <li className="flex items-start gap-2">
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: theme.defaultAccentColor }}
                />
                Limited seats available — apply early
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: theme.defaultAccentColor }}
                />
                Entrance test details will be shared via email
              </li>
              <li className="flex items-start gap-2">
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: theme.defaultAccentColor }}
                />
                Documents required: Previous marksheet, ID proof
              </li>
            </ul>
          </div>

          {/* Form placeholder */}
          <div className={`p-8 ${cardClass(theme.cardStyle, theme.cornerRadius)}`}>
            <p className="mb-6 text-sm font-medium text-gray-500">
              {/* This placeholder will be replaced by EmbeddedAdmissionForm */}
              Quick Enquiry
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Student Name"
                className={`w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-current ${radiusClass(theme.cornerRadius)}`}
                readOnly
              />
              <input
                type="text"
                placeholder="Class Applying For"
                className={`w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-current ${radiusClass(theme.cornerRadius)}`}
                readOnly
              />
              <input
                type="tel"
                placeholder="Parent Phone"
                className={`w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-current ${radiusClass(theme.cornerRadius)}`}
                readOnly
              />
              <input
                type="email"
                placeholder="Email Address"
                className={`w-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-current ${radiusClass(theme.cornerRadius)}`}
                readOnly
              />
              <button
                type="button"
                className={`w-full px-6 py-2.5 text-sm font-semibold text-white ${radiusClass(theme.cornerRadius)}`}
                style={{ backgroundColor: theme.defaultPrimaryColor }}
              >
                Submit Enquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
