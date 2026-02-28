import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
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
import { useCreateExpense, useUpdateExpense } from '../hooks/useFinance'
import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_LABELS,
  type Expense,
  type ExpenseCategory,
} from '../types/finance.types'

const expenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES as unknown as [ExpenseCategory, ...ExpenseCategory[]]),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be 500 characters or less'),
  amount: z.number({ invalid_type_error: 'Amount must be a number' }).positive('Amount must be greater than 0'),
  vendorName: z.string().max(100).optional(),
  invoiceNumber: z.string().max(50).optional(),
  invoiceDate: z.string().optional(),
})

interface ExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: Expense | null
}

type FormData = z.infer<typeof expenseSchema>

export function ExpenseForm({ open, onOpenChange, expense }: ExpenseFormProps) {
  const { toast } = useToast()
  const createMutation = useCreateExpense()
  const updateMutation = useUpdateExpense()
  const isEditing = !!expense

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: 'other',
      description: '',
      amount: 0,
      vendorName: '',
      invoiceNumber: '',
      invoiceDate: '',
    },
  })

  useEffect(() => {
    if (expense && open) {
      reset({
        category: expense.category,
        description: expense.description,
        amount: expense.amount,
        vendorName: expense.vendorName || '',
        invoiceNumber: expense.invoiceNumber || '',
        invoiceDate: expense.invoiceDate?.split('T')[0] || '',
      })
    } else if (!expense && open) {
      reset({
        category: 'other',
        description: '',
        amount: 0,
        vendorName: '',
        invoiceNumber: '',
        invoiceDate: '',
      })
    }
  }, [expense, open, reset])

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditing && expense) {
        await updateMutation.mutateAsync({
          id: expense.id,
          data: {
            category: data.category,
            description: data.description,
            amount: data.amount,
            vendorName: data.vendorName || undefined,
            invoiceNumber: data.invoiceNumber || undefined,
            invoiceDate: data.invoiceDate || undefined,
          },
        })
        toast({
          title: 'Expense updated',
          description: 'The expense has been updated successfully.',
        })
      } else {
        await createMutation.mutateAsync({
          category: data.category,
          description: data.description,
          amount: data.amount,
          vendorName: data.vendorName || undefined,
          invoiceNumber: data.invoiceNumber || undefined,
          invoiceDate: data.invoiceDate || undefined,
        })
        toast({
          title: 'Expense created',
          description: 'The expense has been recorded successfully.',
        })
      }
      reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save expense',
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
          <DialogTitle>{isEditing ? 'Edit Expense' : 'Create Expense'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the expense details.'
              : 'Record a new expense for approval.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {EXPENSE_CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount (Rs) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the expense"
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendorName">Vendor Name (Optional)</Label>
              <Input
                id="vendorName"
                placeholder="Vendor or payee name"
                {...register('vendorName')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Invoice Number (Optional)</Label>
              <Input
                id="invoiceNumber"
                placeholder="Invoice or bill number"
                {...register('invoiceNumber')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoiceDate">Invoice Date (Optional)</Label>
            <Input
              id="invoiceDate"
              type="date"
              {...register('invoiceDate')}
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
