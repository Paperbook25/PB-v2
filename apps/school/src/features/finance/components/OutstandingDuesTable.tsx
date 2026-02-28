import { useState } from 'react'
import { Search, Send, AlertTriangle, Phone, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { useOutstandingDues } from '../hooks/useFinance'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CLASSES, type OutstandingDue } from '../types/finance.types'
import { ReminderDialog } from './ReminderDialog'
import { Pagination } from '@/components/ui/pagination'

const OVERDUE_FILTERS = [
  { label: 'All', value: '0' },
  { label: '7+ days', value: '7' },
  { label: '15+ days', value: '15' },
  { label: '30+ days', value: '30' },
  { label: '60+ days', value: '60' },
]

export function OutstandingDuesTable() {
  const [search, setSearch] = useState('')
  const [className, setClassName] = useState<string>('all')
  const [minDaysOverdue, setMinDaysOverdue] = useState('0')
  const [page, setPage] = useState(1)
  const [selectedStudents, setSelectedStudents] = useState<OutstandingDue[]>([])
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false)

  const { data, isLoading, error } = useOutstandingDues({
    search: search || undefined,
    className: className !== 'all' ? className : undefined,
    minDaysOverdue: minDaysOverdue !== '0' ? parseInt(minDaysOverdue) : undefined,
    page,
    limit: 10,
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(data?.data || [])
    } else {
      setSelectedStudents([])
    }
  }

  const handleSelectStudent = (student: OutstandingDue, checked: boolean) => {
    if (checked) {
      setSelectedStudents((prev) => [...prev, student])
    } else {
      setSelectedStudents((prev) => prev.filter((s) => s.id !== student.id))
    }
  }

  const isSelected = (id: string) => selectedStudents.some((s) => s.id === id)
  const allSelected = (data?.data?.length ?? 0) > 0 && selectedStudents.length === (data?.data?.length ?? 0)

  const getOverdueBadgeVariant = (days: number) => {
    if (days >= 60) return 'destructive'
    if (days >= 30) return 'warning'
    return 'secondary'
  }

  if (error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Failed to load outstanding dues. Please try again.
      </div>
    )
  }

  const outstandingDues = data?.data || []
  const pagination = data?.meta

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name, admission no..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={className}
          onValueChange={(v) => {
            setClassName(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {CLASSES.map((cls) => (
              <SelectItem key={cls} value={cls}>
                {cls}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={minDaysOverdue}
          onValueChange={(v) => {
            setMinDaysOverdue(v)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Overdue Days" />
          </SelectTrigger>
          <SelectContent>
            {OVERDUE_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>
                {filter.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedStudents.length > 0 && (
        <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
          <span className="text-sm">
            {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
            <span className="text-muted-foreground ml-2">
              (Total: {formatCurrency(selectedStudents.reduce((sum, s) => sum + s.totalDue, 0))})
            </span>
          </span>
          <Button size="sm" onClick={() => setReminderDialogOpen(true)}>
            <Send className="h-4 w-4 mr-2" />
            Send Reminders
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Total Due</TableHead>
              <TableHead>Overdue</TableHead>
              <TableHead>Last Reminder</TableHead>
              <TableHead>Contact</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))
            ) : outstandingDues.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No outstanding dues found
                </TableCell>
              </TableRow>
            ) : (
              outstandingDues.map((due) => (
                <TableRow key={due.id}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected(due.id)}
                      onCheckedChange={(checked) => handleSelectStudent(due, !!checked)}
                      aria-label={`Select ${due.studentName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{due.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {due.studentClass} - {due.studentSection} | {due.admissionNumber}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-red-600">
                        {formatCurrency(due.totalDue)}
                      </p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-muted-foreground cursor-help">
                              {due.feeBreakdown.length} fee type{due.feeBreakdown.length > 1 ? 's' : ''}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              {due.feeBreakdown.map((fee, i) => (
                                <div key={i} className="flex justify-between gap-4 text-xs">
                                  <span>{fee.feeTypeName}</span>
                                  <span>{formatCurrency(fee.amount)}</span>
                                </div>
                              ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getOverdueBadgeVariant(due.daysOverdue)}>
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {due.daysOverdue} days
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {due.lastReminderSentAt ? (
                      formatDate(due.lastReminderSentAt, {
                        month: 'short',
                        day: 'numeric',
                      })
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{due.parentPhone}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>{due.parentEmail}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
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

      {/* Reminder Dialog */}
      <ReminderDialog
        open={reminderDialogOpen}
        onOpenChange={setReminderDialogOpen}
        selectedStudents={selectedStudents}
      />
    </div>
  )
}
