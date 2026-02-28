import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useDeleteQuestion, useCreateQuestion } from '../../hooks/useQuestionBank'
import { difficultyColors, statusColors } from '@/lib/design-tokens'
import type { BankQuestion } from '../../types/question-bank.types'
import { COURSE_CATEGORY_LABELS, type CourseCategory } from '../../types/lms.types'
import {
  QUESTION_DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
} from '../../types/question-bank.types'

interface QuestionListProps {
  questions: BankQuestion[]
  isLoading: boolean
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  onPageChange: (page: number) => void
  onEdit: (question: BankQuestion) => void
}

export function QuestionList({
  questions,
  isLoading,
  meta,
  onPageChange,
  onEdit,
}: QuestionListProps) {
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [previewQuestion, setPreviewQuestion] = useState<BankQuestion | null>(null)

  const deleteMutation = useDeleteQuestion()
  const duplicateMutation = useCreateQuestion()

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteMutation.mutateAsync(deleteId)
      toast({ title: 'Question deleted successfully' })
    } catch {
      toast({ title: 'Failed to delete question', variant: 'destructive' })
    } finally {
      setDeleteId(null)
    }
  }

  const handleDuplicate = async (question: BankQuestion) => {
    try {
      await duplicateMutation.mutateAsync({
        question: question.question + ' (Copy)',
        type: question.type,
        options: question.options,
        correctAnswer: question.correctAnswer,
        points: question.points,
        explanation: question.explanation,
        subject: question.subject,
        topic: question.topic,
        difficulty: question.difficulty,
        tags: question.tags,
        negativeMarks: question.negativeMarks,
      })
      toast({ title: 'Question duplicated successfully' })
    } catch {
      toast({ title: 'Failed to duplicate question', variant: 'destructive' })
    }
  }

  const getDifficultyStyle = (difficulty: string): { bg: string; text: string } => {
    switch (difficulty) {
      case 'easy':
        return difficultyColors.easy
      case 'medium':
        return difficultyColors.medium
      case 'hard':
        return difficultyColors.hard
      default:
        return { bg: '', text: '' }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">No questions found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your filters or add a new question
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Question</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium line-clamp-2">{question.question}</p>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {question.topic.replace(/_/g, ' ')}
                        </Badge>
                        {question.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {COURSE_CATEGORY_LABELS[question.subject as CourseCategory]}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {QUESTION_TYPE_LABELS[question.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      style={{
                        backgroundColor: getDifficultyStyle(question.difficulty).bg,
                        color: getDifficultyStyle(question.difficulty).text,
                      }}
                    >
                      {QUESTION_DIFFICULTY_LABELS[question.difficulty]}
                    </Badge>
                  </TableCell>
                  <TableCell>{question.points}</TableCell>
                  <TableCell>{question.usageCount}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setPreviewQuestion(question)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(question)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(question)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteId(question.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {(meta.page - 1) * meta.limit + 1} to{' '}
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} questions
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(meta.page - 1)}
                  disabled={meta.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(meta.page + 1)}
                  disabled={meta.page >= meta.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Preview Dialog */}
      <AlertDialog open={!!previewQuestion} onOpenChange={() => setPreviewQuestion(null)}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Question Preview</AlertDialogTitle>
          </AlertDialogHeader>
          {previewQuestion && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Question</p>
                <p className="text-lg">{previewQuestion.question}</p>
              </div>

              {previewQuestion.type !== 'short_answer' && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Options</p>
                  <div className="space-y-2">
                    {previewQuestion.options.map((option, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded border ${
                          option === previewQuestion.correctAnswer
                            ? ''
                            : ''
                        }`}
                      >
                        {option}
                        {option === previewQuestion.correctAnswer && (
                          <Badge className="ml-2" style={{ backgroundColor: 'var(--color-status-success-light)', color: 'var(--color-status-success)' }}>
                            Correct
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewQuestion.type === 'short_answer' && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Correct Answer
                  </p>
                  <p className="p-2 rounded" style={{ backgroundColor: statusColors.successLight }}>
                    {previewQuestion.correctAnswer}
                  </p>
                </div>
              )}

              {previewQuestion.explanation && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Explanation
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {previewQuestion.explanation}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Badge variant="outline">
                  {COURSE_CATEGORY_LABELS[previewQuestion.subject as CourseCategory]}
                </Badge>
                <Badge variant="outline">{previewQuestion.topic.replace(/_/g, ' ')}</Badge>
                <Badge
                  style={{
                    backgroundColor: getDifficultyStyle(previewQuestion.difficulty).bg,
                    color: getDifficultyStyle(previewQuestion.difficulty).text,
                  }}
                >
                  {QUESTION_DIFFICULTY_LABELS[previewQuestion.difficulty]}
                </Badge>
                <Badge variant="secondary">{previewQuestion.points} pts</Badge>
              </div>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (previewQuestion) onEdit(previewQuestion)
              setPreviewQuestion(null)
            }}>
              Edit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
