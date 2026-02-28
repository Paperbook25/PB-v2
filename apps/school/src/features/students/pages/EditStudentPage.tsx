import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { StudentForm, type StudentFormData } from '../components/StudentForm'
import { useStudent, useUpdateStudent } from '../hooks/useStudents'

export function EditStudentPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const { data, isLoading, error } = useStudent(id!)
  const updateStudent = useUpdateStudent()

  const handleSubmit = (formData: StudentFormData) => {
    updateStudent.mutate(
      { id: id!, data: formData },
      {
        onSuccess: () => {
          toast({
            title: 'Student Updated',
            description: `${formData.firstName} ${formData.lastName}'s profile has been updated.`,
          })
          navigate(`/students/${id}`)
        },
        onError: (err) => {
          toast({
            title: 'Error',
            description: err instanceof Error ? err.message : 'Failed to update student',
            variant: 'destructive',
          })
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-lg text-muted-foreground mb-4">Student not found</p>
        <Button onClick={() => navigate('/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
      </div>
    )
  }

  const student = data.data

  // Convert student data to form data format
  const nameParts = student.name.split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''

  const initialData: Partial<StudentFormData> = {
    firstName,
    lastName,
    email: student.email,
    phone: student.phone,
    dateOfBirth: student.dateOfBirth.split('T')[0], // Format date for input
    gender: student.gender as 'male' | 'female' | 'other',
    bloodGroup: student.bloodGroup,
    class: student.class,
    section: student.section,
    rollNumber: student.rollNumber,
    address: student.address,
    parent: student.parent,
  }

  return (
    <div>
      <PageHeader
        title={`Edit ${student.name}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Students', href: '/students' },
          { label: student.name, href: `/students/${id}` },
          { label: 'Edit' },
        ]}
        moduleColor="students"
      />

      <StudentForm
        onSubmit={handleSubmit}
        initialData={initialData}
        isSubmitting={updateStudent.isPending}
        submitLabel="Update Student"
      />
    </div>
  )
}
