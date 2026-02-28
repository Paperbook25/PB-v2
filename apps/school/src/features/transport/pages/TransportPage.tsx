import { PageHeader } from '@/components/layout/PageHeader'
import { RouteManager } from '../components/RouteManager'

export function TransportPage() {
  return (
    <div>
      <PageHeader
        title="Transport Routes"
        description="Manage school bus routes, stops, and assignments"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Transport' }]}
      />
      <RouteManager />
    </div>
  )
}
