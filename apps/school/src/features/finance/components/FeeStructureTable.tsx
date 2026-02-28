import { useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Skeleton } from '@/components/ui/skeleton'
import { useFeeStructures, useDeleteFeeStructure } from '../hooks/useFinance'
import { formatCurrency } from '@/lib/utils'
import {
  ACADEMIC_YEARS,
  FEE_FREQUENCY_LABELS,
  type FeeStructure,
} from '../types/finance.types'
import { FeeStructureForm } from './FeeStructureForm'

export function FeeStructureTable() {
  const [academicYear, setAcademicYear] = useState(ACADEMIC_YEARS[0])
  const { data, isLoading, error } = useFeeStructures({ academicYear })
  const deleteMutation = useDeleteFeeStructure()

  const [formOpen, setFormOpen] = useState(false)
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleEdit = (structure: FeeStructure) => {
    setEditingStructure(structure)
    setFormOpen(true)
  }

  const handleAdd = () => {
    setEditingStructure(null)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteMutation.mutateAsync(deleteId)
      } catch (error) {
        console.error('Failed to delete fee structure:', error)
      }
      setDeleteId(null)
    }
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load fee structures. Please try again.
      </div>
    )
  }

  const structures = data?.data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Academic Year:</span>
          <Select value={academicYear} onValueChange={setAcademicYear}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACADEMIC_YEARS.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Fee Structure
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fee Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Applicable Classes</TableHead>
              <TableHead>Due Day</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : structures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No fee structures found for {academicYear}. Create your first fee structure.
                </TableCell>
              </TableRow>
            ) : (
              structures.map((structure) => (
                <TableRow key={structure.id}>
                  <TableCell className="font-medium">{structure.feeTypeName}</TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatCurrency(structure.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {FEE_FREQUENCY_LABELS[structure.frequency]}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {structure.applicableClasses.length > 5 ? (
                        <span className="text-sm text-muted-foreground">
                          {structure.applicableClasses.length} classes
                        </span>
                      ) : (
                        structure.applicableClasses.map((cls) => (
                          <Badge key={cls} variant="outline" className="text-xs">
                            {cls}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{structure.dueDay}th</TableCell>
                  <TableCell>
                    <Badge variant={structure.isOptional ? 'secondary' : 'default'}>
                      {structure.isOptional ? 'Optional' : 'Mandatory'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(structure)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(structure.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <FeeStructureForm
        open={formOpen}
        onOpenChange={setFormOpen}
        feeStructure={editingStructure}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee Structure</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this fee structure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
