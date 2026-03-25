import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface SafetyFeature {
  title: string
  description: string
}

interface EmergencyContact {
  label: string
  number: string
}

export function SafetyMinimal({ section, theme }: VariantProps) {
  const features = field<SafetyFeature[]>(section.content, 'features', [])
  const contacts = field<EmergencyContact[]>(section.content, 'emergencyContacts', [])
  const title = section.title || 'Safety & Security'

  const fallbackFeatures: SafetyFeature[] = [
    { title: 'CCTV Surveillance', description: '24/7 CCTV monitoring across campus with centralized control room.' },
    { title: 'Trained Security Staff', description: 'Professional security personnel at all entry and exit points.' },
    { title: 'Fire Safety Systems', description: 'Fire extinguishers, smoke alarms, and regular evacuation drills.' },
    { title: 'GPS-Tracked Transport', description: 'Real-time bus tracking accessible to parents via mobile app.' },
    { title: 'First Aid Centres', description: 'Fully equipped first-aid rooms with trained nursing staff on every floor.' },
    { title: 'Visitor Management', description: 'Digital visitor registration and ID verification before campus entry.' },
  ]

  const fallbackContacts: EmergencyContact[] = [
    { label: 'School Security', number: '+91 98765 00001' },
    { label: 'Medical Emergency', number: '+91 98765 00002' },
  ]

  const displayFeatures = features.length > 0 ? features : fallbackFeatures
  const displayContacts = contacts.length > 0 ? contacts : fallbackContacts

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-4xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        <div className="mt-12 flex flex-col gap-10 lg:flex-row">
          {/* Checklist */}
          <div className="flex-1">
            <ul className="space-y-4">
              {displayFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feat.title}</h3>
                    <p className="mt-0.5 text-sm text-gray-600">{feat.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts sidebar */}
          <div className={`w-full shrink-0 border border-gray-200 p-5 lg:w-60 ${radiusClass(theme.cornerRadius)}`}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Emergency Contacts</h3>
            <ul className="mt-4 space-y-4">
              {displayContacts.map((c, idx) => (
                <li key={idx}>
                  <p className="text-xs text-gray-500">{c.label}</p>
                  <a
                    href={`tel:${c.number.replace(/\s/g, '')}`}
                    className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold"
                    style={{ color: theme.defaultPrimaryColor }}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {c.number}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
