import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useGenerateReport } from '../hooks/useReports'
import {
  REPORT_FORMATS,
  DATE_RANGE_PRESETS,
  type ReportTemplate,
  type ReportDefinition,
  type ReportFormat,
  type DateRangePreset,
} from '../types/reports.types'

interface GenerateReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: ReportTemplate | null
  definition?: ReportDefinition | null
}

export function GenerateReportDialog({
  open,
  onOpenChange,
  template,
  definition,
}: GenerateReportDialogProps) {
  const { toast } = useToast()
  const generateMutation = useGenerateReport()

  const [reportName, setReportName] = useState('')
  const [format, setFormat] = useState<ReportFormat>('pdf')
  const [datePreset, setDatePreset] = useState<DateRangePreset>('thisMonth')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const source = template || definition
  const sourceId = template?.id || definition?.id

  const handleGenerate = async () => {
    if (!sourceId) return

    try {
      await generateMutation.mutateAsync({
        definitionId: definition?.id,
        templateId: template?.id,
        name: reportName || source?.name || 'Report',
        format,
        dateRange: {
          preset: datePreset,
          startDate: datePreset === 'custom' ? startDate : undefined,
          endDate: datePreset === 'custom' ? endDate : undefined,
        },
      })

      toast({
        title: 'Report Generation Started',
        description: 'Your report is being generated. It will be available shortly.',
      })
      onOpenChange(false)
      resetForm()
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const resetForm = () => {
    setReportName('')
    setFormat('pdf')
    setDatePreset('thisMonth')
    setStartDate('')
    setEndDate('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Report
          </DialogTitle>
          <DialogDescription>
            {source?.name || 'Configure and generate your report.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Report Name */}
          <div className="space-y-2">
            <Label htmlFor="reportName">Report Name</Label>
            <Input
              id="reportName"
              placeholder={source?.name || 'Enter report name'}
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>

          {/* Format */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as ReportFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REPORT_FORMATS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DateRangePreset)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_RANGE_PRESETS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {datePreset === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Description */}
          {source?.description && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
              {source.description}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
