import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Folder, HardDrive, Upload } from 'lucide-react'
import { useDocumentStats } from '../hooks/useDocuments'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function DocumentStatsCards() {
  const { data: result, isLoading } = useDocumentStats()
  const stats = result?.data

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
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
      title: 'Total Files',
      value: stats?.totalFiles || 0,
      description: `${stats?.recentUploads || 0} uploaded this week`,
      icon: FileText,
      color: 'text-blue-600',
    },
    {
      title: 'Total Folders',
      value: stats?.totalFolders || 0,
      description: 'Organized structure',
      icon: Folder,
      color: 'text-amber-600',
    },
    {
      title: 'Storage Used',
      value: formatBytes(stats?.totalSize || 0),
      description: `${stats?.totalDocuments || 0} total items`,
      icon: HardDrive,
      color: 'text-green-600',
    },
    {
      title: 'Shared Documents',
      value: stats?.sharedDocuments || 0,
      description: 'Accessible to others',
      icon: Upload,
      color: 'text-purple-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
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
