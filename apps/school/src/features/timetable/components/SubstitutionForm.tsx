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
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePeriodDefinitions, useSubjects, useCreateSubstitution } from '../hooks/useTimetable'
import { useToast } from '@/hooks/use-toast'

const formSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  periodId: z.string().min(1, 'Period is required'),
  originalTeacherId: z.string().min(1, 'Original teacher is required'),
  substituteTeacherId: z.string().min(1, 'Substitute teacher is required'),
  classId: z.string().min(1, 'Class is required'),
  sectionId: z.string().min(1, 'Section is required'),
  subjectId: z.string().min(1, 'Subject is required'),
  reason: z.string().min(1, 'Reason is required'),
})

type FormData = z.infer<typeof formSchema>

// Mock data
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

const CLASSES = [
  { id: 'CLS001', name: 'Class 6', sections: [{ id: 'SEC001', name: 'A' }, { id: 'SEC002', name: 'B' }] },
  { id: 'CLS002', name: 'Class 7', sections: [{ id: 'SEC003', name: 'A' }, { id: 'SEC004', name: 'B' }] },
  { id: 'CLS003', name: 'Class 8', sections: [{ id: 'SEC005', name: 'A' }, { id: 'SEC006', name: 'B' }] },
  { id: 'CLS004', name: 'Class 9', sections: [{ id: 'SEC007', name: 'A' }, { id: 'SEC008', name: 'B' }] },
  { id: 'CLS005', name: 'Class 10', sections: [{ id: 'SEC009', name: 'A' }, { id: 'SEC010', name: 'B' }] },
]

const REASONS = [
  'Medical leave',
  'Personal emergency',
  'Training/Workshop',
  'Official duty',
  'Casual leave',
  'Other',
]

interface SubstitutionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function SubstitutionForm({ open, onOpenChange, onSuccess }: SubstitutionFormProps) {
  const { toast } = useToast()
  const { data: periodsResult } = usePeriodDefinitions()
  const { data: subjectsResult } = useSubjects()
  const createMutation = useCreateSubstitution()

  const periods = periodsResult?.data?.filter((p) => p.type === 'class') ?? []
  const subjects = subjectsResult?.data ?? []

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      periodId: '',
      originalTeacherId: '',
      substituteTeacherId: '',
      classId: '',
      sectionId: '',
      subjectId: '',
      reason: '',
    },
  })

  const selectedClass = CLASSES.find((c) => c.id === form.watch('classId'))

  const onSubmit = async (data: FormData) => {
    try {
      await createMutation.mutateAsync({
        date: data.date,
        periodId: data.periodId,
        originalTeacherId: data.originalTeacherId,
        substituteTeacherId: data.substituteTeacherId,
        classId: data.classId,
        sectionId: data.sectionId,
        subjectId: data.subjectId,
        reason: data.reason,
      })

      toast({
        title: 'Substitution Created',
        description: 'The substitution request has been submitted for approval.',
      })

      onOpenChange(false)
      onSuccess?.()
      form.reset()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create substitution request.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Substitution Request</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                name="periodId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {periods.map((period) => (
                          <SelectItem key={period.id} value={period.id}>
                            {period.name} ({period.startTime} - {period.endTime})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value)
                        form.setValue('sectionId', '')
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CLASSES.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
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
                name="sectionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!selectedClass}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select section" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedClass?.sections.map((sec) => (
                          <SelectItem key={sec.id} value={sec.id}>
                            {sec.name}
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
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="originalTeacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Original Teacher (Absent)</FormLabel>
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
                name="substituteTeacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Substitute Teacher</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TEACHERS.filter(
                          (t) => t.id !== form.watch('originalTeacherId')
                        ).map((teacher) => (
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REASONS.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
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
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
