import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Trash2 } from 'lucide-react'
import type {
  Quiz,
  CreateQuizRequest,
  QuizQuestion,
  QuizQuestionType,
} from '../types/lms.types'

// ==================== TYPES ====================

interface QuizBuilderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultValues?: Partial<Quiz>
  onSubmit: (data: CreateQuizRequest) => void
  isLoading?: boolean
  courses: { id: string; title: string }[]
}

interface QuestionDraft {
  id: string
  type: QuizQuestionType
  question: string
  options: string[]
  correctAnswer: string
  points: number
  explanation: string
}

const QUESTION_TYPE_LABELS: Record<QuizQuestionType, string> = {
  mcq: 'Multiple Choice',
  true_false: 'True / False',
  short_answer: 'Short Answer',
}

// ==================== HELPERS ====================

function createEmptyQuestion(): QuestionDraft {
  return {
    id: crypto.randomUUID(),
    type: 'mcq',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 1,
    explanation: '',
  }
}

function mapExistingQuestions(questions: QuizQuestion[]): QuestionDraft[] {
  return questions.map((q) => ({
    id: q.id,
    type: q.type,
    question: q.question,
    options: q.type === 'mcq' ? [...q.options] : q.type === 'true_false' ? ['True', 'False'] : [],
    correctAnswer: q.correctAnswer,
    points: q.points,
    explanation: q.explanation ?? '',
  }))
}

// ==================== COMPONENT ====================

