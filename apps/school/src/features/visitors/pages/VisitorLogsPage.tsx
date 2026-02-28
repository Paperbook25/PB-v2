import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Download } from 'lucide-react'
import { usePasses } from '../hooks/useVisitors'
import {
  VISIT_PURPOSE_LABELS,
  VISIT_STATUS_LABELS,
  type VisitPurpose,
} from '../types/visitor.types'

export function VisitorLogsPage() {
  const [dateFilter, setDateFilter] = useState('')
  const [purposeFilter, setPurposeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)

  const { data: passesResult, isLoading } = usePasses({
    date: dateFilter || undefined,
    purpose: purposeFilter || undefined,
    status: statusFilter || undefined,
    search: searchTerm || undefined,
    page,
    limit: 20,
  })

  const passes = passesResult?.data || []
  const meta = passesResult?.meta

  const formatDateTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const calculateDuration = (checkIn: string, checkOut?: string) => {
    if (!checkOut) return '-'
    const minutes = Math.floor(
      (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 60000
    )
    if (minutes < 60) return `${minutes}m`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'expired':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <PageHeader
        title="Visitor Logs"
        description="Historical record of all visitor passes"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Visitors', href: '/visitors' },
          { label: 'Logs' },
        ]}
      />

      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div>
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Name, phone, pass..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
              <div>
                <Label>Purpose</Label>
                <Select value={purposeFilter || 'all'} onValueChange={(v) => setPurposeFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Purposes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Purposes</SelectItem>
                    {Object.entries(VISIT_PURPOSE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={statusFilter || 'all'} onValueChange={(v) => setStatusFilter(v === 'all' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(VISIT_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">Loading logs...</div>
            ) : passes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No visitor logs found. Try adjusting your filters.
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pass #</TableHead>
                      <TableHead>Visitor</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {passes.map((pass) => (
                      <TableRow key={pass.id}>
                        <TableCell className="font-mono text-sm">{pass.passNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{pass.visitorName}</p>
                            <p className="text-sm text-muted-foreground">{pass.visitorPhone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{pass.visitorCompany || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {VISIT_PURPOSE_LABELS[pass.purpose]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{pass.hostName}</p>
                            <p className="text-sm text-muted-foreground">{pass.hostDepartment}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatDateTime(pass.checkInTime)}</TableCell>
                        <TableCell>
                          {pass.checkOutTime ? formatDateTime(pass.checkOutTime) : '-'}
                        </TableCell>
                        <TableCell>
                          {calculateDuration(pass.checkInTime, pass.checkOutTime)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(pass.status)}>
                            {VISIT_STATUS_LABELS[pass.status]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {(page - 1) * (meta.limit) + 1} to{' '}
                      {Math.min(page * meta.limit, meta.total)} of {meta.total} entries
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                        disabled={page === meta.totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
