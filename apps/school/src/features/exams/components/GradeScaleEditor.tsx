import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Loader2, Star, Pencil, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { GradeScale, CreateGradeScaleRequest, UpdateGradeScaleRequest } from '../types/exams.types'

const gradeRangeSchema = z.object({
  minPercentage: z.number().min(0).max(100),
  maxPercentage: z.number().min(0).max(100),
  grade: z.string().min(1),
  gradePoint: z.number().optional(),
  description: z.string().optional(),
})

const gradeScaleSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  ranges: z.array(gradeRangeSchema).min(2, 'At least 2 grade ranges required'),
  isDefault: z.boolean().default(false),
})

type GradeScaleFormData = z.infer<typeof gradeScaleSchema>

interface GradeScaleEditorProps {
  gradeScales: GradeScale[]
  onCreate: (data: CreateGradeScaleRequest) => Promise<void>
  onUpdate: (id: string, data: UpdateGradeScaleRequest) => Promise<void>
  onDelete: (id: string) => Promise<void>
  isCreating?: boolean
  isUpdating?: boolean
}

export function GradeScaleEditor({
  gradeScales,
  onCreate,
  onUpdate,
  onDelete,
  isCreating,
  isUpdating,
}: GradeScaleEditorProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingScale, setEditingScale] = useState<GradeScale | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const form = useForm<GradeScaleFormData>({
    resolver: zodResolver(gradeScaleSchema),
    defaultValues: {
      name: '',
      ranges: [
        { minPercentage: 90, maxPercentage: 100, grade: 'A+', gradePoint: 10 },
        { minPercentage: 80, maxPercentage: 89.99, grade: 'A', gradePoint: 9 },
        { minPercentage: 70, maxPercentage: 79.99, grade: 'B+', gradePoint: 8 },
        { minPercentage: 60, maxPercentage: 69.99, grade: 'B', gradePoint: 7 },
        { minPercentage: 50, maxPercentage: 59.99, grade: 'C+', gradePoint: 6 },
        { minPercentage: 40, maxPercentage: 49.99, grade: 'C', gradePoint: 5 },
        { minPercentage: 33, maxPercentage: 39.99, grade: 'D', gradePoint: 4 },
        { minPercentage: 0, maxPercentage: 32.99, grade: 'F', gradePoint: 0 },
      ],
      isDefault: false,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'ranges',
  })

  const handleOpenForm = (scale?: GradeScale) => {
    if (scale) {
      setEditingScale(scale)
      form.reset({
        name: scale.name,
        ranges: scale.ranges,
        isDefault: scale.isDefault,
      })
    } else {
      setEditingScale(null)
      form.reset({
        name: '',
        ranges: [
          { minPercentage: 90, maxPercentage: 100, grade: 'A+', gradePoint: 10 },
          { minPercentage: 80, maxPercentage: 89.99, grade: 'A', gradePoint: 9 },
          { minPercentage: 70, maxPercentage: 79.99, grade: 'B+', gradePoint: 8 },
          { minPercentage: 60, maxPercentage: 69.99, grade: 'B', gradePoint: 7 },
          { minPercentage: 50, maxPercentage: 59.99, grade: 'C+', gradePoint: 6 },
          { minPercentage: 40, maxPercentage: 49.99, grade: 'C', gradePoint: 5 },
          { minPercentage: 33, maxPercentage: 39.99, grade: 'D', gradePoint: 4 },
          { minPercentage: 0, maxPercentage: 32.99, grade: 'F', gradePoint: 0 },
        ],
        isDefault: false,
      })
    }
    setShowForm(true)
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    if (editingScale) {
      await onUpdate(editingScale.id, data)
    } else {
      await onCreate(data)
    }
    setShowForm(false)
    form.reset()
  })

  const scaleToDelete = gradeScales.find((s) => s.id === deleteId)

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Grade Scales</h3>
            <p className="text-sm text-muted-foreground">
              Configure grading criteria for evaluating student performance
            </p>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Grade Scale
          </Button>
        </div>

        {gradeScales.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No grade scales configured. Click "Add Grade Scale" to create one.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {gradeScales.map((scale) => (
              <Card key={scale.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {scale.name}
                        {scale.isDefault && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Default
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{scale.ranges.length} grade ranges</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenForm(scale)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {!scale.isDefault && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteId(scale.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {scale.ranges.map((range, i) => (
                      <Badge key={i} variant="outline">
                        {range.grade}: {range.minPercentage}-{range.maxPercentage}%
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingScale ? 'Edit' : 'Create'} Grade Scale</DialogTitle>
            <DialogDescription>
              Define the percentage ranges and corresponding grades.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Scale Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., CBSE 10-Point Scale" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex items-end gap-2 pb-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="pb-0.5">Set as default</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Grade Ranges</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        minPercentage: 0,
                        maxPercentage: 0,
                        grade: '',
                        gradePoint: undefined,
                      })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Range
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Min %</TableHead>
                      <TableHead>Max %</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Grade Point</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`ranges.${index}.minPercentage`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                step="0.01"
                                className="w-20"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`ranges.${index}.maxPercentage`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                step="0.01"
                                className="w-20"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`ranges.${index}.grade`}
                            render={({ field }) => (
                              <Input className="w-16" placeholder="A+" {...field} />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <FormField
                            control={form.control}
                            name={`ranges.${index}.gradePoint`}
                            render={({ field }) => (
                              <Input
                                type="number"
                                step="0.5"
                                className="w-16"
                                placeholder="10"
                                value={field.value ?? ''}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value ? parseFloat(e.target.value) : undefined
                                  )
                                }
                              />
                            )}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            disabled={fields.length <= 2}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingScale ? 'Update Scale' : 'Create Scale'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Grade Scale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{scaleToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId)
                  setDeleteId(null)
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
