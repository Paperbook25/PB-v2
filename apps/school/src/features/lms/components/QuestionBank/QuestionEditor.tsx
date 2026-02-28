import { useState, useEffect } from 'react'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCreateQuestion, useUpdateQuestion } from '../../hooks/useQuestionBank'
import type {
  BankQuestion,
  CreateQuestionRequest,
  QuestionDifficulty,
} from '../../types/question-bank.types'
import {
  COURSE_CATEGORIES,
  COURSE_CATEGORY_LABELS,
  type CourseCategory,
  type QuizQuestionType,
} from '../../types/lms.types'
import {
  QUESTION_DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  SUBJECT_TOPICS,
} from '../../types/question-bank.types'

interface QuestionEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  question?: BankQuestion
}

export function QuestionEditor({ open, onOpenChange, question }: QuestionEditorProps) {
  const { toast } = useToast()
  const createMutation = useCreateQuestion()
  const updateMutation = useUpdateQuestion()

  const isEditing = !!question

  // Form state
  const [questionText, setQuestionText] = useState('')
  const [type, setType] = useState<QuizQuestionType>('mcq')
  const [options, setOptions] = useState<string[]>(['', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [points, setPoints] = useState(1)
  const [explanation, setExplanation] = useState('')
  const [subject, setSubject] = useState<CourseCategory>('mathematics')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('medium')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [negativeMarks, setNegativeMarks] = useState<number | undefined>()

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when dialog opens/closes or question changes
  useEffect(() => {
    if (open) {
      if (question) {
        setQuestionText(question.question)
        setType(question.type)
        setOptions(
          question.type === 'mcq'
            ? [...question.options]
            : question.type === 'true_false'
            ? ['True', 'False']
            : ['', '', '', '']
        )
        setCorrectAnswer(question.correctAnswer)
        setPoints(question.points)
        setExplanation(question.explanation || '')
        setSubject(question.subject)
        setTopic(question.topic)
        setDifficulty(question.difficulty)
        setTags(question.tags || [])
        setNegativeMarks(question.negativeMarks)
      } else {
        // Reset to defaults for new question
        setQuestionText('')
        setType('mcq')
        setOptions(['', '', '', ''])
        setCorrectAnswer('')
        setPoints(1)
        setExplanation('')
        setSubject('mathematics')
        setTopic('')
        setDifficulty('medium')
        setTags([])
        setNegativeMarks(undefined)
      }
      setErrors({})
      setTagInput('')
    }
  }, [open, question])

  // Get available topics for selected subject
  const availableTopics = SUBJECT_TOPICS[subject] || []

  // Handle type change
  const handleTypeChange = (newType: QuizQuestionType) => {
    setType(newType)
    setCorrectAnswer('')
    if (newType === 'true_false') {
      setOptions(['True', 'False'])
    } else if (newType === 'mcq') {
      setOptions(['', '', '', ''])
    } else {
      setOptions([])
    }
  }

  // Handle option change
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  // Handle tag management
  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase()
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!questionText.trim()) {
      newErrors.questionText = 'Question text is required'
    }

    if (!correctAnswer.trim()) {
      newErrors.correctAnswer = 'Correct answer is required'
    }

    if (points < 1) {
      newErrors.points = 'Points must be at least 1'
    }

    if (!topic) {
      newErrors.topic = 'Topic is required'
    }

    if (type === 'mcq') {
      const filledOptions = options.filter((o) => o.trim())
      if (filledOptions.length < 2) {
        newErrors.options = 'At least 2 options are required'
      }
      if (correctAnswer && !options.includes(correctAnswer)) {
        newErrors.correctAnswer = 'Correct answer must match one of the options'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit
  const handleSubmit = async () => {
    if (!validate()) return

    const data: CreateQuestionRequest = {
      question: questionText.trim(),
      type,
      options: type === 'short_answer' ? [] : options.filter((o) => o.trim()),
      correctAnswer: correctAnswer.trim(),
      points,
      explanation: explanation.trim() || undefined,
      subject,
      topic,
      difficulty,
      tags,
      negativeMarks,
    }

    try {
      if (isEditing && question) {
        await updateMutation.mutateAsync({ id: question.id, data })
        toast({ title: 'Question updated successfully' })
      } else {
        await createMutation.mutateAsync(data)
        toast({ title: 'Question created successfully' })
      }
      onOpenChange(false)
    } catch {
      toast({
        title: isEditing ? 'Failed to update question' : 'Failed to create question',
        variant: 'destructive',
      })
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Question' : 'Add Question'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4 -mr-4">
          <div className="space-y-4 py-2">
            {/* Question Text */}
            <div className="space-y-2">
              <Label htmlFor="question-text">Question Text</Label>
              <Textarea
                id="question-text"
                placeholder="Enter your question..."
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
              {errors.questionText && (
                <p className="text-sm text-destructive">{errors.questionText}</p>
              )}
            </div>

            {/* Type, Subject, Difficulty row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={handleTypeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(QUESTION_TYPE_LABELS) as QuizQuestionType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {QUESTION_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Select
                  value={subject}
                  onValueChange={(v) => {
                    setSubject(v as CourseCategory)
                    setTopic('')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {COURSE_CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select
                  value={difficulty}
                  onValueChange={(v) => setDifficulty(v as QuestionDifficulty)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(QUESTION_DIFFICULTY_LABELS) as QuestionDifficulty[]).map(
                      (d) => (
                        <SelectItem key={d} value={d}>
                          {QUESTION_DIFFICULTY_LABELS[d]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Topic and Points row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Topic</Label>
                <Select value={topic} onValueChange={setTopic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTopics.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.topic && (
                  <p className="text-sm text-destructive">{errors.topic}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  min={1}
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                />
                {errors.points && (
                  <p className="text-sm text-destructive">{errors.points}</p>
                )}
              </div>
            </div>

            {/* MCQ Options */}
            {type === 'mcq' && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="grid grid-cols-2 gap-2">
                  {options.map((option, index) => (
                    <Input
                      key={index}
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                    />
                  ))}
                </div>
                {errors.options && (
                  <p className="text-sm text-destructive">{errors.options}</p>
                )}
              </div>
            )}

            {/* True/False note */}
            {type === 'true_false' && (
              <p className="text-sm text-muted-foreground">
                Options are automatically set to "True" and "False".
              </p>
            )}

            {/* Correct Answer */}
            <div className="space-y-2">
              <Label>Correct Answer</Label>
              {type === 'true_false' ? (
                <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="True">True</SelectItem>
                    <SelectItem value="False">False</SelectItem>
                  </SelectContent>
                </Select>
              ) : type === 'mcq' ? (
                <Select value={correctAnswer} onValueChange={setCorrectAnswer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select correct option" />
                  </SelectTrigger>
                  <SelectContent>
                    {options
                      .filter((o) => o.trim())
                      .map((option, index) => (
                        <SelectItem key={index} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Enter the correct answer"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                />
              )}
              {errors.correctAnswer && (
                <p className="text-sm text-destructive">{errors.correctAnswer}</p>
              )}
            </div>

            {/* Explanation */}
            <div className="space-y-2">
              <Label htmlFor="explanation">
                Explanation <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="explanation"
                placeholder="Explain why this is the correct answer..."
                rows={2}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
              />
            </div>

            {/* Negative Marks */}
            <div className="space-y-2">
              <Label htmlFor="negative-marks">
                Negative Marks <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="negative-marks"
                type="number"
                min={0}
                step={0.25}
                placeholder="0"
                value={negativeMarks ?? ''}
                onChange={(e) =>
                  setNegativeMarks(e.target.value ? Number(e.target.value) : undefined)
                }
              />
              <p className="text-xs text-muted-foreground">
                Points deducted for wrong answer (if enabled on exam)
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Question' : 'Create Question'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
