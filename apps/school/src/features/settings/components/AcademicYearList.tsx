import { useState } from 'react'
import { Calendar, Plus, Star, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import {
  useAcademicYears,
  useDeleteAcademicYear,
  useSetCurrentAcademicYear,
} from '../hooks/useSettings'
import { AcademicYearForm } from './AcademicYearForm'
import type { AcademicYear } from '../types/settings.types'

export function AcademicYearList() {
  const { toast } = useToast()
  const { data, isLoading } = useAcademicYears()
  const deleteYear = useDeleteAcademicYear()
  const setCurrent = useSetCurrentAcademicYear()

  const [showForm, setShowForm] = useState(false)
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleSetCurrent = (id: string) => {
    setCurrent.mutate(id, {
      onSuccess: () => {
        toast({
          title: 'Current Year Updated',
          description: 'The academic year has been set as current.',
        })
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to set current year',
          variant: 'destructive',
        })
      },
    })
  }

  const handleDelete = () => {
    if (!deleteId) return

    deleteYear.mutate(deleteId, {
      onSuccess: () => {
        toast({
          title: 'Year Deleted',
          description: 'The academic year has been deleted.',
        })
        setDeleteId(null)
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete year',
          variant: 'destructive',
        })
      },
    })
  }

  const getStatusBadge = (status: AcademicYear['status'], isCurrent: boolean) => {
    if (isCurrent) {
      return <Badge variant="success">Current</Badge>
    }
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const years = data?.data || []

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Academic Years
            </CardTitle>
            <CardDescription>Manage academic year periods</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Year
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {years.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No academic years configured</p>
            ) : (
              years.map((year) => (
                <div
                  key={year.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{year.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(year.startDate)} - {formatDate(year.endDate)}
                      </p>
                    </div>
                    {getStatusBadge(year.status, year.isCurrent)}
                  </div>
                  <div className="flex items-center gap-2">
                    {!year.isCurrent && year.status !== 'completed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetCurrent(year.id)}
                        disabled={setCurrent.isPending}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Set Current
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingYear(year)
                        setShowForm(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!year.isCurrent && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => setDeleteId(year.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <AcademicYearForm
          year={editingYear}
          onClose={() => {
            setShowForm(false)
            setEditingYear(null)
          }}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Academic Year?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this academic year?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
