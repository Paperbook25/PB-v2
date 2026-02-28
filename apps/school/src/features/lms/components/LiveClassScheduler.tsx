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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCourses, useInstructors } from '../hooks/useLms'
import type { CreateLiveClassRequest, LiveClass } from '../types/lms.types'

interface LiveClassSchedulerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Partial<LiveClass>
  onSubmit: (data: CreateLiveClassRequest) => void
  isLoading?: boolean
}

const liveClassSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  courseId: z.string().min(1, 'Course is required'),
  instructorId: z.string().min(1, 'Instructor is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.coerce.number().min(1, 'Duration must be at least 1 minute'),
  meetingLink: z.string().url('Must be a valid URL'),
  meetingId: z.string().optional(),
  meetingPassword: z.string().optional(),
})

type LiveClassFormValues = z.infer<typeof liveClassSchema>

function getDefaultFormValues(
  defaultValues?: Partial<LiveClass>
): Partial<LiveClassFormValues> {
  if (!defaultValues) return { duration: 60 }

  let date = ''
  let time = ''
  if (defaultValues.scheduledAt) {
    const dt = new Date(defaultValues.scheduledAt)
    date = dt.toISOString().slice(0, 10)
    time = dt.toTimeString().slice(0, 5)
  }

  return {
    title: defaultValues.title ?? '',
    courseId: defaultValues.courseId ?? '',
    instructorId: defaultValues.instructorId ?? '',
    date,
    time,
    duration: defaultValues.duration ?? 60,
    meetingLink: defaultValues.meetingLink ?? '',
    meetingId: defaultValues.meetingId ?? '',
    meetingPassword: defaultValues.meetingPassword ?? '',
  }
}

export function LiveClassScheduler({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isLoading,
}: LiveClassSchedulerProps) {
  const { data: coursesResult } = useCourses({ limit: 100 })
  const { data: instructorsResult } = useInstructors()

  const courses = coursesResult?.data ?? []
  const instructors = instructorsResult?.data ?? []

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<LiveClassFormValues>({
    resolver: zodResolver(liveClassSchema),
    defaultValues: getDefaultFormValues(defaultValues),
  })

  const selectedCourseId = watch('courseId')
  const selectedInstructorId = watch('instructorId')

  const handleFormSubmit = (values: LiveClassFormValues) => {
    const scheduledAt = new Date(`${values.date}T${values.time}`).toISOString()

    const request: CreateLiveClassRequest = {
      title: values.title,
      courseId: values.courseId,
      instructorId: values.instructorId,
      scheduledAt,
      duration: values.duration,
      meetingLink: values.meetingLink,
      meetingId: values.meetingId || undefined,
      meetingPassword: values.meetingPassword || undefined,
    }

    onSubmit(request)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? 'Edit Live Class' : 'Schedule Live Class'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
        >
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter class title"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Course */}
          <div className="space-y-2">
            <Label htmlFor="courseId">Course</Label>
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

          {/* Instructor */}
          <div className="space-y-2">
            <Label htmlFor="instructorId">Instructor</Label>
            <Select
              value={selectedInstructorId}
              onValueChange={(value) => setValue('instructorId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select instructor" />
              </SelectTrigger>
              <SelectContent>
                {instructors.map((instructor) => (
                  <SelectItem key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.instructorId && (
              <p className="text-sm text-destructive">
                {errors.instructorId.message}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && (
                <p className="text-sm text-destructive">
                  {errors.date.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" {...register('time')} />
              {errors.time && (
                <p className="text-sm text-destructive">
                  {errors.time.message}
                </p>
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              placeholder="60"
              {...register('duration')}
            />
            {errors.duration && (
              <p className="text-sm text-destructive">
                {errors.duration.message}
              </p>
            )}
          </div>

          {/* Meeting Link */}
          <div className="space-y-2">
            <Label htmlFor="meetingLink">Meeting Link</Label>
            <Input
              id="meetingLink"
              type="url"
              placeholder="https://meet.google.com/..."
              {...register('meetingLink')}
            />
            {errors.meetingLink && (
              <p className="text-sm text-destructive">
                {errors.meetingLink.message}
              </p>
            )}
          </div>

          {/* Meeting ID and Password (optional) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meetingId">Meeting ID (optional)</Label>
              <Input
                id="meetingId"
                placeholder="Meeting ID"
                {...register('meetingId')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meetingPassword">Password (optional)</Label>
              <Input
                id="meetingPassword"
                type="password"
                placeholder="Password"
                {...register('meetingPassword')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? 'Saving...'
                : defaultValues
                  ? 'Update Class'
                  : 'Schedule Class'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
