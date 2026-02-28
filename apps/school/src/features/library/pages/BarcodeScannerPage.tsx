import { PageHeader } from '@/components/layout/PageHeader'
import { BarcodeScannerView } from '../components/BarcodeScannerView'

export function BarcodeScannerPage() {
  return (
    <div>
      <PageHeader
        title="Barcode Scanner"
        description="Scan book barcodes for quick lookup, issue, and return"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Library', href: '/library' },
          { label: 'Scanner' },
        ]}
      />

      <BarcodeScannerView />
    </div>
  )
}
