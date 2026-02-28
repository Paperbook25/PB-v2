import { Badge } from '@/components/ui/badge'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { Application, ApplicationStatus } from '../types/admission.types'
import { APPLICATION_STATUSES } from '../types/admission.types'
import { ApplicationCard } from './ApplicationCard'

interface PipelineColumnProps {
  status: ApplicationStatus
  applications: Application[]
  onStatusChange?: (applicationId: string, newStatus: ApplicationStatus) => void
}

function PipelineColumn({ status, applications, onStatusChange }: PipelineColumnProps) {
  const config = APPLICATION_STATUSES.find((s) => s.value === status)!
  const filtered = applications.filter((a) => a.status === status)

  return (
    <div className="flex-shrink-0 w-[300px]">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={cn('w-3 h-3 rounded-full', config.bgColor)} />
        <h3 className="font-medium text-sm">{config.label}</h3>
        <Badge variant="secondary" className="ml-auto">
          {filtered.length}
        </Badge>
      </div>
      <div className="space-y-3 bg-muted/50 rounded-lg p-3 min-h-[400px] max-h-[calc(100vh-350px)] overflow-y-auto">
        {filtered.map((app) => (
          <ApplicationCard key={app.id} application={app} onStatusChange={onStatusChange} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No applications</p>
        )}
      </div>
    </div>
  )
}

interface AdmissionPipelineProps {
  applications: Application[]
  onStatusChange?: (applicationId: string, newStatus: ApplicationStatus) => void
  visibleStatuses?: ApplicationStatus[]
}

export function AdmissionPipeline({
  applications,
  onStatusChange,
  visibleStatuses = ['applied', 'under_review', 'document_verification', 'entrance_exam', 'interview', 'approved', 'enrolled'],
}: AdmissionPipelineProps) {
  const visibleStatusConfigs = APPLICATION_STATUSES.filter((s) => visibleStatuses.includes(s.value))

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-4 pb-4">
        {visibleStatusConfigs.map((statusConfig) => (
          <PipelineColumn
            key={statusConfig.value}
            status={statusConfig.value}
            applications={applications}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
