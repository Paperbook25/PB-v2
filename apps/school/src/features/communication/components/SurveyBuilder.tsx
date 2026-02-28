import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Trash2,
  GripVertical,
  Loader2,
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  Star,
  Gauge,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CreateSurveyRequest, QuestionType, Survey } from '../types/communication.types'
import { Role } from '@/types/common.types'

const questionSchema = z.object({
  question: z.string().min(3, 'Question is required'),
  type: z.enum(['text', 'textarea', 'single_choice', 'multiple_choice', 'rating', 'scale']),
  options: z.array(z.string()).optional(),
  required: z.boolean(),
})

const TARGET_TYPES = ['all', 'role', 'class', 'section', 'individual'] as const

const surveySchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  targetType: z.enum(TARGET_TYPES),
  targetRoles: z.array(z.string()).optional(),
  startsAt: z.string().min(1, 'Start date is required'),
  endsAt: z.string().min(1, 'End date is required'),
  anonymous: z.boolean(),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
})

type SurveyFormData = z.infer<typeof surveySchema>

interface SurveyBuilderProps {
  survey?: Survey
  onSubmit: (data: CreateSurveyRequest) => void
  isLoading?: boolean
  onCancel?: () => void
}

const questionTypeConfig: Record<
  QuestionType,
  { label: string; icon: typeof Type; hasOptions: boolean }
> = {
  text: { label: 'Short Text', icon: Type, hasOptions: false },
  textarea: { label: 'Long Text', icon: AlignLeft, hasOptions: false },
  single_choice: { label: 'Single Choice', icon: CircleDot, hasOptions: true },
  multiple_choice: { label: 'Multiple Choice', icon: CheckSquare, hasOptions: true },
  rating: { label: 'Rating (1-5)', icon: Star, hasOptions: false },
  scale: { label: 'Scale (1-10)', icon: Gauge, hasOptions: false },
}

const roles: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'principal', label: 'Principal' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
]

export function SurveyBuilder({
  survey,
  onSubmit,
  isLoading,
  onCancel,
}: SurveyBuilderProps) {
  const form = useForm<SurveyFormData>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      title: survey?.title || '',
      description: survey?.description || '',
      targetType: survey?.target?.type || 'all',
      targetRoles: survey?.target?.roles || [],
      startsAt: survey?.startsAt
        ? new Date(survey.startsAt).toISOString().slice(0, 16)
        : '',
      endsAt: survey?.endsAt
        ? new Date(survey.endsAt).toISOString().slice(0, 16)
        : '',
      anonymous: survey?.anonymous || false,
      questions: survey?.questions.map((q) => ({
        question: q.question,
        type: q.type,
        options: q.options || [],
        required: q.required,
      })) || [
        { question: '', type: 'single_choice', options: ['', ''], required: true },
      ],
    },
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'questions',
  })

  const targetType = form.watch('targetType')

  function handleSubmit(data: SurveyFormData) {
    const request: CreateSurveyRequest = {
      title: data.title,
      description: data.description,
      target: {
        type: data.targetType,
        roles: data.targetType === 'role' ? (data.targetRoles as Role[]) : undefined,
      },
      startsAt: new Date(data.startsAt).toISOString(),
      endsAt: new Date(data.endsAt).toISOString(),
      anonymous: data.anonymous,
      questions: data.questions.map((q, i) => ({
        question: q.question,
        type: q.type as QuestionType,
        options: ['single_choice', 'multiple_choice'].includes(q.type)
          ? q.options?.filter(Boolean)
          : undefined,
        required: q.required,
        order: i + 1,
      })),
    }
    onSubmit(request)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Survey Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter survey title" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter survey description"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="targetType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">Everyone</SelectItem>
                        <SelectItem value="role">Specific Roles</SelectItem>
                        <SelectItem value="class">Specific Classes</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Anonymous</FormLabel>
                      <FormDescription>
                        Responses won't include respondent names
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {targetType === 'role' && (
              <FormField
                control={form.control}
                name="targetRoles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Roles</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {roles.map((role) => (
                        <Button
                          key={role.value}
                          type="button"
                          variant={field.value?.includes(role.value) ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            const current = field.value || []
                            if (current.includes(role.value)) {
                              field.onChange(current.filter((r) => r !== role.value))
                            } else {
                              field.onChange([...current, role.value])
                            }
                          }}
                        >
                          {role.label}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Questions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Questions</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  question: '',
                  type: 'single_choice',
                  options: ['', ''],
                  required: true,
                })
              }
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Question
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {fields.map((field, index) => {
              const questionType = form.watch(`questions.${index}.type`)
              const typeConfig = questionTypeConfig[questionType as QuestionType]

              return (
                <div
                  key={field.id}
                  className="p-4 border rounded-lg space-y-4"
                >
                  <div className="flex items-start gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="cursor-grab flex-shrink-0"
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>

                    <div className="flex-1 space-y-4">
                      <div className="flex items-start gap-4">
                        <FormField
                          control={form.control}
                          name={`questions.${index}.question`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input
                                  placeholder="Enter question"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`questions.${index}.type`}
                          render={({ field }) => (
                            <FormItem className="w-48">
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {Object.entries(questionTypeConfig).map(
                                    ([type, config]) => (
                                      <SelectItem key={type} value={type}>
                                        <div className="flex items-center gap-2">
                                          <config.icon className="h-4 w-4" />
                                          {config.label}
                                        </div>
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />
                      </div>

                      {typeConfig?.hasOptions && (
                        <QuestionOptions
                          control={form.control}
                          questionIndex={index}
                        />
                      )}

                      <div className="flex items-center justify-between">
                        <FormField
                          control={form.control}
                          name={`questions.${index}.required`}
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="!mt-0">Required</FormLabel>
                            </FormItem>
                          )}
                        />

                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {survey ? 'Update' : 'Create'} Survey
          </Button>
        </div>
      </form>
    </Form>
  )
}

function QuestionOptions({
  control,
  questionIndex,
}: {
  control: any
  questionIndex: number
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  })

  return (
    <div className="space-y-2 pl-6">
      {fields.map((field, optionIndex) => (
        <div key={field.id} className="flex items-center gap-2">
          <Input
            placeholder={`Option ${optionIndex + 1}`}
            {...control.register(
              `questions.${questionIndex}.options.${optionIndex}`
            )}
          />
          {fields.length > 2 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(optionIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => append('')}
      >
        <Plus className="h-4 w-4 mr-1" />
        Add Option
      </Button>
    </div>
  )
}
