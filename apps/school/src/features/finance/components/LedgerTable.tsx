import { useState } from 'react'
import { ArrowUpCircle, ArrowDownCircle, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Skeleton } from '@/components/ui/skeleton'
import { useLedger } from '../hooks/useFinance'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import type { LedgerEntryType } from '../types/finance.types'
import { Pagination } from '@/components/ui/pagination'

export function LedgerTable() {
  const [type, setType] = useState<LedgerEntryType | 'all'>('all')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [page, setPage] = useState(1)

  const { data, isLoading, error } = useLedger({
    type: type !== 'all' ? type : undefined,
    dateFrom: dateRange.from?.toISOString(),
    dateTo: dateRange.to?.toISOString(),
    page,
    limit: 20,
  })

  const handleDateSelect = (date: Date | undefined) => {
    if (!dateRange.from || (dateRange.from && dateRange.to)) {
      setDateRange({ from: date, to: undefined })
    } else {
      if (date && date < dateRange.from) {
        setDateRange({ from: date, to: dateRange.from })
      } else {
        setDateRange({ ...dateRange, to: date })
      }
    }
    setPage(1)
  }

  const clearDateRange = () => {
    setDateRange({})
    setPage(1)
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load ledger entries. Please try again.
      </div>
    )
  }

  const entries = data?.data || []
  const pagination = data?.meta

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={type}
          onValueChange={(v) => {
            setType(v as LedgerEntryType | 'all')
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Transaction Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transactions</SelectItem>
            <SelectItem value="credit">Credits Only</SelectItem>
            <SelectItem value="debit">Debits Only</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start">
              <Calendar className="h-4 w-4 mr-2" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {formatDate(dateRange.from.toISOString(), { month: 'short', day: 'numeric' })} -{' '}
                    {formatDate(dateRange.to.toISOString(), { month: 'short', day: 'numeric' })}
                  </>
                ) : (
                  formatDate(dateRange.from.toISOString(), { month: 'short', day: 'numeric' })
                )
              ) : (
                'Select date range'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={dateRange.to || dateRange.from}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {(dateRange.from || dateRange.to) && (
          <Button variant="ghost" size="sm" onClick={clearDateRange}>
            Clear dates
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Credit</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No ledger entries found
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-sm">
                    {formatDate(entry.date, {
                      month: 'short',
                      day: 'numeric',
                      year: '2-digit',
                    })}
                  </TableCell>
                  <TableCell>
                    {entry.type === 'credit' ? (
                      <Badge variant="success" className="gap-1">
                        <ArrowUpCircle className="h-3 w-3" />
                        Credit
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="gap-1">
                        <ArrowDownCircle className="h-3 w-3" />
                        Debit
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {entry.referenceNumber}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {entry.description}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-medium",
                    entry.type === 'credit' && "text-green-600"
                  )}>
                    {entry.type === 'credit' ? formatCurrency(entry.amount) : '-'}
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-medium",
                    entry.type === 'debit' && "text-red-600"
                  )}>
                    {entry.type === 'debit' ? formatCurrency(entry.amount) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(entry.balance)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
