import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Assignment, CreateAssignmentRequest } from '../types/lms.types'

// ==================== SCHEMA ====================

const assignmentFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  courseId: z.string().min(1, 'Course is required'),
  lessonId: z.string(),
  instructions: z.string().min(1, 'Instructions are required'),
  maxScore: z.coerce.number().min(1, 'Max score must be at least 1'),
  dueDate: z.string().min(1, 'Due date is required'),
})

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>

// ==================== PROPS ====================

interface AssignmentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Partial<Assignment>
  onSubmit: (data: CreateAssignmentRequest) => void
  isLoading?: boolean
  courses: { id: string; title: string }[]
}

// ==================== COMPONENT ====================

export function AssignmentForm({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isLoading,
  courses,
}: AssignmentFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      courseId: defaultValues?.courseId ?? '',
      lessonId: defaultValues?.lessonId ?? '',
      instructions: defaultValues?.instructions ?? '',
      maxScore: defaultValues?.maxScore ?? 100,
      dueDate: defaultValues?.dueDate
        ? defaultValues.dueDate.split('T')[0]
        : '',
    },
  })

  const selectedCourseId = watch('courseId')

  const handleFormSubmit = (values: AssignmentFormValues) => {
    onSubmit({
      title: values.title,
      courseId: values.courseId,
      lessonId: values.lessonId,
      instructions: values.instructions,
      maxScore: values.maxScore,
      dueDate: values.dueDate,
    })
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      reset()
    }
    onOpenChange(value)
  }

  const isEditing = !!defaultValues?.id

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Assignment' : 'Create Assignment'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 py-2"
        >
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="assignment-title">Title</Label>
            <Input
              id="assignment-title"
              placeholder="Enter assignment title"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Course & Lesson row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Course</Label>
              <Select
                value={selectedCourseId}
                onValueChange={(value) => setValue('courseId', value)}
              >
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
              {errors.courseId && (
                <p className="text-sm text-destructive">
                  {errors.courseId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment-lessonId">Lesson ID</Label>
              <Input
                id="assignment-lessonId"
                placeholder="Enter lesson ID"
                {...register('lessonId')}
              />
              {errors.lessonId && (
                <p className="text-sm text-destructive">
                  {errors.lessonId.message}
                </p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="assignment-instructions">Instructions</Label>
            <Textarea
              id="assignment-instructions"
              placeholder="Enter assignment instructions"
              rows={4}
              {...register('instructions')}
            />
            {errors.instructions && (
              <p className="text-sm text-destructive">
                {errors.instructions.message}
              </p>
            )}
          </div>

          {/* Max Score & Due Date row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignment-maxScore">Max Score</Label>
              <Input
                id="assignment-maxScore"
                type="number"
                min={1}
                placeholder="100"
                {...register('maxScore')}
              />
              {errors.maxScore && (
                <p className="text-sm text-destructive">
                  {errors.maxScore.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment-dueDate">Due Date</Label>
              <Input
                id="assignment-dueDate"
                type="date"
                {...register('dueDate')}
              />
              {errors.dueDate && (
                <p className="text-sm text-destructive">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Saving...'
                : isEditing
                  ? 'Update Assignment'
                  : 'Create Assignment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
