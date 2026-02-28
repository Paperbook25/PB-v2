import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLedgerBalance } from '../hooks/useFinance'
import { formatCurrency, formatDate } from '@/lib/utils'

export function BalanceSummaryCard() {
  const { data, isLoading, error } = useLedgerBalance()

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Failed to load balance summary
        </CardContent>
      </Card>
    )
  }

  const balance = data?.data

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Account Balance</CardTitle>
        <CardDescription>
          {balance && `As of ${formatDate(balance.asOfDate, { month: 'long', day: 'numeric', year: 'numeric' })}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ) : balance ? (
          <>
            {/* Closing Balance */}
            <div className="bg-primary/5 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-2xl font-bold">{formatCurrency(balance.closingBalance)}</p>
                </div>
              </div>
            </div>

            {/* Credits and Debits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-muted-foreground">Total Credits</span>
                </div>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(balance.totalCredits)}
                </p>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="flex items-center gap-2 mb-1">
                  <ArrowDownCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-muted-foreground">Total Debits</span>
                </div>
                <p className="text-lg font-semibold text-red-600">
                  {formatCurrency(balance.totalDebits)}
                </p>
              </div>
            </div>

            {/* Opening Balance */}
            <div className="flex justify-between items-center text-sm pt-2 border-t">
              <span className="text-muted-foreground">Opening Balance</span>
              <span className="font-medium">{formatCurrency(balance.openingBalance)}</span>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
