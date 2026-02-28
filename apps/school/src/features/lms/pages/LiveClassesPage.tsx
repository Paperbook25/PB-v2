import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Search } from 'lucide-react'
import { useLiveClasses, useCreateLiveClass, useCourses } from '../hooks/useLms'
import { LiveClassCard } from '../components/LiveClassCard'
import { LiveClassScheduler } from '../components/LiveClassScheduler'
import { useToast } from '@/hooks/use-toast'
import type { LiveClassStatus } from '../types/lms.types'

export function LiveClassesPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'upcoming' | 'past' | 'all'>('upcoming')
  const [schedulerOpen, setSchedulerOpen] = useState(false)

  const statusFilter: LiveClassStatus | undefined =
    tab === 'upcoming' ? 'scheduled' : tab === 'past' ? 'completed' : undefined

  const { data, isLoading } = useLiveClasses({
    search: search || undefined,
    status: statusFilter,
    page: 1,
    limit: 50,
  })

  const createLiveClass = useCreateLiveClass()

  const liveClasses = data?.data ?? []
  const meta = data?.meta

  const handleCreateClass = async (formData: Parameters<typeof createLiveClass.mutateAsync>[0]) => {
    try {
      await createLiveClass.mutateAsync(formData)
      toast({
        title: 'Class Scheduled',
        description: 'Live class has been scheduled successfully.',
      })
      setSchedulerOpen(false)
    } catch {
      toast({
        title: 'Scheduling Failed',
        description: 'Failed to schedule live class. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live Classes"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'LMS', href: '/lms' },
          { label: 'Live Classes' },
        ]}
        actions={
          <Button size="sm" onClick={() => setSchedulerOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Class
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search live classes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        {['upcoming', 'past', 'all'].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-56 w-full rounded-lg" />
                ))}
              </div>
            ) : liveClasses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No live classes found
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {liveClasses.map((liveClass) => (
                    <LiveClassCard key={liveClass.id} liveClass={liveClass} />
                  ))}
                </div>

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <Button variant="outline" size="sm" disabled={meta.page <= 1}>
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {meta.page} of {meta.totalPages}
                    </span>
                    <Button variant="outline" size="sm" disabled={meta.page >= meta.totalPages}>
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Schedule Dialog */}
      <LiveClassScheduler
        open={schedulerOpen}
        onOpenChange={setSchedulerOpen}
        onSubmit={handleCreateClass}
        isLoading={createLiveClass.isPending}
      />
    </div>
  )
}
