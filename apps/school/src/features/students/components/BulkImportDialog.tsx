import { useState, useMemo, useCallback } from 'react'
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useBulkImport } from '../hooks/useStudents'
import { useToast } from '@/hooks/use-toast'
import type { BulkImportResult } from '../types/student.types'

// ==================== CONSTANTS ====================

const EXPECTED_COLUMNS = [
  'name',
  'email',
  'phone',
  'dateOfBirth',
  'gender',
  'class',
  'section',
  'fatherName',
  'motherName',
  'guardianPhone',
] as const

type ExpectedColumn = (typeof EXPECTED_COLUMNS)[number]

const COLUMN_LABELS: Record<ExpectedColumn, string> = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  dateOfBirth: 'Date of Birth',
  gender: 'Gender',
  class: 'Class',
  section: 'Section',
  fatherName: 'Father Name',
  motherName: 'Mother Name',
  guardianPhone: 'Guardian Phone',
}

const VALID_GENDERS = ['male', 'female', 'other']
const VALID_CLASSES = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)
const VALID_SECTIONS = ['A', 'B', 'C', 'D']

type Step = 'upload' | 'preview' | 'import'

interface RowValidation {
  row: Record<string, string>
  errors: Record<string, string>
  isValid: boolean
}

// ==================== PROPS ====================

interface BulkImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ==================== VALIDATION ====================

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validatePhone(phone: string): boolean {
  return /^\d{10,15}$/.test(phone.replace(/[\s\-+()]/g, ''))
}

function validateDateOfBirth(dob: string): boolean {
  const date = new Date(dob)
  if (isNaN(date.getTime())) return false
  const now = new Date()
  const age = now.getFullYear() - date.getFullYear()
  return age >= 3 && age <= 25
}

function validateRow(row: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!row.name?.trim()) {
    errors.name = 'Name is required'
  }

  if (!row.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!validateEmail(row.email.trim())) {
    errors.email = 'Invalid email format'
  }

  if (!row.phone?.trim()) {
    errors.phone = 'Phone is required'
  } else if (!validatePhone(row.phone.trim())) {
    errors.phone = 'Invalid phone number'
  }

  if (!row.dateOfBirth?.trim()) {
    errors.dateOfBirth = 'Date of birth is required'
  } else if (!validateDateOfBirth(row.dateOfBirth.trim())) {
    errors.dateOfBirth = 'Invalid date (student must be 3-25 years old)'
  }

  if (!row.gender?.trim()) {
    errors.gender = 'Gender is required'
  } else if (!VALID_GENDERS.includes(row.gender.trim().toLowerCase())) {
    errors.gender = 'Gender must be male, female, or other'
  }

  if (!row.class?.trim()) {
    errors.class = 'Class is required'
  } else if (!VALID_CLASSES.includes(row.class.trim())) {
    errors.class = 'Invalid class (Class 1 through Class 12)'
  }

  if (!row.section?.trim()) {
    errors.section = 'Section is required'
  } else if (!VALID_SECTIONS.includes(row.section.trim().toUpperCase())) {
    errors.section = 'Section must be A, B, C, or D'
  }

  if (!row.fatherName?.trim()) {
    errors.fatherName = 'Father name is required'
  }

  if (!row.motherName?.trim()) {
    errors.motherName = 'Mother name is required'
  }

  if (!row.guardianPhone?.trim()) {
    errors.guardianPhone = 'Guardian phone is required'
  } else if (!validatePhone(row.guardianPhone.trim())) {
    errors.guardianPhone = 'Invalid guardian phone number'
  }

  return errors
}

// ==================== CSV PARSING ====================

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  const headers = lines[0].split(',').map((h) => h.trim())
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header] = values[index] || ''
    })
    rows.push(row)
  }

  return { headers, rows }
}

function generateTemplateCSV(): string {
  const header = EXPECTED_COLUMNS.join(',')
  const sampleRow = [
    'Rahul Sharma',
    'rahul.sharma@example.com',
    '9876543210',
    '2015-03-15',
    'male',
    'Class 5',
    'A',
    'Rajesh Sharma',
    'Priya Sharma',
    '9876543211',
  ].join(',')
  return `${header}\n${sampleRow}`
}

// ==================== COMPONENT ====================

