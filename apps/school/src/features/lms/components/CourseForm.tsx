import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  COURSE_CATEGORIES,
  COURSE_CATEGORY_LABELS,
  COURSE_LEVEL_LABELS,
  type CreateCourseRequest,
  type Course,
  type CourseCategory,
  type CourseLevel,
  type CourseStatus,
} from '../types/lms.types'
import { useInstructors } from '../hooks/useLms'

// ==================== SCHEMA ====================

const courseFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(COURSE_CATEGORIES, {
    required_error: 'Category is required',
  }),
  level: z.enum(['beginner', 'intermediate', 'advanced'] as const, {
    required_error: 'Level is required',
  }),
  instructorId: z.string().min(1, 'Instructor is required'),
  price: z.coerce.number().min(0, 'Price must be 0 or more'),
  status: z.enum(['draft', 'published', 'archived'] as const, {
    required_error: 'Status is required',
  }),
  tags: z.string(),
})

type CourseFormValues = z.infer<typeof courseFormSchema>

// ==================== PROPS ====================

interface CourseFormProps {
  defaultValues?: Partial<Course>
  onSubmit: (data: CreateCourseRequest) => void
  onCancel?: () => void
  isLoading?: boolean
}

// ==================== COMPONENT ====================

export function CourseForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: CourseFormProps) {
  const { data: instructorsResult } = useInstructors()
  const instructors = instructorsResult?.data ?? []

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      description: defaultValues?.description ?? '',
      category: defaultValues?.category ?? 'general',
      level: defaultValues?.level ?? 'beginner',
      instructorId: defaultValues?.instructorId ?? '',
      price: defaultValues?.price ?? 0,
      status: defaultValues?.status ?? 'draft',
      tags: defaultValues?.tags?.join(', ') ?? '',
    },
  })

  const selectedCategory = watch('category')
  const selectedLevel = watch('level')
  const selectedStatus = watch('status')
  const selectedInstructorId = watch('instructorId')

  const handleFormSubmit = (values: CourseFormValues) => {
    const tags = values.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    onSubmit({
      title: values.title,
      description: values.description,
      category: values.category,
      level: values.level,
      instructorId: values.instructorId,
      price: values.price,
      status: values.status,
      tags,
    })
  }

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Enter course title"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter course description"
          rows={4}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Category & Level row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={selectedCategory}
            onValueChange={(value) =>
              setValue('category', value as CourseCategory)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {COURSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {COURSE_CATEGORY_LABELS[cat]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">
              {errors.category.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Level</Label>
          <Select
            value={selectedLevel}
            onValueChange={(value) => setValue('level', value as CourseLevel)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.entries(COURSE_LEVEL_LABELS) as [CourseLevel, string][]
              ).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.level && (
            <p className="text-sm text-destructive">{errors.level.message}</p>
          )}
        </div>
      </div>

      {/* Instructor */}
      <div className="space-y-2">
        <Label>Instructor</Label>
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

      {/* Price & Status row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (INR)</Label>
          <Input
            id="price"
            type="number"
            min={0}
            placeholder="0"
            {...register('price')}
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={selectedStatus}
            onValueChange={(value) => setValue('status', value as CourseStatus)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          placeholder="e.g., algebra, geometry, calculus"
          {...register('tags')}
        />
        <p className="text-xs text-muted-foreground">
          Separate multiple tags with commas
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Course'}
        </Button>
      </div>
    </form>
  )
}
