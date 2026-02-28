import { useNavigate, useParams } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { StaffForm } from '../components/StaffForm'
import { useStaffMember, useUpdateStaff } from '../hooks/useStaff'
import type { StaffFormData } from '../components/StaffForm/types'

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-full" />
        ))}
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function EditStaffPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data: staffData, isLoading, error } = useStaffMember(id!)
  const updateStaff = useUpdateStaff()

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Edit Staff"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Staff', href: '/staff' },
            { label: 'Edit' },
          ]}
        />
        <LoadingSkeleton />
      </div>
    )
  }

  if (error || !staffData?.data) {
    return (
      <div>
        <PageHeader
          title="Staff Not Found"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Staff', href: '/staff' },
            { label: 'Not Found' },
          ]}
        />
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">The staff member you're looking for doesn't exist.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/staff')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Staff
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const staff = staffData.data

  // Transform staff data to form data format
  const initialData: Partial<StaffFormData> = {
    name: staff.name,
    email: staff.email,
    phone: staff.phone,
    dateOfBirth: staff.dateOfBirth.split('T')[0], // Format date
    gender: staff.gender,
    address: staff.address,
    emergencyContact: staff.emergencyContact || {
      name: '',
      phone: '',
      relationship: '',
    },
    department: staff.department,
    designation: staff.designation,
    joiningDate: staff.joiningDate.split('T')[0], // Format date
    qualification: staff.qualification,
    specialization: staff.specialization,
    salary: staff.salary,
    bankDetails: staff.bankDetails || {
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      accountHolderName: staff.name,
    },
  }

  const handleSubmit = (data: StaffFormData) => {
    updateStaff.mutate(
      { id: id!, data },
      {
        onSuccess: () => {
          toast({
            title: 'Staff Updated',
            description: `${data.name}'s profile has been updated successfully.`,
          })
          navigate(`/staff/${id}`)
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to update staff member',
            variant: 'destructive',
          })
        },
      }
    )
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${staff.name}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Staff', href: '/staff' },
          { label: staff.name, href: `/staff/${id}` },
          { label: 'Edit' },
        ]}
      />

      <StaffForm
        onSubmit={handleSubmit}
        initialData={initialData}
        isSubmitting={updateStaff.isPending}
        submitLabel="Save Changes"
      />
    </div>
  )
}
