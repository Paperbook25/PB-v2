import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  EXAM_TYPES,
  EXAM_TYPE_LABELS,
  TERMS,
  ACADEMIC_YEARS,
  CLASSES,
  SUBJECT_TYPE_LABELS,
  DEFAULT_SUBJECTS,
} from '../types/exams.types'

const subjectSchema = z.object({
  name: z.string().min(2, 'Subject name is required'),
  code: z.string().min(1, 'Subject code is required'),
  type: z.enum(['theory', 'practical', 'both']),
  maxMarks: z.number().min(1, 'Max marks must be at least 1'),
  passingMarks: z.number().min(0, 'Passing marks cannot be negative'),
})

const examFormSchema = z.object({
  name: z.string().min(2, 'Exam name must be at least 2 characters'),
  type: z.enum(['unit_test', 'mid_term', 'quarterly', 'half_yearly', 'annual', 'practical', 'online']),
  academicYear: z.string().min(1, 'Academic year is required'),
  term: z.string().min(1, 'Term is required'),
  applicableClasses: z.array(z.string()).min(1, 'Select at least one class'),
  subjects: z.array(subjectSchema).min(1, 'Add at least one subject'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
})

type ExamFormData = z.infer<typeof examFormSchema>

interface ExamFormProps {
  onSubmit: (data: ExamFormData) => Promise<void>
  initialData?: Partial<ExamFormData>
  isSubmitting?: boolean
  submitLabel?: string
}

export function ExamForm({
  onSubmit,
  initialData,
  isSubmitting,
  submitLabel = 'Create Exam',
}: ExamFormProps) {
  const form = useForm<ExamFormData>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'unit_test',
      academicYear: initialData?.academicYear || '2024-25',
      term: initialData?.term || 'Term 1',
      applicableClasses: initialData?.applicableClasses || [],
      subjects: initialData?.subjects || DEFAULT_SUBJECTS.slice(0, 5),
      startDate: initialData?.startDate || '',
      endDate: initialData?.endDate || '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subjects',
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data)
  })

  const addSubject = () => {
    append({
      name: '',
      code: '',
      type: 'theory',
      maxMarks: 100,
      passingMarks: 35,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Exam Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Exam Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., First Unit Test" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXAM_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {EXAM_TYPE_LABELS[type]}
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

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Applicable Classes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Applicable Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="applicableClasses"
              render={({ field }) => (
                <FormItem>
                  <FormDescription>
                    Select the classes for which this exam is applicable
                  </FormDescription>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mt-2">
                    {CLASSES.map((cls) => (
                      <div key={cls} className="flex items-center space-x-2">
                        <Checkbox
                          id={cls}
                          checked={field.value.includes(cls)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...field.value, cls])
                            } else {
                              field.onChange(field.value.filter((c) => c !== cls))
                            }
                          }}
                        />
                        <label
                          htmlFor={cls}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {cls}
                        </label>
                      </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Subjects</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addSubject}>
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground border rounded-lg">
                No subjects added. Click "Add Subject" to add exam subjects.
              </div>
            ) : (
              fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-6 gap-4 items-end p-4 border rounded-lg"
                >
                  <FormField
                    control={form.control}
                    name={`subjects.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Subject Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Mathematics" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`subjects.${index}.code`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input placeholder="MATH" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`subjects.${index}.type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {(['theory', 'practical', 'both'] as const).map((type) => (
                              <SelectItem key={type} value={type}>
                                {SUBJECT_TYPE_LABELS[type]}
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
                    name={`subjects.${index}.maxMarks`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Marks</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`subjects.${index}.passingMarks`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormLabel>Passing</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-6"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
