import { Clock, ArrowRight, User } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import type { StatusChange } from '../types/admission.types'
import { getStatusConfig } from '../types/admission.types'

interface ApplicationTimelineProps {
  statusHistory: StatusChange[]
}

export function ApplicationTimeline({ statusHistory }: ApplicationTimelineProps) {
  if (statusHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p>No status history available</p>
      </div>
    )
  }

  // Sort by date descending (most recent first)
  const sortedHistory = [...statusHistory].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  )

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-6">
        {sortedHistory.map((change, index) => {
          const toConfig = getStatusConfig(change.toStatus)
          const fromConfig = change.fromStatus ? getStatusConfig(change.fromStatus) : null

          return (
            <div key={change.id} className="relative pl-10">
              {/* Timeline dot */}
              <div
                className={cn(
                  'absolute left-2.5 w-3 h-3 rounded-full ring-4 ring-background',
                  toConfig.bgColor
                )}
              />

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {fromConfig ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className={cn('font-medium', fromConfig.color)}>{fromConfig.label}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className={cn('font-medium', toConfig.color)}>{toConfig.label}</span>
                    </div>
                  ) : (
                    <span className={cn('text-sm font-medium', toConfig.color)}>{toConfig.label}</span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {change.changedBy}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(change.changedAt, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {change.note && (
                  <p className="text-sm mt-2 text-muted-foreground border-t pt-2 mt-2">{change.note}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
