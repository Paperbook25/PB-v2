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
import { useCreateTimetable, useUpdateTimetable } from '../hooks/useTimetable'
import { useToast } from '@/hooks/use-toast'
import type { Timetable, CreateTimetableRequest } from '../types/timetable.types'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  term: z.string().min(1, 'Term is required'),
  classId: z.string().min(1, 'Class is required'),
  className: z.string().optional(),
  sectionId: z.string().min(1, 'Section is required'),
  sectionName: z.string().optional(),
  effectiveFrom: z.string().min(1, 'Start date is required'),
  effectiveTo: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface TimetableFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  timetable?: Timetable | null
  onSuccess?: () => void
}

// Mock class data - in real app, fetch from API
const CLASSES = [
  { id: 'CLS001', name: 'Class 6', sections: [{ id: 'SEC001', name: 'A' }, { id: 'SEC002', name: 'B' }] },
  { id: 'CLS002', name: 'Class 7', sections: [{ id: 'SEC003', name: 'A' }, { id: 'SEC004', name: 'B' }] },
  { id: 'CLS003', name: 'Class 8', sections: [{ id: 'SEC005', name: 'A' }, { id: 'SEC006', name: 'B' }] },
  { id: 'CLS004', name: 'Class 9', sections: [{ id: 'SEC007', name: 'A' }, { id: 'SEC008', name: 'B' }] },
  { id: 'CLS005', name: 'Class 10', sections: [{ id: 'SEC009', name: 'A' }, { id: 'SEC010', name: 'B' }] },
]

const ACADEMIC_YEARS = ['2024-25', '2025-26', '2026-27']
const TERMS = ['Term 1', 'Term 2', 'Full Year']

export function TimetableForm({ open, onOpenChange, timetable, onSuccess }: TimetableFormProps) {
  const { toast } = useToast()
  const createMutation = useCreateTimetable()
  const updateMutation = useUpdateTimetable()
  const isEditing = !!timetable

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: timetable
      ? {
          name: timetable.name,
          academicYear: timetable.academicYear,
          term: timetable.term,
          classId: timetable.classId,
          className: timetable.className,
          sectionId: timetable.sectionId,
          sectionName: timetable.sectionName,
          effectiveFrom: timetable.effectiveFrom,
          effectiveTo: timetable.effectiveTo || '',
        }
      : {
          name: '',
          academicYear: '2024-25',
          term: 'Term 1',
          classId: '',
          className: '',
          sectionId: '',
          sectionName: '',
          effectiveFrom: '',
          effectiveTo: '',
        },
  })

  const selectedClass = CLASSES.find((c) => c.id === form.watch('classId'))

  const onSubmit = async (data: FormData) => {
    try {
      const selectedClassData = CLASSES.find((c) => c.id === data.classId)
      const selectedSection = selectedClassData?.sections.find((s) => s.id === data.sectionId)

      const payload: CreateTimetableRequest = {
        name: data.name,
        academicYear: data.academicYear,
        term: data.term,
        classId: data.classId,
        sectionId: data.sectionId,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo,
      }

      if (isEditing && timetable) {
        await updateMutation.mutateAsync({
          id: timetable.id,
          data: {
            ...payload,
            className: selectedClassData?.name || '',
            sectionName: selectedSection?.name || '',
          },
        })
        toast({ title: 'Timetable Updated', description: 'Changes have been saved.' })
      } else {
        await createMutation.mutateAsync(payload)
        toast({ title: 'Timetable Created', description: 'New timetable has been created.' })
      }

      onOpenChange(false)
      onSuccess?.()
      form.reset()
    } catch {
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'create'} timetable.`,
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Timetable' : 'Create Timetable'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timetable Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Class 6 A - 2024-25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACADEMIC_YEARS.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
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
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TERMS.map((term) => (
                          <SelectItem key={term} value={term}>
                            {term}
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="effectiveFrom"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective From</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="effectiveTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective To (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEditing ? 'Save Changes' : 'Create Timetable'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
