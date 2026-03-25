import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, radiusClass, field } from '../shared'

interface TransportRoute {
  name: string
  areas: string[]
  timing: string
  vehicleType: string
}

export function TransportCards({ section, theme }: VariantProps) {
  const routes = field<TransportRoute[]>(section.content, 'routes', [])
  const features = field<string[]>(section.content, 'features', [])
  const contactNumber = field(section.content, 'contactNumber', '')
  const title = section.title || 'Transport Facilities'

  const fallbackRoutes: TransportRoute[] = [
    { name: 'Route 1 — North Zone', areas: ['Sector 15', 'Sector 22', 'Model Town', 'Civil Lines'], timing: '7:00 AM / 3:30 PM', vehicleType: 'AC Bus' },
    { name: 'Route 2 — South Zone', areas: ['Green Park', 'Saket', 'Vasant Kunj'], timing: '7:15 AM / 3:30 PM', vehicleType: 'Non-AC Bus' },
    { name: 'Route 3 — East Zone', areas: ['Preet Vihar', 'Laxmi Nagar', 'Karkardooma', 'Anand Vihar'], timing: '6:45 AM / 3:30 PM', vehicleType: 'AC Bus' },
  ]

  const fallbackFeatures = ['GPS-tracked vehicles', 'Trained attendants', 'CCTV surveillance', 'First-aid kit on board']
  const displayRoutes = routes.length > 0 ? routes : fallbackRoutes
  const displayFeatures = features.length > 0 ? features : fallbackFeatures
  const displayContact = contactNumber || '+91 98765 43210'

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayRoutes.map((route, idx) => (
            <div key={idx} className={`flex flex-col p-6 ${cardClass(theme.cardStyle, theme.cornerRadius)}`}>
              <h3 className="text-lg font-semibold text-gray-900">{route.name}</h3>

              {/* Area pills */}
              <div className="mt-3 flex flex-wrap gap-1.5 overflow-x-auto">
                {route.areas.map((area, aIdx) => (
                  <span
                    key={aIdx}
                    className={`inline-block px-2.5 py-0.5 text-xs font-medium text-white ${radiusClass(theme.cornerRadius)}`}
                    style={{ backgroundColor: theme.defaultAccentColor }}
                  >
                    {area}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <span>{route.timing}</span>
                <span
                  className={`px-2 py-0.5 text-xs font-medium ${radiusClass(theme.cornerRadius)}`}
                  style={{
                    backgroundColor: `${theme.defaultPrimaryColor}10`,
                    color: theme.defaultPrimaryColor,
                  }}
                >
                  {route.vehicleType}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Features strip + contact */}
        <div
          className={`mt-10 flex flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row ${radiusClass(theme.cornerRadius)}`}
          style={{ backgroundColor: `${theme.defaultPrimaryColor}08` }}
        >
          <div className="flex flex-wrap items-center gap-4">
            {displayFeatures.map((feat, idx) => (
              <span key={idx} className="flex items-center gap-1.5 text-sm text-gray-700">
                <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {feat}
              </span>
            ))}
          </div>
          <a
            href={`tel:${displayContact.replace(/\s/g, '')}`}
            className="flex shrink-0 items-center gap-1.5 text-sm font-semibold"
            style={{ color: theme.defaultPrimaryColor }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {displayContact}
          </a>
        </div>
      </div>
    </section>
  )
}
