import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useEligibleForGraduation, useGraduateBatch } from '../hooks/useAlumni'
import { useToast } from '@/hooks/use-toast'
import type { EligibleForGraduation } from '../api/alumni.api'

interface BatchGraduationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BatchGraduationDialog({ open, onOpenChange }: BatchGraduationDialogProps) {
  const { data: eligibleResult, isLoading: loadingEligible } = useEligibleForGraduation()
  const graduateBatch = useGraduateBatch()
  const { toast } = useToast()

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [batchYear, setBatchYear] = useState(String(new Date().getFullYear()))
  const [results, setResults] = useState<{
    total: number
    graduated: number
    failed: number
    items: Array<{ studentId: string; studentName: string; success: boolean; error?: string }>
  } | null>(null)

  const eligibleStudents = eligibleResult?.data || []

  const handleToggle = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const handleSelectAll = () => {
    if (selectedIds.size === eligibleStudents.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(eligibleStudents.map((s) => s.id)))
    }
  }

  const handleGraduate = async () => {
    if (selectedIds.size === 0) {
      toast({ title: 'Please select at least one student', variant: 'destructive' })
      return
    }

    try {
      const result = await graduateBatch.mutateAsync({
        studentIds: Array.from(selectedIds),
        batchYear,
      })

      setResults({
        total: result.data.total,
        graduated: result.data.graduated,
        failed: result.data.failed,
        items: result.data.results,
      })

      if (result.data.failed === 0) {
        toast({ title: `Successfully graduated ${result.data.graduated} students` })
      } else {
        toast({
          title: `Graduated ${result.data.graduated} students, ${result.data.failed} failed`,
          variant: result.data.graduated > 0 ? 'default' : 'destructive',
        })
      }
    } catch {
      toast({ title: 'Failed to graduate students', variant: 'destructive' })
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset state after animation
    setTimeout(() => {
      setSelectedIds(new Set())
      setResults(null)
      setBatchYear(String(new Date().getFullYear()))
    }, 200)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Batch Graduation</DialogTitle>
          <DialogDescription>
            {results
              ? 'Graduation complete. Review the results below.'
              : 'Select Class 12 students to graduate as a batch.'}
          </DialogDescription>
        </DialogHeader>

        {results ? (
          // Results view
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-2xl font-bold">{results.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-800 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-200">{results.graduated}</p>
                <p className="text-sm text-muted-foreground">Graduated</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-800 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-200">{results.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>

            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="p-4 space-y-2">
                {results.items.map((item) => (
                  <div
                    key={item.studentId}
                    className="flex items-center justify-between p-2 border-b last:border-0"
                  >
                    <span className="font-medium">{item.studentName}</span>
                    {item.success ? (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Graduated
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        {item.error}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          // Selection view
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Batch Year</Label>
                <Input
                  type="number"
                  value={batchYear}
                  onChange={(e) => setBatchYear(e.target.value)}
                  className="w-32"
                />
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  {selectedIds.size} of {eligibleStudents.length} selected
                </p>
                <Button variant="link" size="sm" onClick={handleSelectAll} className="h-auto p-0">
                  {selectedIds.size === eligibleStudents.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>

            {loadingEligible ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : eligibleStudents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No eligible students found. Only active Class 12 students can be graduated.
              </div>
            ) : (
              <ScrollArea className="h-[350px] border rounded-lg">
                <div className="p-2 space-y-1">
                  {eligibleStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => handleToggle(student.id)}
                    >
                      <Checkbox
                        checked={selectedIds.has(student.id)}
                        onCheckedChange={() => handleToggle(student.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.photoUrl} alt={student.name} />
                        <AvatarFallback className="text-xs">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {student.class} - {student.section} | Roll: {student.rollNumber}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        <DialogFooter>
          {results ? (
            <Button onClick={handleClose}>Done</Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleGraduate}
                disabled={graduateBatch.isPending || selectedIds.size === 0}
              >
                {graduateBatch.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Graduating...
                  </>
                ) : (
                  `Graduate ${selectedIds.size} Student${selectedIds.size === 1 ? '' : 's'}`
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
