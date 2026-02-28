import { useState } from 'react'
import { GraduationCap, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useClasses, useCreateClass, useUpdateClass, useDeleteClass } from '../hooks/useSettings'
import type { ClassSection } from '../types/settings.types'

export function ClassSectionManager() {
  const { toast } = useToast()
  const { data, isLoading } = useClasses()
  const createClass = useCreateClass()
  const updateClass = useUpdateClass()
  const deleteClass = useDeleteClass()

  const [showForm, setShowForm] = useState(false)
  const [editingClass, setEditingClass] = useState<ClassSection | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [className, setClassName] = useState('')
  const [sections, setSections] = useState<string[]>([])
  const [newSection, setNewSection] = useState('')

  const handleAddSection = () => {
    if (newSection && !sections.includes(newSection.toUpperCase())) {
      setSections([...sections, newSection.toUpperCase()])
      setNewSection('')
    }
  }

  const handleRemoveSection = (section: string) => {
    setSections(sections.filter((s) => s !== section))
  }

  const handleOpenForm = (cls?: ClassSection) => {
    if (cls) {
      setEditingClass(cls)
      setClassName(cls.className)
      setSections(cls.sections)
    } else {
      setEditingClass(null)
      setClassName('')
      setSections([])
    }
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingClass(null)
    setClassName('')
    setSections([])
    setNewSection('')
  }

  const handleSubmit = () => {
    if (!className || sections.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Class name and at least one section are required.',
        variant: 'destructive',
      })
      return
    }

    const data = { className, sections }

    if (editingClass) {
      updateClass.mutate(
        { id: editingClass.id, data },
        {
          onSuccess: () => {
            toast({
              title: 'Class Updated',
              description: 'Class has been updated successfully.',
            })
            handleCloseForm()
          },
          onError: (error) => {
            toast({
              title: 'Error',
              description: error instanceof Error ? error.message : 'Failed to update class',
              variant: 'destructive',
            })
          },
        }
      )
    } else {
      createClass.mutate(data, {
        onSuccess: () => {
          toast({
            title: 'Class Created',
            description: 'Class has been created successfully.',
          })
          handleCloseForm()
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to create class',
            variant: 'destructive',
          })
        },
      })
    }
  }

  const handleDelete = () => {
    if (!deleteId) return

    deleteClass.mutate(deleteId, {
      onSuccess: () => {
        toast({
          title: 'Class Deleted',
          description: 'Class has been deleted successfully.',
        })
        setDeleteId(null)
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete class',
          variant: 'destructive',
        })
      },
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const classes = data?.data || []

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Classes & Sections
            </CardTitle>
            <CardDescription>Manage class and section configurations</CardDescription>
          </div>
          <Button size="sm" onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Class
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {classes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No classes configured</p>
            ) : (
              classes.map((cls) => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{cls.className}</p>
                    <div className="flex gap-1 mt-1">
                      {cls.sections.map((section) => (
                        <Badge key={section} variant="secondary">
                          {section}
                        </Badge>
                      ))}
                    </div>
                    {cls.classTeacherName && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Class Teacher: {cls.classTeacherName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenForm(cls)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => setDeleteId(cls.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClass ? 'Edit Class' : 'Add Class'}</DialogTitle>
            <DialogDescription>
              {editingClass ? 'Update class and section details.' : 'Create a new class with sections.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Class Name</label>
              <Input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g., Class 1"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Sections</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newSection}
                  onChange={(e) => setNewSection(e.target.value.toUpperCase())}
                  placeholder="e.g., A"
                  maxLength={2}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSection())}
                />
                <Button type="button" onClick={handleAddSection}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {sections.map((section) => (
                  <Badge key={section} variant="secondary" className="flex items-center gap-1">
                    {section}
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(section)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseForm}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createClass.isPending || updateClass.isPending}
            >
              {editingClass ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the class and all its sections. This action cannot be undone.
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
