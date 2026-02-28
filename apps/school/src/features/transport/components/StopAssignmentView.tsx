import { useState } from 'react'
import { Users, MapPin, Search, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useRoutes, useAssignments, useRemoveAssignment } from '../hooks/useTransport'

export function StopAssignmentView() {
  const [selectedRoute, setSelectedRoute] = useState<string>('')
  const [selectedStop, setSelectedStop] = useState<string>('')
  const [search, setSearch] = useState('')
  const { toast } = useToast()

  const { data: routesResult } = useRoutes()
  const routes = routesResult?.data || []

  const { data: assignmentsResult, isLoading } = useAssignments({
    routeId: selectedRoute || undefined,
    stopId: selectedStop || undefined,
    search: search || undefined,
  })
  const removeMutation = useRemoveAssignment()

  const assignments = assignmentsResult?.data || []
  const currentRoute = routes.find((r) => r.id === selectedRoute)
  const stops = currentRoute?.stops || []

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  // Stats
  const totalStudents = assignments.length
  const totalMonthlyFee = assignments.reduce((sum, a) => sum + a.monthlyFee, 0)
  const uniqueStops = new Set(assignments.map((a) => a.stopId)).size

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedRoute} onValueChange={(v) => { setSelectedRoute(v); setSelectedStop('') }}>
          <SelectTrigger className="sm:w-[250px]">
            <SelectValue placeholder="Select route" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Routes</SelectItem>
            {routes.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {stops.length > 0 && (
          <Select value={selectedStop} onValueChange={setSelectedStop}>
            <SelectTrigger className="sm:w-[220px]">
              <SelectValue placeholder="All stops" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stops</SelectItem>
              {stops.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name} ({s.studentCount})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 sm:w-[250px]"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-200" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStudents}</p>
              <p className="text-xs text-muted-foreground">Students Assigned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
              <MapPin className="h-5 w-5 text-green-600 dark:text-green-200" />
            </div>
            <div>
              <p className="text-2xl font-bold">{uniqueStops}</p>
              <p className="text-xs text-muted-foreground">Active Stops</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
              <span className="text-purple-600 dark:text-purple-200 font-bold text-sm">INR</span>
            </div>
            <div>
              <p className="text-2xl font-bold">{formatCurrency(totalMonthlyFee)}</p>
              <p className="text-xs text-muted-foreground">Monthly Revenue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Student-Stop Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {selectedRoute ? 'No students assigned to this route' : 'Select a route to view assignments'}
            </div>
          ) : (
            <div className="overflow-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Stop</TableHead>
                    <TableHead>Parent Phone</TableHead>
                    <TableHead className="text-right">Monthly Fee</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">{assignment.studentName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{assignment.class} {assignment.section}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{assignment.stopName}</TableCell>
                      <TableCell className="font-mono text-xs">{assignment.parentPhone}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(assignment.monthlyFee)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMutation.mutate(assignment.id, {
                            onSuccess: () => toast({ title: 'Assignment removed' }),
                          })}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
