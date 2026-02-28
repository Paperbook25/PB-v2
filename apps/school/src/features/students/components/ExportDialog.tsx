import { useState, useCallback } from 'react'
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useExportStudents } from '../hooks/useStudents'
import { useToast } from '@/hooks/use-toast'

// ==================== CONSTANTS ====================

const CLASSES = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)
const SECTIONS = ['A', 'B', 'C', 'D']

const ALL_CLASSES_VALUE = '__all__'
const ALL_SECTIONS_VALUE = '__all__'

// ==================== PROPS ====================

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ==================== HELPERS ====================

function convertToCSV(data: Record<string, string | number>[]): string {
  if (data.length === 0) return ''

  const headers = Object.keys(data[0])
  const headerRow = headers.join(',')
  const dataRows = data.map((row) =>
    headers
      .map((header) => {
        const value = String(row[header] ?? '')
        // Escape values that contain commas, quotes, or newlines
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      })
      .join(',')
  )

  return [headerRow, ...dataRows].join('\n')
}

function triggerDownload(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ==================== COMPONENT ====================

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [selectedClass, setSelectedClass] = useState<string>(ALL_CLASSES_VALUE)
  const [selectedSection, setSelectedSection] = useState<string>(ALL_SECTIONS_VALUE)

  const exportMutation = useExportStudents()
  const { toast } = useToast()

  const handleExport = useCallback(async () => {
    const filters: { class?: string; section?: string } = {}

    if (selectedClass !== ALL_CLASSES_VALUE) {
      filters.class = selectedClass
    }
    if (selectedSection !== ALL_SECTIONS_VALUE) {
      filters.section = selectedSection
    }

    try {
      const response = await exportMutation.mutateAsync(
        Object.keys(filters).length > 0 ? filters : undefined
      )
      const result = response.data

      if (!result || result.length === 0) {
        toast({
          title: 'No data to export',
          description: 'No students found matching the selected filters.',
          variant: 'destructive',
        })
        return
      }

      const csv = convertToCSV(result)

      // Build filename with filters
      const parts = ['students']
      if (filters.class) parts.push(filters.class.replace(/\s+/g, '_'))
      if (filters.section) parts.push(`Section_${filters.section}`)
      const timestamp = new Date().toISOString().split('T')[0]
      parts.push(timestamp)
      const filename = `${parts.join('_')}.csv`

      triggerDownload(csv, filename)

      toast({
        title: 'Export successful',
        description: `Exported ${result.length} student records.`,
      })
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'An unexpected error occurred.',
        variant: 'destructive',
      })
    }
  }, [selectedClass, selectedSection, exportMutation, toast])

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setSelectedClass(ALL_CLASSES_VALUE)
        setSelectedSection(ALL_SECTIONS_VALUE)
      }
      onOpenChange(newOpen)
    },
    [onOpenChange]
  )

  const filterDescription = (() => {
    const parts: string[] = []
    if (selectedClass !== ALL_CLASSES_VALUE) parts.push(selectedClass)
    if (selectedSection !== ALL_SECTIONS_VALUE) parts.push(`Section ${selectedSection}`)
    return parts.length > 0 ? parts.join(', ') : 'All students'
  })()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Export Students
          </DialogTitle>
          <DialogDescription>
            Download student data as a CSV file. Optionally filter by class and section.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Class filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Class</label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CLASSES_VALUE}>All Classes</SelectItem>
                {CLASSES.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Section</label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="All Sections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_SECTIONS_VALUE}>All Sections</SelectItem>
                {SECTIONS.map((sec) => (
                  <SelectItem key={sec} value={sec}>
                    Section {sec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Export summary */}
          <Alert>
            <FileSpreadsheet className="h-4 w-4" />
            <AlertDescription>
              Export will include: <span className="font-medium">{filterDescription}</span>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exportMutation.isPending}>
            {exportMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
