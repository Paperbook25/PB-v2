import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, radiusClass, field } from '../shared'

interface SafetyFeature {
  title: string
  description: string
  icon?: string
}

interface EmergencyContact {
  label: string
  number: string
}

export function SafetyGrid({ section, theme }: VariantProps) {
  const features = field<SafetyFeature[]>(section.content, 'features', [])
  const contacts = field<EmergencyContact[]>(section.content, 'emergencyContacts', [])
  const title = section.title || 'Safety & Security'

  const fallbackFeatures: SafetyFeature[] = [
    { title: 'CCTV Surveillance', description: '24/7 CCTV monitoring across campus with centralized control room.' },
    { title: 'Trained Security Staff', description: 'Professional security personnel at all entry/exit points.' },
    { title: 'Fire Safety', description: 'Fire extinguishers, alarms, and regular evacuation drills.' },
    { title: 'GPS-Tracked Transport', description: 'Real-time tracking of all school buses with parent app access.' },
    { title: 'First Aid Centres', description: 'Fully equipped first-aid rooms with trained nursing staff.' },
    { title: 'Visitor Management', description: 'Digital visitor registration and ID verification system.' },
  ]

  const fallbackContacts: EmergencyContact[] = [
    { label: 'School Security', number: '+91 98765 00001' },
    { label: 'Medical Emergency', number: '+91 98765 00002' },
  ]

  const displayFeatures = features.length > 0 ? features : fallbackFeatures
  const displayContacts = contacts.length > 0 ? contacts : fallbackContacts

  // Map feature to a simple icon based on title keywords
  const featureIcon = (feat: SafetyFeature) => {
    const t = feat.title.toLowerCase()
    if (t.includes('cctv') || t.includes('surveillance')) {
      return (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }
    if (t.includes('fire')) {
      return (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 003.75-3.75c0-2.363-3.75-6-3.75-6s-3.75 3.637-3.75 6A3.75 3.75 0 0012 18z" />
        </svg>
      )
    }
    if (t.includes('gps') || t.includes('transport')) {
      return (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      )
    }
    if (t.includes('first aid') || t.includes('medical')) {
      return (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      )
    }
    // Default: shield
    return (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    )
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

        {/* Icon-card grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayFeatures.map((feat, idx) => (
            <div key={idx} className={`flex flex-col items-center p-6 text-center ${cardClass(theme.cardStyle, theme.cornerRadius)}`}>
              <div style={{ color: theme.defaultPrimaryColor }}>{featureIcon(feat)}</div>
              <h3 className="mt-4 font-semibold text-gray-900">{feat.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{feat.description}</p>
            </div>
          ))}
        </div>

        {/* Emergency contact strip */}
        <div
          className={`mt-10 flex flex-col items-center justify-center gap-4 px-6 py-4 sm:flex-row sm:gap-8 ${radiusClass(theme.cornerRadius)}`}
          style={{ backgroundColor: `${theme.defaultPrimaryColor}08` }}
        >
          {displayContacts.map((c, idx) => (
            <a
              key={idx}
              href={`tel:${c.number.replace(/\s/g, '')}`}
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: theme.defaultPrimaryColor }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {c.label}: {c.number}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
