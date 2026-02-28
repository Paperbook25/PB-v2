import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Video,
  FileText,
  HelpCircle,
  ClipboardList,
  Radio,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCourse, useCourseModules, useModuleLessons } from '../hooks/useLms'
import { LessonViewer } from '../components/LessonViewer'
import { ProgressTracker } from '../components/ProgressTracker'
import { LESSON_TYPE_LABELS } from '../types/lms.types'
import type { Lesson, LessonType } from '../types/lms.types'
import { statusColors } from '@/lib/design-tokens'

// ==================== HELPERS ====================

const LESSON_TYPE_ICONS: Record<LessonType, React.ElementType> = {
  video: Video,
  document: FileText,
  quiz: HelpCircle,
  assignment: ClipboardList,
  live_class: Radio,
}

function formatDuration(minutes: number): string {
  const m = Math.floor(minutes)
  const s = Math.round((minutes - m) * 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ==================== MODULE LESSONS LIST (INNER) ====================

interface ModuleLessonsListProps {
  moduleId: string
  selectedLesson: Lesson | null
  completedLessons: Set<string>
  onSelectLesson: (lesson: Lesson) => void
}

function ModuleLessonsList({
  moduleId,
  selectedLesson,
  completedLessons,
  onSelectLesson,
}: ModuleLessonsListProps) {
  const { data: result, isLoading } = useModuleLessons(moduleId)
  const lessons = result?.data ?? []

  if (isLoading) {
    return (
      <div className="py-2 px-3 space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (lessons.length === 0) {
    return (
      <div className="py-3 px-3 text-xs text-muted-foreground text-center">
        No lessons in this module.
      </div>
    )
  }

  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order)

  return (
    <div className="py-1">
      {sortedLessons.map((lesson) => {
        const Icon = LESSON_TYPE_ICONS[lesson.type]
        const isSelected = selectedLesson?.id === lesson.id
        const isCompleted = completedLessons.has(lesson.id)

        return (
          <button
            key={lesson.id}
            type="button"
            className={cn(
              'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50',
              isSelected && 'bg-accent'
            )}
            onClick={() => onSelectLesson(lesson)}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 shrink-0">
              <Icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{lesson.title}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{LESSON_TYPE_LABELS[lesson.type]}</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {formatDuration(lesson.duration)}
                </span>
              </div>
            </div>
            {isCompleted && (
              <CheckCircle className="h-4 w-4 shrink-0" style={{ color: statusColors.success }} />
            )}
          </button>
        )
      })}
    </div>
  )
}

// ==================== MAIN COMPONENT ====================

export function StudentCoursePage() {
  const { id } = useParams<{ id: string }>()

  // Data fetching
  const { data: courseResult, isLoading: courseLoading } = useCourse(id!)
  const course = courseResult?.data

  const { data: modulesResult, isLoading: modulesLoading } = useCourseModules(id!)
  const modules = modulesResult?.data ?? []

  // State
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())

  // Loading state
  if (courseLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="flex gap-0">
          <Skeleton className="h-[600px] w-80" />
          <Skeleton className="h-[600px] flex-1 ml-4" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-lg text-muted-foreground mb-4">Course not found</p>
      </div>
    )
  }

  // Handlers
  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) {
        next.delete(moduleId)
      } else {
        next.add(moduleId)
      }
      return next
    })
  }

  const markComplete = () => {
    if (!selectedLesson) return
    setCompletedLessons((prev) => {
      const next = new Set(prev)
      next.add(selectedLesson.id)
      return next
    })
  }

  // Count total lessons from modules for progress calculation
  // We estimate based on modules; actual count comes from fetched lessons per module
  // For a simple progress bar, use completedLessons.size vs a rough estimate
  const sortedModules = [...modules].sort((a, b) => a.order - b.order)

  // Estimate total lessons as a simple count; since we can't aggregate across
  // multiple useModuleLessons calls here, we track a rough estimate from module data
  // and use completedLessons for the numerator.
  // For the progress display, show completed count out of an estimated total.
  const estimatedTotalLessons = Math.max(completedLessons.size, sortedModules.length * 3)
  const progressPercent = estimatedTotalLessons > 0
    ? Math.min(100, Math.round((completedLessons.size / estimatedTotalLessons) * 100))
    : 0

  return (
    <div>
      <PageHeader
        title={course.title}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'LMS', href: '/lms' },
          { label: 'My Courses', href: '/lms/my-courses' },
          { label: course.title },
        ]}
      />

      <div className="flex h-[calc(100vh-12rem)] border rounded-lg overflow-hidden">
        {/* Left Panel - Course Sidebar */}
        <div className="w-80 border-r flex flex-col shrink-0 bg-background">
          {/* Course title and progress */}
          <div className="p-4 border-b space-y-3">
            <h2 className="font-semibold text-sm truncate">{course.title}</h2>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{completedLessons.size} lessons completed</span>
                <span>{progressPercent}%</span>
              </div>
              <ProgressTracker progress={progressPercent} size="sm" />
            </div>
          </div>

          {/* Module accordion */}
          <ScrollArea className="flex-1">
            {modulesLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : sortedModules.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No modules available yet.
              </div>
            ) : (
              <div>
                {sortedModules.map((mod) => {
                  const isExpanded = expandedModules.has(mod.id)
                  return (
                    <div key={mod.id} className="border-b last:border-b-0">
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                        onClick={() => toggleModule(mod.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{mod.title}</p>
                          {mod.description && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {mod.description}
                            </p>
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <ModuleLessonsList
                          moduleId={mod.id}
                          selectedLesson={selectedLesson}
                          completedLessons={completedLessons}
                          onSelectLesson={setSelectedLesson}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Right Panel - Lesson Content */}
        <div className="flex-1 overflow-auto">
          {selectedLesson ? (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedLesson.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">
                      {LESSON_TYPE_LABELS[selectedLesson.type]}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDuration(selectedLesson.duration)}
                    </span>
                    {completedLessons.has(selectedLesson.id) && (
                      <Badge variant="success">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <LessonViewer
                lesson={selectedLesson}
                onComplete={markComplete}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Select a lesson to begin</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Expand a module from the sidebar and click on a lesson to start learning.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
