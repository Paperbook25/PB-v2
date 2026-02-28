import { Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, cn } from '@/lib/utils'
import type { SalarySlip } from '../types/staff.types'

interface SalarySlipViewProps {
  slip: SalarySlip
  onMarkPaid?: () => void
  isMarkingPaid?: boolean
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export function SalarySlipView({ slip, onMarkPaid, isMarkingPaid }: SalarySlipViewProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Card className="print:shadow-none">
      <CardHeader className="flex flex-row items-center justify-between print:hidden">
        <CardTitle className="text-base">
          Salary Slip - {MONTHS[slip.month - 1]} {slip.year}
        </CardTitle>
        <div className="flex gap-2">
          {slip.status === 'generated' && onMarkPaid && (
            <Button variant="default" size="sm" onClick={onMarkPaid} disabled={isMarkingPaid}>
              Mark as Paid
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div>
            <h3 className="text-lg font-semibold">PaperBook School</h3>
            <p className="text-sm text-muted-foreground">Salary Slip</p>
          </div>
          <div className="text-right">
            <p className="font-medium">{MONTHS[slip.month - 1]} {slip.year}</p>
            <Badge variant={slip.status === 'paid' ? 'default' : 'secondary'}>
              {slip.status === 'paid' ? 'Paid' : 'Generated'}
            </Badge>
          </div>
        </div>

        {/* Employee Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 pb-4 border-b">
          <div>
            <p className="text-sm text-muted-foreground">Employee Name</p>
            <p className="font-medium">{slip.staffName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Slip ID</p>
            <p className="font-mono text-sm">{slip.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        {/* Earnings & Deductions */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Earnings */}
          <div>
            <h4 className="font-medium text-green-600 mb-3">Earnings</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Basic Salary</span>
                <span>{formatCurrency(slip.earnings.basic)}</span>
              </div>
              <div className="flex justify-between">
                <span>HRA</span>
                <span>{formatCurrency(slip.earnings.hra)}</span>
              </div>
              <div className="flex justify-between">
                <span>DA</span>
                <span>{formatCurrency(slip.earnings.da)}</span>
              </div>
              <div className="flex justify-between">
                <span>Conveyance</span>
                <span>{formatCurrency(slip.earnings.conveyance)}</span>
              </div>
              <div className="flex justify-between">
                <span>Special Allowance</span>
                <span>{formatCurrency(slip.earnings.allowances)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Gross Salary</span>
                <span className="text-green-600">{formatCurrency(slip.earnings.gross)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h4 className="font-medium text-red-600 mb-3">Deductions</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Provident Fund</span>
                <span>{formatCurrency(slip.deductions.pf)}</span>
              </div>
              <div className="flex justify-between">
                <span>Professional Tax</span>
                <span>{formatCurrency(slip.deductions.professionalTax)}</span>
              </div>
              <div className="flex justify-between">
                <span>TDS</span>
                <span>{formatCurrency(slip.deductions.tax)}</span>
              </div>
              {slip.deductions.lop > 0 && (
                <div className="flex justify-between">
                  <span>LOP Deduction</span>
                  <span>{formatCurrency(slip.deductions.lop)}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total Deductions</span>
                <span className="text-red-600">{formatCurrency(slip.deductions.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay */}
        <div className="bg-primary/5 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Net Payable</p>
              <p className="text-2xl font-bold">{formatCurrency(slip.netPayable)}</p>
            </div>
            {slip.paidOn && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Paid on</p>
                <p className="font-medium">
                  {new Date(slip.paidOn).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
