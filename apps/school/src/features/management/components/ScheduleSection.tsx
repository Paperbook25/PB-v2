import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import {
  TimetableStatsCards,
  TimetableList,
  TimetableGrid,
  TimetableForm,
  AddEntryDialog,
  SubstitutionList,
  SubstitutionForm,
  TeacherTimetableView,
  RoomTimetableView,
} from '@/features/timetable/components'
import { useTimetable, usePeriodDefinitions, useDeleteTimetableEntry } from '@/features/timetable/hooks/useTimetable'
import type { Timetable, DayOfWeek } from '@/features/timetable/types/timetable.types'
import type { ScheduleTab } from '../types/management.types'
import { useToast } from '@/hooks/use-toast'

type ViewMode = 'list' | 'view' | 'edit'

interface ScheduleSectionProps {
  activeTab: ScheduleTab
  onTabChange: (tab: ScheduleTab) => void
}

export function ScheduleSection({ activeTab, onTabChange }: ScheduleSectionProps) {
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedTimetable, setSelectedTimetable] = useState<Timetable | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null)
  const [substitutionFormOpen, setSubstitutionFormOpen] = useState(false)

  // Entry dialog state
  const [entryDialogOpen, setEntryDialogOpen] = useState(false)
  const [entryDay, setEntryDay] = useState<DayOfWeek>('monday')
  const [entryPeriodId, setEntryPeriodId] = useState('')

  const { data: timetableResult, refetch } = useTimetable(selectedTimetable?.id || '')
  const { data: periodsResult } = usePeriodDefinitions()
  const deleteEntryMutation = useDeleteTimetableEntry()

  const currentTimetable = timetableResult?.data || selectedTimetable
  const periods = periodsResult?.data ?? []

  const handleView = (timetable: Timetable) => {
    setSelectedTimetable(timetable)
    setViewMode('view')
  }

  const handleEdit = (timetable: Timetable) => {
    setSelectedTimetable(timetable)
    setViewMode('edit')
  }

  const handleBack = () => {
    setViewMode('list')
    setSelectedTimetable(null)
  }

  const handleCreate = () => {
    setEditingTimetable(null)
    setFormOpen(true)
  }

  const handleAddEntry = (day: DayOfWeek, periodId: string) => {
    setEntryDay(day)
    setEntryPeriodId(periodId)
    setEntryDialogOpen(true)
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Remove this entry?')) return
    try {
      await deleteEntryMutation.mutateAsync(entryId)
      toast({ title: 'Entry Removed', description: 'The period entry has been deleted.' })
      refetch()
    } catch {
      toast({ title: 'Error', description: 'Failed to remove entry.', variant: 'destructive' })
    }
  }

  const periodName = periods.find((p) => p.id === entryPeriodId)?.name || ''

  return (
    <>
      <div className="mt-6 space-y-6">
        {viewMode === 'list' ? (
          <>
            <TimetableStatsCards />

            {activeTab === 'timetables' && (
              <TimetableList onView={handleView} onEdit={handleEdit} onCreate={handleCreate} />
            )}

            {activeTab === 'teachers' && <TeacherTimetableView />}

            {activeTab === 'rooms' && <RoomTimetableView />}

            {activeTab === 'substitutions' && (
              <SubstitutionList onCreate={() => setSubstitutionFormOpen(true)} />
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to List
              </Button>
              <div>
                <h2 className="text-xl font-semibold">{currentTimetable?.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {currentTimetable?.className} - {currentTimetable?.sectionName} •{' '}
                  {currentTimetable?.academicYear}
                </p>
              </div>
            </div>

            <TimetableGrid
              entries={currentTimetable?.entries ?? []}
              isEditable={viewMode === 'edit'}
              onAddEntry={handleAddEntry}
              onDeleteEntry={handleDeleteEntry}
            />
          </>
        )}
      </div>

      {/* Create/Edit Timetable Dialog */}
      <TimetableForm
        open={formOpen}
        onOpenChange={setFormOpen}
        timetable={editingTimetable}
        onSuccess={() => {
          setFormOpen(false)
          setEditingTimetable(null)
        }}
      />

      {/* Add Entry Dialog */}
      {selectedTimetable && (
        <AddEntryDialog
          open={entryDialogOpen}
          onOpenChange={setEntryDialogOpen}
          timetableId={selectedTimetable.id}
          day={entryDay}
          periodId={entryPeriodId}
          periodName={periodName}
          onSuccess={() => {
            setEntryDialogOpen(false)
            refetch()
          }}
        />
      )}

      {/* Create Substitution Dialog */}
      <SubstitutionForm
        open={substitutionFormOpen}
        onOpenChange={setSubstitutionFormOpen}
        onSuccess={() => setSubstitutionFormOpen(false)}
      />
    </>
  )
}
