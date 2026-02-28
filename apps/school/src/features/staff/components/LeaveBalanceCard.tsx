import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { LEAVE_TYPE_LABELS, type LeaveBalance, type LeaveType } from '../types/staff.types'

interface LeaveBalanceCardProps {
  balance: LeaveBalance
}

const LEAVE_COLORS: Record<LeaveType, { bg: string; progress: string }> = {
  EL: { bg: 'bg-green-50 dark:bg-green-800', progress: 'bg-green-500' },
  CL: { bg: 'bg-blue-50 dark:bg-blue-800', progress: 'bg-blue-500' },
  SL: { bg: 'bg-orange-50 dark:bg-orange-800', progress: 'bg-orange-500' },
  PL: { bg: 'bg-purple-50 dark:bg-purple-800', progress: 'bg-purple-500' },
}

export function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
  const leaveTypes: LeaveType[] = ['EL', 'CL', 'SL', 'PL']

  const totalAvailable = leaveTypes.reduce((sum, type) => sum + balance[type].available, 0)
  const totalUsed = leaveTypes.reduce((sum, type) => sum + balance[type].used, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Leave Balance ({balance.year})</span>
          <span className="text-sm font-normal text-muted-foreground">
            {totalAvailable} days available
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {leaveTypes.map((type) => {
            const data = balance[type]
            const usedPercentage = (data.used / data.total) * 100

            return (
              <div key={type} className={`p-4 rounded-lg ${LEAVE_COLORS[type].bg}`}>
                <p className="text-sm font-medium">{LEAVE_TYPE_LABELS[type]}</p>
                <p className="text-2xl font-bold mt-1">{data.available}</p>
                <p className="text-xs text-muted-foreground">of {data.total} remaining</p>
                <Progress
                  value={usedPercentage}
                  className="mt-2 h-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {data.used} used
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
