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
import { useFeeTypes, useDeleteFeeType } from '../hooks/useFinance'
import { FEE_CATEGORY_LABELS, type FeeType } from '../types/finance.types'
import { FeeTypeForm } from './FeeTypeForm'

export function FeeTypeList() {
  const { data, isLoading, error } = useFeeTypes()
  const deleteMutation = useDeleteFeeType()

  const [formOpen, setFormOpen] = useState(false)
  const [editingFeeType, setEditingFeeType] = useState<FeeType | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleEdit = (feeType: FeeType) => {
    setEditingFeeType(feeType)
    setFormOpen(true)
  }

  const handleAdd = () => {
    setEditingFeeType(null)
    setFormOpen(true)
  }

  const handleDelete = async () => {
    if (deleteId) {
      try {
        await deleteMutation.mutateAsync(deleteId)
      } catch (error) {
        console.error('Failed to delete fee type:', error)
      }
      setDeleteId(null)
    }
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load fee types. Please try again.
      </div>
    )
  }

  const feeTypes = data?.data || []

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={handleAdd} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Fee Type
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : feeTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No fee types found. Create your first fee type.
                </TableCell>
              </TableRow>
            ) : (
              feeTypes.map((feeType) => (
                <TableRow key={feeType.id}>
                  <TableCell className="font-medium">{feeType.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {FEE_CATEGORY_LABELS[feeType.category]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-xs truncate">
                    {feeType.description || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={feeType.isActive ? 'success' : 'secondary'}>
                      {feeType.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(feeType)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(feeType.id)}
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

      <FeeTypeForm
        open={formOpen}
        onOpenChange={setFormOpen}
        feeType={editingFeeType}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fee Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this fee type? This action cannot be undone.
              Fee types with existing fee structures cannot be deleted.
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
