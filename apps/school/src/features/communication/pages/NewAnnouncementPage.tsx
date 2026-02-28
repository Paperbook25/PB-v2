import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { useCreateAnnouncement } from '../hooks/useCommunication'
import { AnnouncementForm } from '../components/AnnouncementForm'
import { CreateAnnouncementRequest } from '../types/communication.types'

export function NewAnnouncementPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createMutation = useCreateAnnouncement()

  const handleSubmit = async (data: CreateAnnouncementRequest) => {
    try {
      await createMutation.mutateAsync(data)
      toast({
        title: 'Announcement created',
        description: data.scheduledAt
          ? 'The announcement has been scheduled successfully.'
          : 'The announcement has been saved as a draft.',
      })
      navigate('/communication/announcements')
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create announcement.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="New Announcement"
        description="Create a new announcement for your school community"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Communication', href: '/communication' },
          { label: 'Announcements', href: '/communication/announcements' },
          { label: 'New' },
        ]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Announcement Details</CardTitle>
        </CardHeader>
        <CardContent>
          <AnnouncementForm
            onSubmit={handleSubmit}
            isLoading={createMutation.isPending}
            onCancel={() => navigate('/communication/announcements')}
          />
        </CardContent>
      </Card>
    </div>
  )
}
