import { useQuery } from '@tanstack/react-query'
import { apiGet } from '@/lib/api-client'
import {
  BookOpen,
  BookMarked,
  AlertTriangle,
  Users,
  ArrowRight,
  RotateCcw,
  Calendar,
  Bell,
  Bookmark,
  CheckCircle2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const COLORS = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b']

export function LibrarianDashboard() {
  const { user } = useAuthStore()

  // Fetch librarian-specific stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'librarian-stats'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/librarian-stats')
      return json.data
    },
  })

  // Fetch circulation data
  const { data: circulation } = useQuery({
    queryKey: ['dashboard', 'circulation-stats'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/circulation-stats')
      return json.data
    },
  })

  // Fetch overdue books
  const { data: overdueBooks } = useQuery({
    queryKey: ['dashboard', 'overdue-books'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/overdue-books')
      return json.data
    },
  })

  // Fetch pending reservations
  const { data: reservations } = useQuery({
    queryKey: ['dashboard', 'pending-reservations'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/pending-reservations')
      return json.data
    },
  })

  // Fetch recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ['dashboard', 'library-activity'],
    queryFn: async () => {
      const json = await apiGet<{ data: any }>('/api/dashboard/library-activity')
      return json.data
    },
  })

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Librarian'}!`}
        description={`${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} - Library Overview`}
      />

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Books</p>
                    <p className="text-2xl font-bold">{stats?.totalBooks || 0}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.totalTitles || 0} titles
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-800">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link to="/library?tab=issued">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Currently Issued</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats?.issuedBooks || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats?.activeMembers || 0} members
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-800">
                      <BookMarked className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/library/notifications">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Overdue</p>
                      <p className="text-2xl font-bold text-red-600">
                        {stats?.overdueBooks || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stats?.overdueMembers || 0} members
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-100 dark:bg-red-800">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/library/reservations">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Reservations</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {stats?.pendingReservations || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        pending pickup
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-800">
                      <Bookmark className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
      </div>

      {/* Charts & Actions Row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Weekly Circulation Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Weekly Circulation</CardTitle>
            <CardDescription>Books issued and returned this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={circulation || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="issued" fill="var(--color-chart-1)" name="Issued" radius={[4, 4, 0, 0]} />
                <Bar dataKey="returned" fill="var(--color-chart-2)" name="Returned" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/library/scanner">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-green-500 text-white">
                    <BookMarked className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Issue Book</span>
                </Button>
              </Link>
              <Link to="/library/scanner">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-blue-500 text-white">
                    <RotateCcw className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Return Book</span>
                </Button>
              </Link>
              <Link to="/library/reservations">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-purple-500 text-white">
                    <Bookmark className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Reservations</span>
                </Button>
              </Link>
              <Link to="/library/notifications">
                <Button variant="outline" className="w-full h-auto py-4 flex flex-col gap-2">
                  <div className="p-2 rounded-lg bg-orange-500 text-white">
                    <Bell className="h-5 w-5" />
                  </div>
                  <span className="text-xs">Send Reminders</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Books & Pending Reservations */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Overdue Books */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Overdue Books
              </CardTitle>
              <CardDescription>Books past their due date</CardDescription>
            </div>
            <Link to="/library/notifications">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueBooks?.slice(0, 5).map((book: any) => (
                <div key={book.id} className="flex items-center justify-between p-3 border rounded-lg border-red-200 bg-red-50 dark:bg-red-800 dark:border-red-700">
                  <div>
                    <p className="font-medium text-sm">{book.bookTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {book.memberName} | Due: {formatDate(book.dueDate)}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-[10px]">
                    {book.daysOverdue} days overdue
                  </Badge>
                </div>
              ))}
              {(!overdueBooks || overdueBooks.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">No overdue books!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Reservations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-purple-500" />
                Pending Reservations
              </CardTitle>
              <CardDescription>Books ready for pickup</CardDescription>
            </div>
            <Link to="/library/reservations">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reservations?.slice(0, 5).map((res: any) => (
                <div key={res.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{res.bookTitle}</p>
                    <p className="text-xs text-muted-foreground">
                      {res.memberName} | Reserved: {formatDate(res.reservedAt)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {res.status === 'available' ? 'Ready' : 'Waiting'}
                  </Badge>
                </div>
              ))}
              {(!reservations || reservations.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pending reservations</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
