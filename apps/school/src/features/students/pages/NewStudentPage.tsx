import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { StudentForm, type StudentFormData } from '../components/StudentForm'
import { useCreateStudent } from '../hooks/useStudents'

export function NewStudentPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const createStudent = useCreateStudent()

  const handleSubmit = (data: StudentFormData) => {
    createStudent.mutate(data, {
      onSuccess: (response) => {
        toast({
          title: 'Student Added',
          description: `${data.firstName} ${data.lastName} has been successfully added.`,
        })
        navigate(`/students/${response.data.id}`)
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to add student',
          variant: 'destructive',
        })
      },
    })
  }

  return (
    <div>
      <PageHeader
        title="Add New Student"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Students', href: '/students' },
          { label: 'New Student' },
        ]}
        moduleColor="students"
      />

      <StudentForm onSubmit={handleSubmit} isSubmitting={createStudent.isPending} submitLabel="Add Student" />
    </div>
  )
}
