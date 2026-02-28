import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AIGeneratedSchedule } from '../types/ai-planner.types'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const
const DAY_SHORT = { monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu', friday: 'Fri', saturday: 'Sat' }

const SUBJECT_COLORS: Record<string, string> = {
  mathematics: 'bg-blue-50 text-blue-700 border-blue-200',
  english: 'bg-purple-50 text-purple-700 border-purple-200',
  science: 'bg-green-50 text-green-700 border-green-200',
  physics: 'bg-green-50 text-green-700 border-green-200',
  chemistry: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  biology: 'bg-teal-50 text-teal-700 border-teal-200',
  hindi: 'bg-orange-50 text-orange-700 border-orange-200',
  social_studies: 'bg-amber-50 text-amber-700 border-amber-200',
  history: 'bg-amber-50 text-amber-700 border-amber-200',
  geography: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  computer_science: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  physical_education: 'bg-red-50 text-red-700 border-red-200',
  art: 'bg-pink-50 text-pink-700 border-pink-200',
  music: 'bg-violet-50 text-violet-700 border-violet-200',
}

function getSubjectColor(name: string): string {
  const key = name.toLowerCase().replace(/\s+/g, '_')
  return SUBJECT_COLORS[key] || 'bg-gray-50 text-gray-700 border-gray-200'
}

interface Props {
  schedule: AIGeneratedSchedule
}

export function AIPlannerPreview({ schedule }: Props) {
  // Get unique period IDs from entries, preserving order
  const periodIds = [...new Set(schedule.entries.map(e => e.periodId))]

  // Build grid: day -> periodId -> entry
  const grid = new Map<string, Map<string, typeof schedule.entries[0]>>()
  for (const day of DAYS) {
    grid.set(day, new Map())
  }
  for (const entry of schedule.entries) {
    grid.get(entry.dayOfWeek)?.set(entry.periodId, entry)
  }

  // Get period labels from first occurrence
  const periodLabels = new Map<string, number>()
  let periodNum = 1
  for (const pid of periodIds) {
    periodLabels.set(pid, periodNum++)
  }

  return (
    <div className="space-y-3">
      {/* Compact grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr>
              <th className="p-1 text-left text-gray-500 font-medium">P</th>
              {DAYS.map(day => (
                <th key={day} className="p-1 text-center text-gray-500 font-medium">
                  {DAY_SHORT[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periodIds.map(periodId => (
              <tr key={periodId}>
                <td className="p-1 text-gray-400 font-mono">{periodLabels.get(periodId)}</td>
                {DAYS.map(day => {
                  const entry = grid.get(day)?.get(periodId)
                  if (!entry) {
                    return <td key={day} className="p-0.5"><div className="h-8 rounded bg-gray-50 border border-dashed border-gray-200" /></td>
                  }
                  return (
                    <td key={day} className="p-0.5">
                      <div
                        className={cn(
                          'h-8 rounded border px-1 flex items-center justify-center truncate',
                          getSubjectColor(entry.subjectName)
                        )}
                        title={`${entry.subjectName}\n${entry.teacherName}\n${entry.roomName}`}
                      >
                        <span className="truncate font-medium">
                          {entry.subjectName.length > 6 ? entry.subjectName.slice(0, 5) + '..' : entry.subjectName}
                        </span>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md text-xs',
        schedule.conflicts.length === 0
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      )}>
        {schedule.conflicts.length === 0 ? (
          <><CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> {schedule.summary.totalSlotsFilled}/{schedule.summary.totalSlotsAvailable} slots filled. No conflicts.</>
        ) : (
          <><AlertTriangle className="h-3.5 w-3.5 shrink-0" /> {schedule.summary.totalSlotsFilled} slots, {schedule.conflicts.length} conflict(s)</>
        )}
      </div>

      {/* Subject distribution */}
      <div className="space-y-1">
        <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Distribution</div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(schedule.summary.subjectDistribution).map(([name, dist]) => (
            <span
              key={name}
              className={cn(
                'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] border',
                dist.assigned >= dist.target ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              )}
            >
              {name}: {dist.assigned}/{dist.target}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
