import { useState } from 'react'
import { Play, Loader2, CheckCircle, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/utils'
import type { SalarySlip } from '../types/staff.types'

interface MonthlySalaryRunProps {
  onProcess: (month: number, year: number) => Promise<SalarySlip[]>
  isProcessing?: boolean
}

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
]

export function MonthlySalaryRun({ onProcess, isProcessing }: MonthlySalaryRunProps) {
  const currentDate = new Date()
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())
  const [processedSlips, setProcessedSlips] = useState<SalarySlip[] | null>(null)

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

  const handleProcess = async () => {
    const slips = await onProcess(month, year)
    setProcessedSlips(slips)
  }

  const totalGross = processedSlips?.reduce((sum, s) => sum + s.earnings.gross, 0) || 0
  const totalDeductions = processedSlips?.reduce((sum, s) => sum + s.deductions.total, 0) || 0
  const totalNet = processedSlips?.reduce((sum, s) => sum + s.netPayable, 0) || 0

  return (
    <div className="space-y-6">
      {/* Month/Year Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Process Monthly Salary</CardTitle>
          <CardDescription>
            Generate salary slips for all active staff members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium">Month</label>
              <Select value={String(month)} onValueChange={(v) => setMonth(parseInt(v))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={String(m.value)}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleProcess} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Process Salary
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {processedSlips && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Salary Processed
            </CardTitle>
            <CardDescription>
              {MONTHS.find((m) => m.value === month)?.label} {year}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {processedSlips.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No new salary slips were generated. Salary may have already been processed for this month.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Staff Count</span>
                    </div>
                    <p className="text-2xl font-bold">{processedSlips.length}</p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-800 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Gross</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-200">{formatCurrency(totalGross)}</p>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-800 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total Deductions</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-200">{formatCurrency(totalDeductions)}</p>
                  </div>

                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Net Payable</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalNet)}</p>
                  </div>
                </div>

                {/* Slip List */}
                <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                  {processedSlips.map((slip) => (
                    <div key={slip.id} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{slip.staffName}</p>
                        <p className="text-sm text-muted-foreground">
                          Gross: {formatCurrency(slip.earnings.gross)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(slip.netPayable)}</p>
                        <p className="text-xs text-muted-foreground">Net Pay</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
