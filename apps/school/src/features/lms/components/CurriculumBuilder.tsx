import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Video,
  FileText,
  HelpCircle,
  ClipboardList,
  Radio,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Clock,
  GripVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  useCourseModules,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useModuleLessons,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
} from '../hooks/useLms'
import type {
  CourseModule,
  Lesson,
  LessonType,
  VideoProvider,
} from '../types/lms.types'
import { LESSON_TYPE_LABELS } from '../types/lms.types'

// ==================== PROPS ====================

interface CurriculumBuilderProps {
  courseId: string
  editable?: boolean
}

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

// ==================== MODULE FORM STATE ====================

interface ModuleFormData {
  title: string
  description: string
}

const EMPTY_MODULE_FORM: ModuleFormData = {
  title: '',
  description: '',
}

// ==================== LESSON FORM STATE ====================

interface LessonFormData {
  title: string
  type: LessonType
  duration: number
  contentUrl: string
  videoProvider: VideoProvider
  isFree: boolean
}

const EMPTY_LESSON_FORM: LessonFormData = {
  title: '',
  type: 'video',
  duration: 0,
  contentUrl: '',
  videoProvider: 'youtube',
  isFree: false,
}

// ==================== MODULE LESSONS (INNER) ====================

interface ModuleLessonsSectionProps {
  moduleId: string
  courseId: string
  editable: boolean
  onEditLesson: (lesson: Lesson) => void
  onDeleteLesson: (lessonId: string) => void
  onAddLesson: () => void
}

