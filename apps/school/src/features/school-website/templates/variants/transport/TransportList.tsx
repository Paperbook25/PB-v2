import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface TransportRoute {
  name: string
  areas: string[]
  timing: string
  vehicleType: string
}

export function TransportList({ section, theme }: VariantProps) {
  const routes = field<TransportRoute[]>(section.content, 'routes', [])
  const features = field<string[]>(section.content, 'features', [])
  const contactNumber = field(section.content, 'contactNumber', '')
  const title = section.title || 'Transport Facilities'

  const fallbackRoutes: TransportRoute[] = [
    { name: 'Route 1 — North Zone', areas: ['Sector 15', 'Sector 22', 'Model Town'], timing: '7:00 AM / 3:30 PM', vehicleType: 'AC Bus' },
    { name: 'Route 2 — South Zone', areas: ['Green Park', 'Saket', 'Vasant Kunj'], timing: '7:15 AM / 3:30 PM', vehicleType: 'Non-AC Bus' },
    { name: 'Route 3 — East Zone', areas: ['Preet Vihar', 'Laxmi Nagar', 'Anand Vihar'], timing: '6:45 AM / 3:30 PM', vehicleType: 'AC Bus' },
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

        <div className="mt-12 flex flex-col gap-8 lg:flex-row">
          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr
                  className="text-xs uppercase tracking-wider text-white"
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  <th className={`px-4 py-3 font-semibold first:${radiusClass(theme.cornerRadius).replace('rounded', 'rounded-tl')}`}>Route</th>
                  <th className="px-4 py-3 font-semibold">Areas Covered</th>
                  <th className="px-4 py-3 font-semibold">Timing</th>
                  <th className={`px-4 py-3 font-semibold last:${radiusClass(theme.cornerRadius).replace('rounded', 'rounded-tr')}`}>Vehicle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayRoutes.map((route, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{route.name}</td>
                    <td className="px-4 py-3 text-gray-600">{route.areas.join(', ')}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">{route.timing}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium ${radiusClass(theme.cornerRadius)}`}
                        style={{
                          backgroundColor: `${theme.defaultAccentColor}15`,
                          color: theme.defaultAccentColor,
                        }}
                      >
                        {route.vehicleType}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sidebar: features + contact */}
          <div className={`w-full shrink-0 border border-gray-200 p-5 lg:w-64 ${radiusClass(theme.cornerRadius)}`}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Features</h3>
            <ul className="mt-3 space-y-2">
              {displayFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {feat}
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Emergency Contact</h3>
              <a
                href={`tel:${displayContact.replace(/\s/g, '')}`}
                className="mt-2 flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: theme.defaultPrimaryColor }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {displayContact}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
