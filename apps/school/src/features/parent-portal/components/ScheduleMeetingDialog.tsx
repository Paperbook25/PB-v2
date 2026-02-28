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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useScheduleMeeting } from '../hooks/useParentPortal'
import { useToast } from '@/hooks/use-toast'
import type { MeetingType } from '../types/parent-portal.types'

const formSchema = z.object({
  studentId: z.string().min(1, 'Student is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  type: z.enum(['ptm', 'academic', 'disciplinary', 'counseling', 'other']),
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.number().min(15).max(120),
  venue: z.string().optional(),
  meetingLink: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

// Mock data
const STUDENTS = [
  { id: 'STU001', name: 'Arjun Sharma', class: 'Class 10', section: 'A' },
  { id: 'STU002', name: 'Priya Patel', class: 'Class 9', section: 'B' },
  { id: 'STU003', name: 'Rahul Gupta', class: 'Class 8', section: 'A' },
]

const TEACHERS = [
  { id: 'TCH001', name: 'Dr. Ramesh Krishnamurthy', subject: 'Mathematics' },
  { id: 'TCH002', name: 'Prof. Sunita Venkataraman', subject: 'Science' },
  { id: 'TCH003', name: 'Meenakshi Iyer', subject: 'English' },
]

const MEETING_TYPES: { value: MeetingType; label: string }[] = [
  { value: 'ptm', label: 'Parent-Teacher Meeting' },
  { value: 'academic', label: 'Academic Discussion' },
  { value: 'disciplinary', label: 'Disciplinary Matter' },
  { value: 'counseling', label: 'Counseling Session' },
  { value: 'other', label: 'Other' },
]

const DURATIONS = [15, 30, 45, 60, 90, 120]

interface ScheduleMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentId: string
  parentName: string
  onSuccess?: () => void
}

export function ScheduleMeetingDialog({
  open,
  onOpenChange,
  parentId,
  parentName,
  onSuccess,
}: ScheduleMeetingDialogProps) {
  const { toast } = useToast()
  const scheduleMutation = useScheduleMeeting()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
      teacherId: '',
      type: 'academic',
      subject: '',
      description: '',
      date: '',
      time: '',
      duration: 30,
      venue: '',
      meetingLink: '',
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      const student = STUDENTS.find((s) => s.id === data.studentId)
      const teacher = TEACHERS.find((t) => t.id === data.teacherId)

      await scheduleMutation.mutateAsync({
        studentId: data.studentId,
        studentName: student?.name,
        studentClass: student?.class,
        studentSection: student?.section,
        teacherId: data.teacherId,
        teacherName: teacher?.name,
        parentId,
        parentName,
        type: data.type,
        subject: data.subject,
        description: data.description,
        scheduledAt: `${data.date}T${data.time}:00`,
        duration: data.duration,
        venue: data.venue,
        meetingLink: data.meetingLink,
      })

      toast({
        title: 'Meeting Scheduled',
        description: 'Your meeting request has been submitted.',
      })

      onOpenChange(false)
      onSuccess?.()
      form.reset()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to schedule meeting.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule a Meeting</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STUDENTS.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} ({student.class})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TEACHERS.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MEETING_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Academic Progress Discussion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes or agenda items..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(parseInt(v))}
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DURATIONS.map((d) => (
                          <SelectItem key={d} value={String(d)}>
                            {d} min
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Venue (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Room 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={scheduleMutation.isPending}>
                Schedule Meeting
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
