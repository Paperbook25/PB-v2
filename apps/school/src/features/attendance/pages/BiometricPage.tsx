import { PageHeader } from '@/components/layout/PageHeader'
import { BiometricDeviceManager } from '../components/BiometricDeviceManager'

export function BiometricPage() {
  return (
    <div>
      <PageHeader
        title="Biometric Devices"
        description="Manage biometric attendance devices and sync logs"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Attendance', href: '/attendance' },
          { label: 'Biometric Devices' },
        ]}
      />

      <BiometricDeviceManager />
    </div>
  )
}
