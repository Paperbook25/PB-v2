import { useState, useMemo } from 'react'
import {
  ArrowUpCircle,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Loader2,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { usePromoteStudents, useStudents } from '../hooks/useStudents'
import type { PromotionResult } from '../types/student.types'

interface PromotionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CLASSES = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Class 9',
  'Class 10',
  'Class 11',
  'Class 12',
]

const SECTIONS = ['A', 'B', 'C', 'D']

function getNextClass(currentClass: string): string {
  const index = CLASSES.indexOf(currentClass)
  if (index === -1 || index === CLASSES.length - 1) return ''
  return CLASSES[index + 1]
}

export function PromotionDialog({ open, onOpenChange }: PromotionDialogProps) {
  const [step, setStep] = useState(1)
  const [sourceClass, setSourceClass] = useState('')
  const [targetClass, setTargetClass] = useState('')
  const [targetSection, setTargetSection] = useState('')
  const [autoAssignRoll, setAutoAssignRoll] = useState(true)
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [promotionResult, setPromotionResult] =
    useState<PromotionResult | null>(null)

  const { data: studentsData, isLoading: studentsLoading } = useStudents({
    class: sourceClass || undefined,
    status: 'active',
    limit: 200,
  })

  const promoteMutation = usePromoteStudents()

  const students = useMemo(() => {
    return studentsData?.data ?? []
  }, [studentsData])

  const handleSourceClassChange = (cls: string) => {
    setSourceClass(cls)
    setTargetClass(getNextClass(cls))
    setSelectedStudentIds([])
  }

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    )
  }

  const toggleAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(students.map((s) => s.id))
    }
  }

  const handlePromote = async () => {
    if (selectedStudentIds.length === 0 || !sourceClass || !targetClass) return

    try {
      const response = await promoteMutation.mutateAsync({
        studentIds: selectedStudentIds,
        fromClass: sourceClass,
        toClass: targetClass,
        academicYear: new Date().getFullYear().toString(),
        newSection: targetSection || undefined,
        autoAssignRollNumbers: autoAssignRoll,
      })
      setPromotionResult(response.data)
      setStep(4)
    } catch {
      // Error handled by mutation
    }
  }

  const handleReset = () => {
    setStep(1)
    setSourceClass('')
    setTargetClass('')
    setTargetSection('')
    setAutoAssignRoll(true)
    setSelectedStudentIds([])
    setPromotionResult(null)
  }

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      handleReset()
    }
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowUpCircle className="h-5 w-5" />
            Promote Students
          </DialogTitle>
          <DialogDescription>
            {step === 1 && 'Step 1: Select the source class and students to promote.'}
            {step === 2 && 'Step 2: Configure the target class and options.'}
            {step === 3 && 'Step 3: Review and confirm the promotion.'}
            {step === 4 && 'Promotion completed.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicators */}
        {step < 4 && (
          <div className="flex items-center gap-2 py-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium ${
                    s === step
                      ? 'bg-primary text-primary-foreground'
                      : s < step
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
                </div>
                {s < 3 && (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Step 1: Select Source Class and Students */}
        {step === 1 && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Source Class</Label>
              <Select
                value={sourceClass}
                onValueChange={handleSourceClassChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class to promote from" />
                </SelectTrigger>
                <SelectContent>
                  {CLASSES.slice(0, -1).map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sourceClass && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Students</Label>
                  {students.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleAllStudents}
                      className="h-7 text-xs"
                    >
                      {selectedStudentIds.length === students.length
                        ? 'Deselect All'
                        : 'Select All'}
                    </Button>
                  )}
                </div>

                {studentsLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg">
                    No active students found in {sourceClass}.
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] rounded-lg border">
                    <div className="p-2 space-y-1">
                      {students.map((student) => (
                        <label
                          key={student.id}
                          className="flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <Checkbox
                            checked={selectedStudentIds.includes(student.id)}
                            onCheckedChange={() => toggleStudent(student.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {student.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Roll #{student.rollNumber} | {student.section}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {student.admissionNumber}
                          </Badge>
                        </label>
                      ))}
                    </div>
                  </ScrollArea>
                )}

                {selectedStudentIds.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedStudentIds.length} student
                    {selectedStudentIds.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                disabled={selectedStudentIds.length === 0}
                onClick={() => setStep(2)}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Configure Target */}
        {step === 2 && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Class</Label>
                <Select value={targetClass} onValueChange={setTargetClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target class" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target Section</Label>
                <Select value={targetSection || 'keep'} onValueChange={(v) => setTargetSection(v === 'keep' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Keep existing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keep">Keep Existing</SelectItem>
                    {SECTIONS.map((sec) => (
                      <SelectItem key={sec} value={sec}>
                        Section {sec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label htmlFor="auto-roll" className="cursor-pointer">
                  Auto-assign Roll Numbers
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Automatically assign sequential roll numbers in the target
                  class.
                </p>
              </div>
              <Switch
                id="auto-roll"
                checked={autoAssignRoll}
                onCheckedChange={setAutoAssignRoll}
              />
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button disabled={!targetClass} onClick={() => setStep(3)}>
                Next
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review and Confirm */}
        {step === 3 && (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-muted-foreground">From Class:</span>
                <span className="font-medium">{sourceClass}</span>
                <span className="text-muted-foreground">To Class:</span>
                <span className="font-medium">{targetClass}</span>
                <span className="text-muted-foreground">Section:</span>
                <span className="font-medium">
                  {targetSection ? `Section ${targetSection}` : 'Keep Existing'}
                </span>
                <span className="text-muted-foreground">Students:</span>
                <span className="font-medium">
                  {selectedStudentIds.length} student
                  {selectedStudentIds.length > 1 ? 's' : ''}
                </span>
                <span className="text-muted-foreground">Auto Roll:</span>
                <span className="font-medium">
                  {autoAssignRoll ? 'Yes' : 'No'}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm text-amber-800">
                This action will promote {selectedStudentIds.length} student
                {selectedStudentIds.length > 1 ? 's' : ''} from {sourceClass} to{' '}
                {targetClass}. Please verify the details before confirming.
              </p>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                disabled={promoteMutation.isPending}
                onClick={handlePromote}
              >
                {promoteMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Promoting...
                  </>
                ) : (
                  <>
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Confirm Promotion
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && promotionResult && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-center gap-6 py-4">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-green-100 text-green-700 mx-auto mb-2">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <p className="text-2xl font-bold text-green-700">
                  {promotionResult.promoted}
                </p>
                <p className="text-xs text-muted-foreground">Promoted</p>
              </div>
              {promotionResult.failed > 0 && (
                <div className="text-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-red-700 mx-auto mb-2">
                    <XCircle className="h-6 w-6" />
                  </div>
                  <p className="text-2xl font-bold text-red-700">
                    {promotionResult.failed}
                  </p>
                  <p className="text-xs text-muted-foreground">Failed</p>
                </div>
              )}
            </div>

            {promotionResult.details.length > 0 && (
              <ScrollArea className="h-[250px] rounded-lg border">
                <div className="p-2 space-y-1">
                  {promotionResult.details.map((detail) => (
                    <div
                      key={detail.studentId}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {detail.success ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 shrink-0 text-red-600" />
                        )}
                        <span className="truncate">{detail.studentName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-xs text-muted-foreground">
                        {detail.success ? (
                          <span>
                            {detail.toClass} {detail.newSection} - Roll #
                            {detail.newRollNumber}
                          </span>
                        ) : (
                          <span className="text-red-600">{detail.error}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={() => handleClose(false)}>
                <Users className="h-4 w-4 mr-2" />
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