function ModuleLessonsSection({
  moduleId,
  courseId: _courseId,
  editable,
  onEditLesson,
  onDeleteLesson,
  onAddLesson,
}: ModuleLessonsSectionProps) {
  const { data: result, isLoading } = useModuleLessons(moduleId)
  const lessons = result?.data ?? []

  if (isLoading) {
    return (
      <div className="py-3 px-4 text-sm text-muted-foreground">
        Loading lessons...
      </div>
    )
  }

  return (
    <div className="border-t">
      {lessons.length === 0 && (
        <div className="py-4 px-4 text-sm text-muted-foreground text-center">
          No lessons in this module yet.
        </div>
      )}

      {lessons
        .sort((a, b) => a.order - b.order)
        .map((lesson) => {
          const Icon = LESSON_TYPE_ICONS[lesson.type]
          return (
            <div
              key={lesson.id}
              className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
            >
              {editable && (
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
              )}
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{lesson.title}</p>
                <p className="text-xs text-muted-foreground">
                  {LESSON_TYPE_LABELS[lesson.type]}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {lesson.isFree && (
                  <Badge variant="secondary" className="text-xs">
                    Free
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDuration(lesson.duration)}
                </div>
                {editable && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onEditLesson(lesson)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => onDeleteLesson(lesson.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )
        })}

      {editable && (
        <div className="px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={onAddLesson}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lesson
          </Button>
        </div>
      )}
    </div>
  )
}

// ==================== MAIN COMPONENT ====================

export function CurriculumBuilder({
  courseId,
  editable = false,
}: CurriculumBuilderProps) {
  // Data fetching
  const { data: modulesResult, isLoading: modulesLoading } =
    useCourseModules(courseId)
  const modules = modulesResult?.data ?? []

  // Mutations
  const createModuleMut = useCreateModule()
  const updateModuleMut = useUpdateModule()
  const deleteModuleMut = useDeleteModule()
  const createLessonMut = useCreateLesson()
  const updateLessonMut = useUpdateLesson()
  const deleteLessonMut = useDeleteLesson()

  // UI state
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  )
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false)
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null)
  const [moduleForm, setModuleForm] = useState<ModuleFormData>(EMPTY_MODULE_FORM)

  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [lessonTargetModuleId, setLessonTargetModuleId] = useState<string>('')
  const [lessonForm, setLessonForm] = useState<LessonFormData>(EMPTY_LESSON_FORM)

  // ==================== ACCORDION TOGGLE ====================

  function toggleModule(moduleId: string) {
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

  // ==================== MODULE DIALOG HANDLERS ====================

  function openAddModule() {
    setEditingModule(null)
    setModuleForm(EMPTY_MODULE_FORM)
    setModuleDialogOpen(true)
  }

  function openEditModule(mod: CourseModule) {
    setEditingModule(mod)
    setModuleForm({ title: mod.title, description: mod.description })
    setModuleDialogOpen(true)
  }

  function handleSaveModule() {
    if (!moduleForm.title.trim()) return

    if (editingModule) {
      updateModuleMut.mutate(
        {
          id: editingModule.id,
          data: { title: moduleForm.title, description: moduleForm.description },
        },
        { onSuccess: () => setModuleDialogOpen(false) }
      )
    } else {
      createModuleMut.mutate(
        {
          courseId,
          title: moduleForm.title,
          description: moduleForm.description,
          order: modules.length + 1,
        },
        { onSuccess: () => setModuleDialogOpen(false) }
      )
    }
  }

  function handleDeleteModule(moduleId: string) {
    deleteModuleMut.mutate(moduleId)
  }

  // ==================== LESSON DIALOG HANDLERS ====================

  function openAddLesson(moduleId: string) {
    setEditingLesson(null)
    setLessonTargetModuleId(moduleId)
    setLessonForm(EMPTY_LESSON_FORM)
    setLessonDialogOpen(true)
  }

  function openEditLesson(lesson: Lesson) {
    setEditingLesson(lesson)
    setLessonTargetModuleId(lesson.moduleId)
    setLessonForm({
      title: lesson.title,
      type: lesson.type,
      duration: lesson.duration,
      contentUrl: lesson.contentUrl,
      videoProvider: lesson.videoProvider ?? 'youtube',
      isFree: lesson.isFree,
    })
    setLessonDialogOpen(true)
  }

  function handleSaveLesson() {
    if (!lessonForm.title.trim()) return

    if (editingLesson) {
      updateLessonMut.mutate(
        {
          id: editingLesson.id,
          data: {
            title: lessonForm.title,
            type: lessonForm.type,
            duration: lessonForm.duration,
            contentUrl: lessonForm.contentUrl,
            videoProvider:
              lessonForm.type === 'video' ? lessonForm.videoProvider : undefined,
            isFree: lessonForm.isFree,
          },
        },
        { onSuccess: () => setLessonDialogOpen(false) }
      )
    } else {
      createLessonMut.mutate(
        {
          moduleId: lessonTargetModuleId,
          courseId,
          title: lessonForm.title,
          type: lessonForm.type,
          order: 0, // server will assign
          duration: lessonForm.duration,
          contentUrl: lessonForm.contentUrl,
          videoProvider:
            lessonForm.type === 'video' ? lessonForm.videoProvider : undefined,
          isFree: lessonForm.isFree,
        },
        { onSuccess: () => setLessonDialogOpen(false) }
      )
    }
  }

  function handleDeleteLesson(lessonId: string) {
    deleteLessonMut.mutate(lessonId)
  }

  // ==================== RENDER ====================

  if (modulesLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-16 animate-pulse bg-muted" />
        ))}
      </div>
    )
  }

  const sortedModules = [...modules].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      {editable && (
        <div className="flex justify-end">
          <Button onClick={openAddModule} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>
      )}

      {/* Empty state */}
      {sortedModules.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            No modules yet.{' '}
            {editable && 'Click "Add Module" to build your curriculum.'}
          </p>
        </Card>
      )}

      {/* Module accordion list */}
      {sortedModules.map((mod) => {
        const isExpanded = expandedModules.has(mod.id)
        return (
          <Card key={mod.id} className="overflow-hidden">
            {/* Module header */}
            <button
              type="button"
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors',
                isExpanded && 'border-b'
              )}
              onClick={() => toggleModule(mod.id)}
            >
              {editable && (
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
              )}
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold truncate">{mod.title}</h3>
                {mod.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {mod.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDuration(mod.duration)}
                </span>
                {editable && (
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => openEditModule(mod)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteModule(mod.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </button>

            {/* Expanded lessons */}
            {isExpanded && (
              <ModuleLessonsSection
                moduleId={mod.id}
                courseId={courseId}
                editable={editable}
                onEditLesson={openEditLesson}
                onDeleteLesson={handleDeleteLesson}
                onAddLesson={() => openAddLesson(mod.id)}
              />
            )}
          </Card>
        )
      })}

      {/* ==================== MODULE DIALOG ==================== */}
      <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModule ? 'Edit Module' : 'Add Module'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="module-title">Title</Label>
              <Input
                id="module-title"
                value={moduleForm.title}
                onChange={(e) =>
                  setModuleForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Introduction to Algebra"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-desc">Description</Label>
              <Textarea
                id="module-desc"
                value={moduleForm.description}
                onChange={(e) =>
                  setModuleForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of this module..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModuleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveModule}
              disabled={
                !moduleForm.title.trim() ||
                createModuleMut.isPending ||
                updateModuleMut.isPending
              }
            >
              {createModuleMut.isPending || updateModuleMut.isPending
                ? 'Saving...'
                : editingModule
                  ? 'Update Module'
                  : 'Create Module'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== LESSON DIALOG ==================== */}
      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Edit Lesson' : 'Add Lesson'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Title</Label>
              <Input
                id="lesson-title"
                value={lessonForm.title}
                onChange={(e) =>
                  setLessonForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Understanding Variables"
              />
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={lessonForm.type}
                onValueChange={(val) =>
                  setLessonForm((prev) => ({
                    ...prev,
                    type: val as LessonType,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(LESSON_TYPE_LABELS) as [
                      LessonType,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="lesson-duration">Duration (minutes)</Label>
              <Input
                id="lesson-duration"
                type="number"
                min={0}
                step={1}
                value={lessonForm.duration}
                onChange={(e) =>
                  setLessonForm((prev) => ({
                    ...prev,
                    duration: Number(e.target.value),
                  }))
                }
              />
            </div>

            {/* Content URL */}
            <div className="space-y-2">
              <Label htmlFor="lesson-url">Content URL</Label>
              <Input
                id="lesson-url"
                value={lessonForm.contentUrl}
                onChange={(e) =>
                  setLessonForm((prev) => ({
                    ...prev,
                    contentUrl: e.target.value,
                  }))
                }
                placeholder="https://..."
              />
            </div>

            {/* Video Provider (only for video type) */}
            {lessonForm.type === 'video' && (
              <div className="space-y-2">
                <Label>Video Provider</Label>
                <Select
                  value={lessonForm.videoProvider}
                  onValueChange={(val) =>
                    setLessonForm((prev) => ({
                      ...prev,
                      videoProvider: val as VideoProvider,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="upload">Upload</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* isFree toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="lesson-free" className="cursor-pointer">
                Free Preview
              </Label>
              <Switch
                id="lesson-free"
                checked={lessonForm.isFree}
                onCheckedChange={(checked) =>
                  setLessonForm((prev) => ({ ...prev, isFree: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLessonDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveLesson}
              disabled={
                !lessonForm.title.trim() ||
                createLessonMut.isPending ||
                updateLessonMut.isPending
              }
            >
              {createLessonMut.isPending || updateLessonMut.isPending
                ? 'Saving...'
                : editingLesson
                  ? 'Update Lesson'
                  : 'Create Lesson'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
