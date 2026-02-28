import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
import { useFeeTypes, useCreateFeeStructure, useUpdateFeeStructure } from '../hooks/useFinance'
import {
  ACADEMIC_YEARS,
  CLASSES,
  FEE_FREQUENCIES,
  FEE_FREQUENCY_LABELS,
  type FeeStructure,
  type FeeFrequency,
} from '../types/finance.types'

const feeStructureSchema = z.object({
  feeTypeId: z.string().min(1, 'Fee type is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  applicableClasses: z.array(z.string()).min(1, 'Select at least one class'),
  amount: z.number({ invalid_type_error: 'Amount must be a number' }).min(0, 'Amount cannot be negative'),
  frequency: z.enum(FEE_FREQUENCIES as unknown as [FeeFrequency, ...FeeFrequency[]]),
  dueDay: z.number().min(1, 'Day must be between 1-28').max(28, 'Day must be between 1-28'),
  isOptional: z.boolean(),
})

interface FeeStructureFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feeStructure?: FeeStructure | null
}

type FormData = z.infer<typeof feeStructureSchema>

export function FeeStructureForm({ open, onOpenChange, feeStructure }: FeeStructureFormProps) {
  const { toast } = useToast()
  const { data: feeTypesData } = useFeeTypes()
  const createMutation = useCreateFeeStructure()
  const updateMutation = useUpdateFeeStructure()
  const isEditing = !!feeStructure

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(feeStructureSchema),
    defaultValues: {
      feeTypeId: '',
      academicYear: ACADEMIC_YEARS[0],
      applicableClasses: [],
      amount: 0,
      frequency: 'annual',
      dueDay: 10,
      isOptional: false,
    },
  })

  useEffect(() => {
    if (feeStructure && open) {
      reset({
        feeTypeId: feeStructure.feeTypeId,
        academicYear: feeStructure.academicYear,
        applicableClasses: feeStructure.applicableClasses,
        amount: feeStructure.amount,
        frequency: feeStructure.frequency,
        dueDay: feeStructure.dueDay,
        isOptional: feeStructure.isOptional,
      })
    } else if (!feeStructure && open) {
      reset({
        feeTypeId: '',
        academicYear: ACADEMIC_YEARS[0],
        applicableClasses: [],
        amount: 0,
        frequency: 'annual',
        dueDay: 10,
        isOptional: false,
      })
    }
  }, [feeStructure, open, reset])

  const selectedClasses = watch('applicableClasses')
  const feeTypes = feeTypesData?.data || []

  const toggleClass = (className: string) => {
    const current = selectedClasses || []
    if (current.includes(className)) {
      setValue('applicableClasses', current.filter(c => c !== className))
    } else {
      setValue('applicableClasses', [...current, className])
    }
  }

  const selectAllClasses = () => {
    setValue('applicableClasses', [...CLASSES])
  }

  const clearAllClasses = () => {
    setValue('applicableClasses', [])
  }

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && feeStructure) {
        await updateMutation.mutateAsync({
          id: feeStructure.id,
          data: {
            feeTypeId: data.feeTypeId,
            academicYear: data.academicYear,
            applicableClasses: data.applicableClasses,
            amount: data.amount,
            frequency: data.frequency,
            dueDay: data.dueDay,
            isOptional: data.isOptional,
          },
        })
        toast({
          title: 'Fee structure updated',
          description: 'The fee structure has been updated successfully.',
        })
      } else {
        await createMutation.mutateAsync({
          feeTypeId: data.feeTypeId,
          academicYear: data.academicYear,
          applicableClasses: data.applicableClasses,
          amount: data.amount,
          frequency: data.frequency,
          dueDay: data.dueDay,
          isOptional: data.isOptional,
        })
        toast({
          title: 'Fee structure created',
          description: 'The fee structure has been created successfully.',
        })
      }
      reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save fee structure',
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Fee Structure' : 'Add Fee Structure'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the fee structure details.'
              : 'Create a new fee structure for the academic year.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feeTypeId">
                Fee Type <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="feeTypeId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fee type" />
                    </SelectTrigger>
                    <SelectContent>
                      {feeTypes.map((ft) => (
                        <SelectItem key={ft.id} value={ft.id}>
                          {ft.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.feeTypeId && (
                <p className="text-sm text-destructive">{errors.feeTypeId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="academicYear">
                Academic Year <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="academicYear"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACADEMIC_YEARS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount (Rs) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min="0"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Controller
                name="frequency"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {FEE_FREQUENCIES.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {FEE_FREQUENCY_LABELS[freq]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDay">Due Day of Month</Label>
              <Input
                id="dueDay"
                type="number"
                min="1"
                max="28"
                {...register('dueDay', { valueAsNumber: true })}
              />
              {errors.dueDay && (
                <p className="text-sm text-destructive">{errors.dueDay.message}</p>
              )}
            </div>

            <div className="space-y-2 flex items-end">
              <Controller
                name="isOptional"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isOptional"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Label htmlFor="isOptional" className="font-normal">
                      Optional Fee
                    </Label>
                  </div>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>
                Applicable Classes <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Button type="button" variant="link" size="sm" onClick={selectAllClasses}>
                  Select All
                </Button>
                <Button type="button" variant="link" size="sm" onClick={clearAllClasses}>
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 p-3 border rounded-lg max-h-[150px] overflow-y-auto">
              {CLASSES.map((className) => (
                <div key={className} className="flex items-center space-x-2">
                  <Checkbox
                    id={`class-${className}`}
                    checked={selectedClasses?.includes(className) || false}
                    onCheckedChange={() => toggleClass(className)}
                  />
                  <Label htmlFor={`class-${className}`} className="text-sm font-normal">
                    {className}
                  </Label>
                </div>
              ))}
            </div>
            {errors.applicableClasses && (
              <p className="text-sm text-destructive">Select at least one class</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || (selectedClasses?.length || 0) === 0}
            >
              {isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
