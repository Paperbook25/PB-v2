import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { StaffForm } from '../components/StaffForm'
import { useCreateStaff } from '../hooks/useStaff'
import type { StaffFormData } from '../components/StaffForm/types'

export function NewStaffPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createStaff = useCreateStaff()

  const handleSubmit = (data: StaffFormData) => {
    createStaff.mutate(data, {
      onSuccess: (response) => {
        toast({
          title: 'Staff Member Added',
          description: `${data.name} has been successfully added to the staff.`,
        })
        navigate(`/staff/${response.data.id}`)
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to add staff member',
          variant: 'destructive',
        })
      },
    })
  }

  return (
    <div>
      <PageHeader
        title="Add New Staff"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Staff', href: '/staff' },
          { label: 'New Staff' },
        ]}
      />

      <StaffForm onSubmit={handleSubmit} isSubmitting={createStaff.isPending} submitLabel="Add Staff Member" />
    </div>
  )
}
