import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, Users, Clock, AlertTriangle, Building, FileCheck } from 'lucide-react'
import { useTimetableStats } from '../hooks/useTimetable'
import { statusColors, moduleColors } from '@/lib/design-tokens'

export function TimetableStatsCards() {
  const { data: result, isLoading } = useTimetableStats()
  const stats = result?.data

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-1 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Classes',
      value: stats?.totalClasses ?? 0,
      description: 'Class sections with timetables',
      icon: Calendar,
      iconColor: statusColors.info,
      bgColor: statusColors.infoLight,
    },
    {
      title: 'Published',
      value: stats?.publishedTimetables ?? 0,
      description: `${stats?.draftTimetables ?? 0} drafts pending`,
      icon: FileCheck,
      iconColor: statusColors.success,
      bgColor: statusColors.successLight,
    },
    {
      title: 'Avg Periods/Teacher',
      value: stats?.avgPeriodsPerTeacher ?? 0,
      description: `${stats?.totalTeachers ?? 0} teachers total`,
      icon: Users,
      iconColor: moduleColors.integrations,
      bgColor: moduleColors.integrationsLight,
    },
    {
      title: 'Pending Substitutions',
      value: stats?.pendingSubstitutions ?? 0,
      description: 'Awaiting approval',
      icon: AlertTriangle,
      iconColor: moduleColors.behavior,
      bgColor: moduleColors.behaviorLight,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className="rounded-full p-2" style={{ backgroundColor: card.bgColor }}>
              <card.icon className="h-4 w-4" style={{ color: card.iconColor }} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
