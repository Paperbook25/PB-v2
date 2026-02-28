import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCourses } from '../hooks/useLms'

interface EnrollmentManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { courseId: string; studentId: string }) => void
  isLoading?: boolean
}

export function EnrollmentManager({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: EnrollmentManagerProps) {
  const [courseId, setCourseId] = useState('')
  const [studentId, setStudentId] = useState('')

  const { data: coursesResult } = useCourses({ limit: 100 })
  const courses = coursesResult?.data ?? []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId || !studentId) return

    onSubmit({ courseId, studentId })
    setCourseId('')
    setStudentId('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enroll Student</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course */}
          <div className="space-y-2">
            <Label htmlFor="enroll-courseId">Course</Label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Student ID */}
          <div className="space-y-2">
            <Label htmlFor="enroll-studentId">Student ID</Label>
            <Input
              id="enroll-studentId"
              placeholder="Enter student ID"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !courseId || !studentId}
            >
              {isLoading ? 'Enrolling...' : 'Enroll Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
