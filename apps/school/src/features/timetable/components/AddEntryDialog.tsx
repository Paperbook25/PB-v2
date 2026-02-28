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
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSubjects, useRooms, useCreateTimetableEntry } from '../hooks/useTimetable'
import { useToast } from '@/hooks/use-toast'
import type { DayOfWeek } from '../types/timetable.types'
import { DAYS_OF_WEEK } from '../types/timetable.types'

const formSchema = z.object({
  subjectId: z.string().min(1, 'Subject is required'),
  teacherId: z.string().min(1, 'Teacher is required'),
  roomId: z.string().min(1, 'Room is required'),
})

type FormData = z.infer<typeof formSchema>

// Mock teachers - in real app, fetch from API
const TEACHERS = [
  { id: 'TCH001', name: 'Dr. Ramesh Krishnamurthy' },
  { id: 'TCH002', name: 'Prof. Sunita Venkataraman' },
  { id: 'TCH003', name: 'Dr. Anil Bhattacharya' },
  { id: 'TCH004', name: 'Meenakshi Iyer' },
  { id: 'TCH005', name: 'Dr. Suresh Narayanan' },
  { id: 'TCH006', name: 'Kavitha Raghavan' },
  { id: 'TCH007', name: 'Rajesh Tiwari' },
  { id: 'TCH008', name: 'Deepa Kulkarni' },
  { id: 'TCH009', name: 'Amit Sharma' },
  { id: 'TCH010', name: 'Priya Mehta' },
]

interface AddEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timetableId: string
  day: DayOfWeek
  periodId: string
  periodName: string
  onSuccess?: () => void
}

export function AddEntryDialog({
  open,
  onOpenChange,
  timetableId,
  day,
  periodId,
  periodName,
  onSuccess,
}: AddEntryDialogProps) {
  const { toast } = useToast()
  const { data: subjectsResult } = useSubjects()
  const { data: roomsResult } = useRooms()
  const createMutation = useCreateTimetableEntry()

  const subjects = subjectsResult?.data ?? []
  const rooms = roomsResult?.data ?? []

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subjectId: '',
      teacherId: '',
      roomId: '',
    },
  })

  const dayLabel = DAYS_OF_WEEK.find((d) => d.value === day)?.label || day

  const onSubmit = async (data: FormData) => {
    try {
      await createMutation.mutateAsync({
        timetableId,
        data: {
          day,
          periodId,
          subjectId: data.subjectId,
          teacherId: data.teacherId,
          roomId: data.roomId,
        },
      })

      toast({
        title: 'Entry Added',
        description: `Period assigned for ${dayLabel} - ${periodName}`,
      })

      onOpenChange(false)
      onSuccess?.()
      form.reset()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add entry. There might be a conflict.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Period Entry</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {dayLabel} - {periodName}
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: subject.color }}
                            />
                            {subject.name}
                          </div>
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

            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rooms
                        .filter((room) => room.isAvailable)
                        .map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name} ({room.building})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Add Entry
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
