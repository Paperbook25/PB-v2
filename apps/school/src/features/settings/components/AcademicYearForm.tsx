import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { useCreateAcademicYear, useUpdateAcademicYear } from '../hooks/useSettings'
import type { AcademicYear } from '../types/settings.types'

const academicYearSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
})

type AcademicYearFormData = z.infer<typeof academicYearSchema>

interface AcademicYearFormProps {
  year?: AcademicYear | null
  onClose: () => void
}

export function AcademicYearForm({ year, onClose }: AcademicYearFormProps) {
  const { toast } = useToast()
  const createYear = useCreateAcademicYear()
  const updateYear = useUpdateAcademicYear()

  const isEditing = !!year

  const form = useForm<AcademicYearFormData>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
    },
  })

  useEffect(() => {
    if (year) {
      form.reset({
        name: year.name,
        startDate: year.startDate,
        endDate: year.endDate,
      })
    }
  }, [year, form])

  const onSubmit = (data: AcademicYearFormData) => {
    if (isEditing) {
      updateYear.mutate(
        { id: year.id, data },
        {
          onSuccess: () => {
            toast({
              title: 'Year Updated',
              description: 'Academic year has been updated successfully.',
            })
            onClose()
          },
          onError: (error) => {
            toast({
              title: 'Error',
              description: error instanceof Error ? error.message : 'Failed to update year',
              variant: 'destructive',
            })
          },
        }
      )
    } else {
      createYear.mutate(data, {
        onSuccess: () => {
          toast({
            title: 'Year Created',
            description: 'Academic year has been created successfully.',
          })
          onClose()
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to create year',
            variant: 'destructive',
          })
        },
      })
    }
  }

  const isPending = createYear.isPending || updateYear.isPending

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Academic Year' : 'Add Academic Year'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the academic year details.' : 'Create a new academic year period.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2024-25" {...field} />
                  </FormControl>
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : isEditing ? (
                  'Update'
                ) : (
                  'Create'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
