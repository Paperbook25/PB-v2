import { useState, useEffect } from 'react'
import { Loader2, Save, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import type { MarksEntryStudent, Subject, Exam } from '../types/exams.types'
import { CLASSES, SECTIONS } from '../types/exams.types'

interface MarksEntryGridProps {
  exam: Exam
  students: MarksEntryStudent[]
  selectedSubject: Subject | null
  selectedClass: string
  selectedSection: string
  onClassChange: (className: string) => void
  onSectionChange: (section: string) => void
  onSubjectChange: (subjectId: string) => void
  onSubmit: (
    marks: { studentId: string; marksObtained: number; isAbsent: boolean; remarks?: string }[]
  ) => Promise<void>
  isLoading?: boolean
  isSubmitting?: boolean
}

interface MarkEntry {
  studentId: string
  marksObtained: number
  isAbsent: boolean
  remarks: string
  hasError: boolean
}

export function MarksEntryGrid({
  exam,
  students,
  selectedSubject,
  selectedClass,
  selectedSection,
  onClassChange,
  onSectionChange,
  onSubjectChange,
  onSubmit,
  isLoading,
  isSubmitting,
}: MarksEntryGridProps) {
  const [markEntries, setMarkEntries] = useState<Record<string, MarkEntry>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize mark entries when students data changes
  useEffect(() => {
    const entries: Record<string, MarkEntry> = {}
    students.forEach((student) => {
      entries[student.id] = {
        studentId: student.id,
        marksObtained: student.marksObtained ?? 0,
        isAbsent: student.isAbsent ?? false,
        remarks: student.remarks ?? '',
        hasError: false,
      }
    })
    setMarkEntries(entries)
    setHasChanges(false)
  }, [students])

  const updateMark = (studentId: string, field: keyof MarkEntry, value: any) => {
    setMarkEntries((prev) => {
      const entry = prev[studentId]
      const maxMarks = selectedSubject?.maxMarks || 100

      let hasError = false
      if (field === 'marksObtained') {
        const marks = parseFloat(value) || 0
        hasError = marks < 0 || marks > maxMarks
        value = marks
      }

      return {
        ...prev,
        [studentId]: {
          ...entry,
          [field]: value,
          hasError:
            field === 'marksObtained' ? hasError : entry.hasError,
        },
      }
    })
    setHasChanges(true)
  }

  const handleSubmit = async () => {
    const marks = Object.values(markEntries).map((entry) => ({
      studentId: entry.studentId,
      marksObtained: entry.marksObtained,
      isAbsent: entry.isAbsent,
      remarks: entry.remarks || undefined,
    }))

    await onSubmit(marks)
    setHasChanges(false)
  }

  const hasErrors = Object.values(markEntries).some((e) => e.hasError)
  const applicableClasses = exam.applicableClasses

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-4">
            <div className="w-[200px]">
              <label className="text-sm font-medium mb-1 block">Class</label>
              <Select value={selectedClass} onValueChange={onClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {applicableClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[150px]">
              <label className="text-sm font-medium mb-1 block">Section</label>
              <Select value={selectedSection} onValueChange={onSectionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {SECTIONS.map((sec) => (
                    <SelectItem key={sec} value={sec}>
                      Section {sec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-[250px]">
              <label className="text-sm font-medium mb-1 block">Subject</label>
              <Select
                value={selectedSubject?.id || ''}
                onValueChange={onSubjectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {exam.subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.maxMarks} marks)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1" />

            <div className="flex items-end">
              <Button
                onClick={handleSubmit}
                disabled={!hasChanges || hasErrors || isSubmitting || !selectedSubject}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Marks
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marks Entry Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Marks Entry - {selectedClass} {selectedSection}
          </CardTitle>
          {selectedSubject && (
            <CardDescription>
              {selectedSubject.name} - Max Marks: {selectedSubject.maxMarks}, Passing:{' '}
              {selectedSubject.passingMarks}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {!selectedClass || !selectedSection || !selectedSubject ? (
            <div className="py-12 text-center text-muted-foreground">
              Select class, section, and subject to enter marks
            </div>
          ) : isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No students found for the selected class and section
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Roll</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead className="w-[150px]">Admission No.</TableHead>
                  <TableHead className="w-[120px]">Marks</TableHead>
                  <TableHead className="w-[80px] text-center">Absent</TableHead>
                  <TableHead className="w-[200px]">Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const entry = markEntries[student.id] || {
                    marksObtained: 0,
                    isAbsent: false,
                    remarks: '',
                    hasError: false,
                  }
                  const isPassing =
                    !entry.isAbsent &&
                    entry.marksObtained >= (selectedSubject?.passingMarks || 0)

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.rollNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {student.name}
                          {!entry.isAbsent && (
                            <Badge variant={isPassing ? 'success' : 'destructive'} className="text-xs">
                              {isPassing ? 'Pass' : 'Fail'}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {student.admissionNumber}
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <Input
                            type="number"
                            min={0}
                            max={selectedSubject?.maxMarks}
                            value={entry.isAbsent ? '' : entry.marksObtained}
                            onChange={(e) =>
                              updateMark(student.id, 'marksObtained', e.target.value)
                            }
                            disabled={entry.isAbsent}
                            className={entry.hasError ? 'border-destructive' : ''}
                          />
                          {entry.hasError && (
                            <AlertCircle className="absolute right-2 top-2 h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={entry.isAbsent}
                          onCheckedChange={(checked) =>
                            updateMark(student.id, 'isAbsent', checked)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="Optional remarks"
                          value={entry.remarks}
                          onChange={(e) => updateMark(student.id, 'remarks', e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
