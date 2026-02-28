import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare, Calendar, Bell, CheckCircle } from 'lucide-react'
import { useParentPortalStats } from '../hooks/useParentPortal'

interface ParentPortalStatsCardsProps {
  parentId?: string
}

export function ParentPortalStatsCards({ parentId }: ParentPortalStatsCardsProps) {
  const { data: result, isLoading } = useParentPortalStats(parentId)
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
      title: 'Messages',
      value: stats?.unreadMessages ?? 0,
      description: `${stats?.totalMessages ?? 0} total messages`,
      icon: MessageSquare,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      highlight: (stats?.unreadMessages ?? 0) > 0,
    },
    {
      title: 'Scheduled Meetings',
      value: stats?.scheduledMeetings ?? 0,
      description: 'Upcoming meetings',
      icon: Calendar,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Completed Meetings',
      value: stats?.completedMeetings ?? 0,
      description: 'This academic year',
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Pending Actions',
      value: stats?.pendingAcknowledgements ?? 0,
      description: 'Acknowledgements needed',
      icon: Bell,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      highlight: (stats?.pendingAcknowledgements ?? 0) > 0,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className={card.highlight ? 'border-primary' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={`rounded-full p-2 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
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
