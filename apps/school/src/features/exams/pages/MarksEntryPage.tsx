import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { MarksEntryGrid } from '../components/MarksEntryGrid'
import { useExam, useStudentsForMarksEntry, useSubmitMarks } from '../hooks/useExams'
import { EXAM_TYPE_LABELS } from '../types/exams.types'
import type { Subject, MarksEntryStudent } from '../types/exams.types'

export function MarksEntryPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSection, setSelectedSection] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)

  const { data: examData, isLoading: examLoading } = useExam(id!)
  const exam = examData?.data

  const { data: studentsData, isLoading: studentsLoading } = useStudentsForMarksEntry(
    id!,
    selectedSubject?.id || '',
    selectedClass,
    selectedSection
  )
  const submitMarks = useSubmitMarks()

  // Set default class and subject when exam loads
  useEffect(() => {
    if (exam && exam.applicableClasses.length > 0 && !selectedClass) {
      setSelectedClass(exam.applicableClasses[0])
    }
    if (exam && exam.subjects.length > 0 && !selectedSubject) {
      setSelectedSubject(exam.subjects[0])
    }
  }, [exam, selectedClass, selectedSubject])

  // Set default section
  useEffect(() => {
    if (!selectedSection) {
      setSelectedSection('A')
    }
  }, [selectedSection])

  const handleSubjectChange = (subjectId: string) => {
    const subject = exam?.subjects.find((s) => s.id === subjectId)
    if (subject) {
      setSelectedSubject(subject)
    }
  }

  const handleSubmitMarks = async (
    marks: { studentId: string; marksObtained: number; isAbsent: boolean; remarks?: string }[]
  ) => {
    if (!selectedSubject) return

    try {
      await submitMarks.mutateAsync({
        examId: id!,
        subjectId: selectedSubject.id,
        className: selectedClass,
        section: selectedSection,
        marks,
      })
      toast({
        title: 'Marks Saved',
        description: 'The marks have been saved successfully.',
      })
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save marks. Please try again.',
        variant: 'destructive',
      })
    }
  }

  if (examLoading) {
    return (
      <div>
        <PageHeader
          title="Loading..."
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Exams', href: '/exams' },
            { label: '...', href: `/exams/${id}` },
            { label: 'Marks Entry' },
          ]}
        />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div>
        <PageHeader
          title="Exam Not Found"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Exams', href: '/exams' },
            { label: 'Not Found' },
          ]}
        />
        <div className="mt-6 text-center py-12 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Exam not found</h3>
          <p className="mb-4">The exam you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/exams')}>Back to Exams</Button>
        </div>
      </div>
    )
  }

  // Check if marks entry is allowed
  if (exam.status !== 'ongoing' && exam.status !== 'completed') {
    return (
      <div>
        <PageHeader
          title={exam.name}
          description="Marks Entry"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Exams', href: '/exams' },
            { label: exam.name, href: `/exams/${id}` },
            { label: 'Marks Entry' },
          ]}
          actions={
            <Button variant="outline" onClick={() => navigate(`/exams/${id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exam
            </Button>
          }
        />
        <div className="mt-6 text-center py-12 text-muted-foreground border rounded-lg">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Marks Entry Not Available</h3>
          <p className="mb-4">
            Marks can only be entered for exams that are ongoing or completed.
            <br />
            Current status: <strong>{exam.status}</strong>
          </p>
          <Button onClick={() => navigate(`/exams/${id}`)}>View Exam Details</Button>
        </div>
      </div>
    )
  }

  // Transform marks data to students format
  const students: MarksEntryStudent[] = studentsData?.data || []

  return (
    <div>
      <PageHeader
        title={`${exam.name} - Marks Entry`}
        description={`${EXAM_TYPE_LABELS[exam.type]} - ${exam.academicYear}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Exams', href: '/exams' },
          { label: exam.name, href: `/exams/${id}` },
          { label: 'Marks Entry' },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate(`/exams/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Exam
          </Button>
        }
      />

      <div className="mt-6">
        <MarksEntryGrid
          exam={exam}
          students={students}
          selectedSubject={selectedSubject}
          selectedClass={selectedClass}
          selectedSection={selectedSection}
          onClassChange={setSelectedClass}
          onSectionChange={setSelectedSection}
          onSubjectChange={handleSubjectChange}
          onSubmit={handleSubmitMarks}
          isLoading={studentsLoading}
          isSubmitting={submitMarks.isPending}
        />
      </div>
    </div>
  )
}
