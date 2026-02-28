import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useCreateFeeType, useUpdateFeeType } from '../hooks/useFinance'
import {
  FEE_CATEGORIES,
  FEE_CATEGORY_LABELS,
  type FeeType,
  type FeeCategory,
} from '../types/finance.types'

const feeTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  category: z.enum(FEE_CATEGORIES as unknown as [FeeCategory, ...FeeCategory[]]),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
})

interface FeeTypeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feeType?: FeeType | null
}

type FormData = z.infer<typeof feeTypeSchema>

export function FeeTypeForm({ open, onOpenChange, feeType }: FeeTypeFormProps) {
  const { toast } = useToast()
  const createMutation = useCreateFeeType()
  const updateMutation = useUpdateFeeType()
  const isEditing = !!feeType

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(feeTypeSchema),
    defaultValues: {
      name: feeType?.name || '',
      category: feeType?.category || 'tuition',
      description: feeType?.description || '',
    },
  })

  const selectedCategory = watch('category')

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && feeType) {
        await updateMutation.mutateAsync({
          id: feeType.id,
          data: {
            name: data.name,
            category: data.category,
            description: data.description || undefined,
          },
        })
        toast({
          title: 'Fee type updated',
          description: `${data.name} has been updated successfully.`,
        })
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          category: data.category,
          description: data.description || undefined,
        })
        toast({
          title: 'Fee type created',
          description: `${data.name} has been created successfully.`,
        })
      }
      reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save fee type',
        variant: 'destructive',
      })
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset()
    }
    onOpenChange(newOpen)
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Fee Type' : 'Add Fee Type'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the fee type details.'
              : 'Create a new fee type for the school.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Tuition Fee"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedCategory}
              onValueChange={(value) => setValue('category', value as FeeCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {FEE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {FEE_CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the fee type"
              rows={3}
              {...register('description')}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
