import { PageHeader } from '@/components/layout/PageHeader'
import { DigitalLibraryView } from '../components/DigitalLibraryView'

export function DigitalLibraryPage() {
  return (
    <div>
      <PageHeader
        title="Digital Library"
        description="Browse and access e-books, PDFs, and audiobooks"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Library', href: '/library' },
          { label: 'Digital Library' },
        ]}
      />

      <DigitalLibraryView />
    </div>
  )
}