export function BulkImportDialog({ open, onOpenChange }: BulkImportDialogProps) {
  const [step, setStep] = useState<Step>('upload')
  const [csvText, setCsvText] = useState('')
  const [parsedData, setParsedData] = useState<RowValidation[]>([])
  const [headerErrors, setHeaderErrors] = useState<string[]>([])
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null)

  const bulkImport = useBulkImport()
  const { toast } = useToast()

  // ==================== COMPUTED ====================

  const validCount = useMemo(() => parsedData.filter((r) => r.isValid).length, [parsedData])
  const invalidCount = useMemo(() => parsedData.filter((r) => !r.isValid).length, [parsedData])

  // ==================== HANDLERS ====================

  const handleDownloadTemplate = useCallback(() => {
    const csv = generateTemplateCSV()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'student_import_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [])

  const handleParseAndPreview = useCallback(() => {
    if (!csvText.trim()) {
      toast({
        title: 'No data',
        description: 'Please paste CSV data or enter rows manually.',
        variant: 'destructive',
      })
      return
    }

    const { headers, rows } = parseCSV(csvText)

    // Validate headers
    const missingHeaders = EXPECTED_COLUMNS.filter((col) => !headers.includes(col))
    if (missingHeaders.length > 0) {
      setHeaderErrors(missingHeaders)
      toast({
        title: 'Missing columns',
        description: `CSV is missing required columns: ${missingHeaders.join(', ')}`,
        variant: 'destructive',
      })
      return
    }

    setHeaderErrors([])

    if (rows.length === 0) {
      toast({
        title: 'No data rows',
        description: 'The CSV contains headers but no data rows.',
        variant: 'destructive',
      })
      return
    }

    // Validate each row
    const validated: RowValidation[] = rows.map((row) => {
      const errors = validateRow(row)
      return {
        row,
        errors,
        isValid: Object.keys(errors).length === 0,
      }
    })

    setParsedData(validated)
    setStep('preview')
  }, [csvText, toast])

  const handleImport = useCallback(async () => {
    const validRows = parsedData.filter((r) => r.isValid).map((r) => r.row)

    if (validRows.length === 0) {
      toast({
        title: 'No valid rows',
        description: 'There are no valid rows to import. Please fix the errors and try again.',
        variant: 'destructive',
      })
      return
    }

    setStep('import')

    try {
      const response = await bulkImport.mutateAsync(validRows)
      const result = response.data
      setImportResult(result)

      if (result.failed === 0) {
        toast({
          title: 'Import successful',
          description: `Successfully imported ${result.successful} students.`,
        })
      } else {
        toast({
          title: 'Import completed with errors',
          description: `${result.successful} imported, ${result.failed} failed.`,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      })
    }
  }, [parsedData, bulkImport, toast])

  const handleReset = useCallback(() => {
    setStep('upload')
    setCsvText('')
    setParsedData([])
    setHeaderErrors([])
    setImportResult(null)
  }, [])

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        handleReset()
      }
      onOpenChange(newOpen)
    },
    [onOpenChange, handleReset]
  )

  // ==================== RENDER ====================

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* ==================== UPLOAD STEP ==================== */}
        {step === 'upload' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Bulk Import Students
              </DialogTitle>
              <DialogDescription>
                Import multiple students at once using CSV data. Download the template,
                fill in the student details, and paste the data below.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Template download */}
              <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm">CSV Template</p>
                  <p className="text-xs text-muted-foreground">
                    Download the template with all required columns
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>

              {/* Expected columns info */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Expected Columns</p>
                <div className="flex flex-wrap gap-1.5">
                  {EXPECTED_COLUMNS.map((col) => (
                    <Badge key={col} variant="secondary" className="text-xs">
                      {COLUMN_LABELS[col]}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Header errors */}
              {headerErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Missing columns: {headerErrors.map((h) => COLUMN_LABELS[h as ExpectedColumn] || h).join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              {/* CSV text area */}
              <div className="space-y-2">
                <label htmlFor="csv-input" className="text-sm font-medium">
                  Paste CSV Data
                </label>
                <textarea
                  id="csv-input"
                  className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-mono"
                  placeholder={`name,email,phone,dateOfBirth,gender,class,section,fatherName,motherName,guardianPhone\nRahul Sharma,rahul@example.com,9876543210,2015-03-15,male,Class 5,A,Rajesh Sharma,Priya Sharma,9876543211`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  First row must be the header. Each subsequent row is a student record.
                  Separate values with commas.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleParseAndPreview} disabled={!csvText.trim()}>
                <Upload className="h-4 w-4 mr-2" />
                Parse & Preview
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ==================== PREVIEW STEP ==================== */}
        {step === 'preview' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Preview Import Data
              </DialogTitle>
              <DialogDescription>
                Review the parsed data below. Rows with errors are highlighted in red
                and will be skipped during import.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Summary badges */}
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="text-sm">
                  Total: {parsedData.length}
                </Badge>
                <Badge
                  className="text-sm bg-green-100 text-green-800 hover:bg-green-100"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                  Valid: {validCount}
                </Badge>
                {invalidCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="text-sm"
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Invalid: {invalidCount}
                  </Badge>
                )}
              </div>

              {/* Data table */}
              <div className="border rounded-lg overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12 sticky top-0 bg-background">#</TableHead>
                      <TableHead className="sticky top-0 bg-background">Status</TableHead>
                      {EXPECTED_COLUMNS.map((col) => (
                        <TableHead
                          key={col}
                          className="sticky top-0 bg-background whitespace-nowrap"
                        >
                          {COLUMN_LABELS[col]}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((item, index) => (
                      <TableRow
                        key={index}
                        className={!item.isValid ? 'bg-red-50 dark:bg-red-900/30' : ''}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          {item.isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </TableCell>
                        {EXPECTED_COLUMNS.map((col) => (
                          <TableCell
                            key={col}
                            className={
                              item.errors[col]
                                ? 'text-red-600 font-medium'
                                : ''
                            }
                            title={item.errors[col] || undefined}
                          >
                            <div className="max-w-[150px] truncate">
                              {item.row[col] || (
                                <span className="text-muted-foreground italic text-xs">
                                  empty
                                </span>
                              )}
                            </div>
                            {item.errors[col] && (
                              <p className="text-xs text-red-500 mt-0.5">
                                {item.errors[col]}
                              </p>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {invalidCount > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {invalidCount} row{invalidCount > 1 ? 's have' : ' has'} validation
                    errors and will be skipped. Only {validCount} valid row
                    {validCount !== 1 ? 's' : ''} will be imported.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setStep('upload')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={validCount === 0 || bulkImport.isPending}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import {validCount} Student{validCount !== 1 ? 's' : ''}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ==================== IMPORT STEP ==================== */}
        {step === 'import' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Import Results
              </DialogTitle>
              <DialogDescription>
                {bulkImport.isPending
                  ? 'Importing students, please wait...'
                  : 'Import process completed.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-2">
              {/* Progress indicator */}
              {bulkImport.isPending && (
                <div className="space-y-3">
                  <Progress value={undefined} className="animate-pulse" />
                  <p className="text-sm text-muted-foreground text-center">
                    Processing {validCount} student records...
                  </p>
                </div>
              )}

              {/* Results */}
              {importResult && (
                <div className="space-y-4">
                  {/* Result summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold">{importResult.total}</p>
                      <p className="text-sm text-muted-foreground">Total</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-green-50 dark:bg-green-800/30">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-200">
                        {importResult.successful}
                      </p>
                      <p className="text-sm text-muted-foreground">Imported</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-red-50 dark:bg-red-800/30">
                      <p className="text-2xl font-bold text-red-600 dark:text-red-200">
                        {importResult.failed}
                      </p>
                      <p className="text-sm text-muted-foreground">Failed</p>
                    </div>
                  </div>

                  {/* Success message */}
                  {importResult.failed === 0 && (
                    <Alert>
                      <CheckCircle2 className="h-4 w-4" />
                      <AlertDescription>
                        All {importResult.successful} students were imported successfully.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Error details */}
                  {importResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-red-600">Error Details</p>
                      <div className="border rounded-lg overflow-auto max-h-[200px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-16">Row</TableHead>
                              <TableHead className="w-32">Field</TableHead>
                              <TableHead>Error</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {importResult.errors.map((err, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-mono text-xs">
                                  {err.row}
                                </TableCell>
                                <TableCell className="font-medium text-sm">
                                  {err.field}
                                </TableCell>
                                <TableCell className="text-sm text-red-600">
                                  {err.message}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error from mutation itself */}
              {bulkImport.isError && !importResult && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {bulkImport.error instanceof Error
                      ? bulkImport.error.message
                      : 'An unexpected error occurred during import.'}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {(importResult || bulkImport.isError) && (
                <>
                  <Button variant="outline" onClick={handleReset}>
                    Import More
                  </Button>
                  <Button onClick={() => handleOpenChange(false)}>
                    Done
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
