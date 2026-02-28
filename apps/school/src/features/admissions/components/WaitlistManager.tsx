import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
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
import { Users, Clock, AlertCircle } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import { useWaitlist, useClassCapacity } from '../hooks/useAdmissions'
import { CLASSES } from '../types/admission.types'
import type { WaitlistEntry, ClassCapacity } from '../types/admission.types'

function getStatusBadgeVariant(status: WaitlistEntry['status']) {
  switch (status) {
    case 'waiting':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'offered':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'expired':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getCapacityColor(filled: number, total: number): string {
  const ratio = total > 0 ? filled / total : 0
  if (ratio >= 0.9) return 'text-red-600'
  if (ratio >= 0.7) return 'text-orange-600'
  return 'text-green-600'
}

function CapacityCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-16" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-2 w-full mb-3" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

function WaitlistTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

interface GroupedCapacity {
  className: string
  sections: ClassCapacity[]
  totalSeats: number
  totalFilled: number
  totalAvailable: number
  totalWaitlist: number
}

function groupCapacityByClass(capacities: ClassCapacity[]): GroupedCapacity[] {
  const grouped = new Map<string, ClassCapacity[]>()

  for (const cap of capacities) {
    const existing = grouped.get(cap.class) || []
    existing.push(cap)
    grouped.set(cap.class, existing)
  }

  return Array.from(grouped.entries()).map(([className, sections]) => ({
    className,
    sections,
    totalSeats: sections.reduce((sum, s) => sum + s.totalSeats, 0),
    totalFilled: sections.reduce((sum, s) => sum + s.filledSeats, 0),
    totalAvailable: sections.reduce((sum, s) => sum + s.availableSeats, 0),
    totalWaitlist: sections.reduce((sum, s) => sum + s.waitlistCount, 0),
  }))
}

export function WaitlistManager() {
  const [selectedClass, setSelectedClass] = useState<string>('all')

  const filterClass = selectedClass === 'all' ? undefined : selectedClass
  const { data: waitlistResponse, isLoading: isLoadingWaitlist } = useWaitlist(filterClass)
  const { data: capacityResponse, isLoading: isLoadingCapacity } = useClassCapacity()
  const waitlistEntries = waitlistResponse?.data
  const classCapacities = capacityResponse?.data

  const sortedWaitlist = useMemo(() => {
    if (!waitlistEntries) return []
    return [...waitlistEntries].sort((a, b) => a.position - b.position)
  }, [waitlistEntries])

  const groupedCapacities = useMemo(() => {
    if (!classCapacities) return []
    const grouped = groupCapacityByClass(classCapacities)
    if (selectedClass === 'all') return grouped
    return grouped.filter((g) => g.className === selectedClass)
  }, [classCapacities, selectedClass])

  return (
    <div className="space-y-8">
      {/* Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Waitlist Management</h2>
          <p className="text-muted-foreground">
            Manage class capacities and student waitlists
          </p>
        </div>
        <div className="w-[200px]">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by class" />
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
        </div>
      </div>

      {/* Class Capacity Section */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Class Capacity</h3>
        {isLoadingCapacity ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CapacityCardSkeleton key={i} />
            ))}
          </div>
        ) : groupedCapacities.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm">No capacity data available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groupedCapacities.map((group) => {
              const fillPercentage =
                group.totalSeats > 0
                  ? Math.round((group.totalFilled / group.totalSeats) * 100)
                  : 0

              return (
                <Card key={group.className}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{group.className}</CardTitle>
                    <CardDescription>
                      {group.sections.length} section{group.sections.length !== 1 ? 's' : ''}
                      {' - '}
                      {group.sections.map((s) => s.section).join(', ')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Capacity</span>
                          <span className="font-medium">
                            {group.totalFilled}/{group.totalSeats}
                          </span>
                        </div>
                        <Progress value={fillPercentage} />
                        <p className="text-xs text-muted-foreground mt-1">
                          {fillPercentage}% filled
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Available</span>
                        </div>
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            getCapacityColor(group.totalFilled, group.totalSeats)
                          )}
                        >
                          {group.totalAvailable} seats
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Waitlist</span>
                        </div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            group.totalWaitlist > 0 && 'bg-yellow-100 text-yellow-800'
                          )}
                        >
                          {group.totalWaitlist}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Waitlist Section */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Waitlist</h3>
        {isLoadingWaitlist ? (
          <Card>
            <CardContent className="pt-6">
              <WaitlistTableSkeleton />
            </CardContent>
          </Card>
        ) : sortedWaitlist.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-sm">
                {selectedClass === 'all'
                  ? 'No students on the waitlist'
                  : `No students on the waitlist for ${selectedClass}`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Position</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Previous Marks</TableHead>
                    <TableHead className="text-right">Exam Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedWaitlist.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium text-center">
                        #{entry.position}
                      </TableCell>
                      <TableCell className="font-medium">{entry.studentName}</TableCell>
                      <TableCell>{entry.applyingForClass}</TableCell>
                      <TableCell className="text-right">{entry.previousMarks}%</TableCell>
                      <TableCell className="text-right">
                        {entry.entranceExamScore !== undefined
                          ? `${entry.entranceExamScore}%`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'capitalize',
                            getStatusBadgeVariant(entry.status)
                          )}
                        >
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(entry.addedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