export function QuizBuilder({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  isLoading,
  courses,
}: QuizBuilderProps) {
  // Quiz details state
  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [courseId, setCourseId] = useState(defaultValues?.courseId ?? '')
  const [lessonId, setLessonId] = useState(defaultValues?.lessonId ?? '')
  const [description, setDescription] = useState(
    defaultValues?.description ?? ''
  )
  const [duration, setDuration] = useState(defaultValues?.duration ?? 0)
  const [passingScore, setPassingScore] = useState(
    defaultValues?.passingScore ?? 50
  )
  const [maxAttempts, setMaxAttempts] = useState(
    defaultValues?.maxAttempts ?? 1
  )

  // Questions state
  const [questions, setQuestions] = useState<QuestionDraft[]>(
    defaultValues?.questions?.length
      ? mapExistingQuestions(defaultValues.questions)
      : [createEmptyQuestion()]
  )

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ---- Question management ----

  const addQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion()])
  }

  const removeQuestion = (id: string) => {
    if (questions.length <= 1) return
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const updateQuestion = (
    id: string,
    field: keyof QuestionDraft,
    value: QuestionDraft[keyof QuestionDraft]
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q

        const updated = { ...q, [field]: value }

        // When type changes, reset options and correctAnswer
        if (field === 'type') {
          const newType = value as QuizQuestionType
          if (newType === 'true_false') {
            updated.options = ['True', 'False']
            updated.correctAnswer = ''
          } else if (newType === 'mcq') {
            updated.options = ['', '', '', '']
            updated.correctAnswer = ''
          } else {
            updated.options = []
            updated.correctAnswer = ''
          }
        }

        return updated
      })
    )
  }

  const updateOption = (questionId: string, index: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== questionId) return q
        const newOptions = [...q.options]
        newOptions[index] = value
        return { ...q, options: newOptions }
      })
    )
  }

  // ---- Computed ----

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0)

  // ---- Validation ----

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = 'Title is required'
    if (!courseId) newErrors.courseId = 'Course is required'
    if (passingScore < 0 || passingScore > 100)
      newErrors.passingScore = 'Passing score must be between 0 and 100'
    if (maxAttempts < 1) newErrors.maxAttempts = 'Max attempts must be at least 1'

    questions.forEach((q, i) => {
      if (!q.question.trim())
        newErrors[`q_${i}_question`] = 'Question text is required'
      if (!q.correctAnswer.trim())
        newErrors[`q_${i}_correctAnswer`] = 'Correct answer is required'
      if (q.points < 1) newErrors[`q_${i}_points`] = 'Points must be at least 1'
      if (q.type === 'mcq') {
        const filledOptions = q.options.filter((o) => o.trim())
        if (filledOptions.length < 2)
          newErrors[`q_${i}_options`] = 'At least 2 options are required'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ---- Submit ----

  const handleFormSubmit = () => {
    if (!validate()) return

    onSubmit({
      title: title.trim(),
      courseId,
      lessonId: lessonId.trim(),
      description: description.trim(),
      duration,
      passingScore,
      maxAttempts,
      questions: questions.map((q) => ({
        type: q.type,
        question: q.question.trim(),
        options:
          q.type === 'short_answer'
            ? []
            : q.options.map((o) => o.trim()).filter(Boolean),
        correctAnswer: q.correctAnswer.trim(),
        points: q.points,
        ...(q.explanation.trim()
          ? { explanation: q.explanation.trim() }
          : {}),
      })),
    })
  }

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setErrors({})
    }
    onOpenChange(value)
  }

  const isEditing = !!defaultValues?.id

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Quiz' : 'Create Quiz'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-6 py-2">
            {/* ==================== Quiz Details ==================== */}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="quiz-title">Title</Label>
              <Input
                id="quiz-title"
                placeholder="Enter quiz title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Course & Lesson row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course</Label>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.courseId && (
                  <p className="text-sm text-destructive">{errors.courseId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiz-lessonId">Lesson ID</Label>
                <Input
                  id="quiz-lessonId"
                  placeholder="Enter lesson ID"
                  value={lessonId}
                  onChange={(e) => setLessonId(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="quiz-description">Description</Label>
              <Textarea
                id="quiz-description"
                placeholder="Enter quiz description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Duration, Passing Score, Max Attempts row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiz-duration">Duration (min)</Label>
                <Input
                  id="quiz-duration"
                  type="number"
                  min={0}
                  placeholder="0 = no limit"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  0 means no time limit
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiz-passingScore">Passing Score (%)</Label>
                <Input
                  id="quiz-passingScore"
                  type="number"
                  min={0}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                />
                {errors.passingScore && (
                  <p className="text-sm text-destructive">
                    {errors.passingScore}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quiz-maxAttempts">Max Attempts</Label>
                <Input
                  id="quiz-maxAttempts"
                  type="number"
                  min={1}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(Number(e.target.value))}
                />
                {errors.maxAttempts && (
                  <p className="text-sm text-destructive">
                    {errors.maxAttempts}
                  </p>
                )}
              </div>
            </div>

            {/* ==================== Questions Section ==================== */}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-semibold">Questions</Label>
                  <Badge variant="secondary">
                    {questions.length} question{questions.length !== 1 && 's'}
                  </Badge>
                  <Badge variant="outline">
                    Total: {totalPoints} point{totalPoints !== 1 && 's'}
                  </Badge>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addQuestion}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Question
                </Button>
              </div>

              {questions.map((q, index) => (
                <Card key={q.id}>
                  <CardContent className="pt-4 space-y-4">
                    {/* Question header */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">
                        Question {index + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(q.id)}
                        disabled={questions.length <= 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Type & Points row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={q.type}
                          onValueChange={(value) =>
                            updateQuestion(
                              q.id,
                              'type',
                              value as QuizQuestionType
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              Object.entries(QUESTION_TYPE_LABELS) as [
                                QuizQuestionType,
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

                      <div className="space-y-2">
                        <Label>Points</Label>
                        <Input
                          type="number"
                          min={1}
                          value={q.points}
                          onChange={(e) =>
                            updateQuestion(
                              q.id,
                              'points',
                              Number(e.target.value)
                            )
                          }
                        />
                        {errors[`q_${index}_points`] && (
                          <p className="text-sm text-destructive">
                            {errors[`q_${index}_points`]}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Question text */}
                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Textarea
                        placeholder="Enter your question"
                        rows={2}
                        value={q.question}
                        onChange={(e) =>
                          updateQuestion(q.id, 'question', e.target.value)
                        }
                      />
                      {errors[`q_${index}_question`] && (
                        <p className="text-sm text-destructive">
                          {errors[`q_${index}_question`]}
                        </p>
                      )}
                    </div>

                    {/* MCQ Options */}
                    {q.type === 'mcq' && (
                      <div className="space-y-2">
                        <Label>Options</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((option, optIndex) => (
                            <Input
                              key={optIndex}
                              placeholder={`Option ${optIndex + 1}`}
                              value={option}
                              onChange={(e) =>
                                updateOption(q.id, optIndex, e.target.value)
                              }
                            />
                          ))}
                        </div>
                        {errors[`q_${index}_options`] && (
                          <p className="text-sm text-destructive">
                            {errors[`q_${index}_options`]}
                          </p>
                        )}
                      </div>
                    )}

                    {/* True/False note */}
                    {q.type === 'true_false' && (
                      <p className="text-sm text-muted-foreground">
                        Options are automatically set to "True" and "False".
                      </p>
                    )}

                    {/* Correct Answer */}
                    <div className="space-y-2">
                      <Label>Correct Answer</Label>
                      {q.type === 'true_false' ? (
                        <Select
                          value={q.correctAnswer}
                          onValueChange={(value) =>
                            updateQuestion(q.id, 'correctAnswer', value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select correct answer" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="True">True</SelectItem>
                            <SelectItem value="False">False</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder={
                            q.type === 'mcq'
                              ? 'Enter the correct option text'
                              : 'Enter the correct answer'
                          }
                          value={q.correctAnswer}
                          onChange={(e) =>
                            updateQuestion(
                              q.id,
                              'correctAnswer',
                              e.target.value
                            )
                          }
                        />
                      )}
                      {errors[`q_${index}_correctAnswer`] && (
                        <p className="text-sm text-destructive">
                          {errors[`q_${index}_correctAnswer`]}
                        </p>
                      )}
                    </div>

                    {/* Explanation (optional) */}
                    <div className="space-y-2">
                      <Label>
                        Explanation{' '}
                        <span className="text-muted-foreground font-normal">
                          (optional)
                        </span>
                      </Label>
                      <Input
                        placeholder="Explain the correct answer"
                        value={q.explanation}
                        onChange={(e) =>
                          updateQuestion(q.id, 'explanation', e.target.value)
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleFormSubmit} disabled={isLoading}>
            {isLoading
              ? 'Saving...'
              : isEditing
                ? 'Update Quiz'
                : 'Create Quiz'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
