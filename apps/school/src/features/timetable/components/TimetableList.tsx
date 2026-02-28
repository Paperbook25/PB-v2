import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Search,
  Send,
  Plus,
} from 'lucide-react'
import { useTimetables, usePublishTimetable, useDeleteTimetable } from '../hooks/useTimetable'
import type { Timetable, TimetableFilters, TimetableStatus } from '../types/timetable.types'
import { useToast } from '@/hooks/use-toast'
import { statusColors } from '@/lib/design-tokens'

interface TimetableListProps {
  onView: (timetable: Timetable) => void
  onEdit: (timetable: Timetable) => void
  onCreate: () => void
}

export function TimetableList({ onView, onEdit, onCreate }: TimetableListProps) {
  const { toast } = useToast()
  const [filters, setFilters] = useState<TimetableFilters>({
    search: '',
    status: undefined,
    page: 1,
    limit: 10,
  })

  const { data: result, isLoading } = useTimetables(filters)
  const publishMutation = usePublishTimetable()
  const deleteMutation = useDeleteTimetable()

  const timetables = result?.data ?? []
  const meta = result?.meta

  const handlePublish = async (id: string) => {
    try {
      await publishMutation.mutateAsync(id)
      toast({
        title: 'Timetable Published',
        description: 'The timetable is now visible to students and teachers.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to publish timetable.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this timetable?')) return
    try {
      await deleteMutation.mutateAsync(id)
      toast({
        title: 'Timetable Deleted',
        description: 'The timetable has been removed.',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete timetable.',
        variant: 'destructive',
      })
    }
  }

  const getStatusBadge = (status: TimetableStatus) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">Published</Badge>
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'archived':
        return <Badge variant="outline">Archived</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Class Timetables</CardTitle>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Timetable
        </Button>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search timetables..."
              className="pl-9"
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            />
          </div>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) =>
              setFilters({
                ...filters,
                status: value === 'all' ? undefined : (value as TimetableStatus),
                page: 1,
              })
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Academic Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Entries</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timetables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No timetables found
                </TableCell>
              </TableRow>
            ) : (
              timetables.map((tt) => (
                <TableRow key={tt.id}>
                  <TableCell className="font-medium">{tt.name}</TableCell>
                  <TableCell>
                    {tt.className} - {tt.sectionName}
                  </TableCell>
                  <TableCell>{tt.academicYear}</TableCell>
                  <TableCell>{getStatusBadge(tt.status)}</TableCell>
                  <TableCell>{tt.entries.length} periods</TableCell>
                  <TableCell>{new Date(tt.updatedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(tt)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(tt)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {tt.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handlePublish(tt.id)}>
                            <Send className="h-4 w-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDelete(tt.id)}
                          style={{ color: statusColors.error }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(meta.page - 1) * meta.limit + 1} to{' '}
              {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} timetables
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page === 1}
                onClick={() => setFilters({ ...filters, page: meta.page - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={meta.page === meta.totalPages}
                onClick={() => setFilters({ ...filters, page: meta.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
