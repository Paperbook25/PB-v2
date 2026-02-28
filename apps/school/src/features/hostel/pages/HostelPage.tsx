import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, BedDouble, Users, IndianRupee, UserCheck, UserX } from 'lucide-react'
import { useHostelStats, useHostels, useHostelFees, useAllocations } from '../hooks/useHostel'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { HOSTEL_TYPE_LABELS, HOSTEL_FEE_STATUS_LABELS } from '../types/hostel.types'

export function HostelPage() {
  const { data: statsResult } = useHostelStats()
  const { data: hostelsResult } = useHostels()
  const { data: feesResult } = useHostelFees({ status: 'pending' })
  const { data: allocationsResult } = useAllocations({ status: 'active' })

  const stats = statsResult?.data
  const hostels = hostelsResult?.data || []
  const pendingFees = feesResult?.data?.slice(0, 5) || []
  const recentAllocations = allocationsResult?.data?.slice(0, 5) || []

  const statCards = [
    {
      title: 'Total Hostels',
      value: stats?.totalHostels || 0,
      icon: Building2,
      description: `${stats?.totalRooms || 0} rooms`,
    },
    {
      title: 'Total Beds',
      value: stats?.totalBeds || 0,
      icon: BedDouble,
      description: `${stats?.availableBeds || 0} available`,
    },
    {
      title: 'Residents',
      value: stats?.totalStudents || 0,
      icon: Users,
      description: `${stats?.occupiedBeds || 0} beds occupied`,
    },
    {
      title: 'Pending Fees',
      value: formatCurrency(stats?.pendingFeesAmount || 0),
      icon: IndianRupee,
      description: `${stats?.pendingFees || 0} pending`,
    },
    {
      title: 'Present Today',
      value: stats?.todayPresent || 0,
      icon: UserCheck,
      description: 'Night roll call',
    },
    {
      title: 'Absent Today',
      value: stats?.todayAbsent || 0,
      icon: UserX,
      description: 'Night roll call',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Hostel Management"
        description="Manage hostels, rooms, allocations, and resident services"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Hostel' }]}
      />

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Hostels Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Hostels</CardTitle>
              <CardDescription>All hostels and their occupancy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hostels.map((hostel) => (
                  <div
                    key={hostel.id}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{hostel.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {HOSTEL_TYPE_LABELS[hostel.type]} • {hostel.floors} floors
                      </p>
                      <p className="text-sm text-muted-foreground">Warden: {hostel.wardenName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {hostel.occupancy}/{hostel.capacity}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {Math.round((hostel.occupancy / hostel.capacity) * 100)}% occupied
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Fees */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Fees</CardTitle>
              <CardDescription>Students with pending hostel fees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingFees.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending fees</p>
                ) : (
                  pendingFees.map((fee) => (
                    <div
                      key={fee.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{fee.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          Room {fee.roomNumber} • {fee.month}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(fee.amount)}</p>
                        <Badge variant={fee.status === 'overdue' ? 'destructive' : 'secondary'}>
                          {HOSTEL_FEE_STATUS_LABELS[fee.status]}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Allocations */}
        <Card>
          <CardHeader>
            <CardTitle>Current Residents</CardTitle>
            <CardDescription>Recently allocated students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="pb-2 text-left font-medium">Student</th>
                    <th className="pb-2 text-left font-medium">Class</th>
                    <th className="pb-2 text-left font-medium">Hostel</th>
                    <th className="pb-2 text-left font-medium">Room</th>
                    <th className="pb-2 text-left font-medium">Bed</th>
                    <th className="pb-2 text-left font-medium">Since</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAllocations.map((allocation) => (
                    <tr key={allocation.id} className="border-b last:border-0">
                      <td className="py-3">{allocation.studentName}</td>
                      <td className="py-3">
                        {allocation.class}-{allocation.section}
                      </td>
                      <td className="py-3">{allocation.hostelName}</td>
                      <td className="py-3">{allocation.roomNumber}</td>
                      <td className="py-3">Bed {allocation.bedNumber}</td>
                      <td className="py-3">{allocation.startDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
