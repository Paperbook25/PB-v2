import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Quiz, QuizAttempt } from '../types/lms.types'
import { statusColors } from '@/lib/design-tokens'

// ==================== PROPS ====================

interface QuizTakerProps {
  quiz: Quiz
  onSubmit: (answers: { questionId: string; answer: string }[]) => void
  isLoading?: boolean
  existingAttempt?: QuizAttempt | null
}

// ==================== HELPERS ====================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// ==================== RESULTS VIEW ====================

function ResultsView({
  quiz,
  attempt,
}: {
  quiz: Quiz
  attempt: QuizAttempt
}) {
  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Quiz Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Score</span>
            <span className="text-xl font-bold">
              {attempt.score} / {attempt.totalPoints}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Percentage</span>
            <span className="text-xl font-bold">{attempt.percentage}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge
              variant={attempt.passed ? 'default' : 'destructive'}
              className="text-sm"
            >
              {attempt.passed ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Passed
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" />
                  Failed
                </span>
              )}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Passing Score</span>
            <span>{quiz.passingScore}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Per-question breakdown */}
      <div className="space-y-3">
        <h3 className="font-semibold">Question Breakdown</h3>
        {quiz.questions.map((question, index) => {
          const attemptAnswer = attempt.answers.find(
            (a) => a.questionId === question.id
          )
          const isCorrect = attemptAnswer?.correct ?? false

          return (
            <Card
              key={question.id}
              className={cn(
                'border-l-4',
                isCorrect ? 'border-l-green-500' : 'border-l-red-500'
              )}
            >
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">
                    <span className="text-muted-foreground mr-1">
                      Q{index + 1}.
                    </span>
                    {question.question}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {question.points} pt{question.points !== 1 && 's'}
                    </Badge>
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5" style={{ color: statusColors.success }} />
                    ) : (
                      <XCircle className="h-5 w-5" style={{ color: statusColors.error }} />
                    )}
                  </div>
                </div>

                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Your answer: </span>
                    <span
                      className={cn(
                        'font-medium',
                        ''
                      )}
                    >
                      {attemptAnswer?.answer || '(no answer)'}
                    </span>
                  </p>
                  {!isCorrect && (
                    <p>
                      <span className="text-muted-foreground">
                        Correct answer:{' '}
                      </span>
                      <span className="font-medium" style={{ color: statusColors.success }}>
                        {question.correctAnswer}
                      </span>
                    </p>
                  )}
                  {question.explanation && (
                    <p className="text-muted-foreground italic pt-1">
                      {question.explanation}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ==================== QUIZ TAKING VIEW ====================

function QuizView({
  quiz,
  onSubmit,
  isLoading,
}: {
  quiz: Quiz
  onSubmit: (answers: { questionId: string; answer: string }[]) => void
  isLoading?: boolean
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(
    quiz.duration > 0 ? quiz.duration * 60 : 0
  )
  const [showConfirm, setShowConfirm] = useState(false)

  const hasTimer = quiz.duration > 0
  const totalQuestions = quiz.questions.length
  const question = quiz.questions[currentQuestion]
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k]?.trim()
  ).length

  // Timer countdown
  const handleTimerEnd = useCallback(() => {
    const formattedAnswers = quiz.questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] ?? '',
    }))
    onSubmit(formattedAnswers)
  }, [answers, onSubmit, quiz.questions])

  useEffect(() => {
    if (!hasTimer) return

    if (timeLeft <= 0) {
      handleTimerEnd()
      return
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [hasTimer, timeLeft, handleTimerEnd])

  const setAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = () => {
    const formattedAnswers = quiz.questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] ?? '',
    }))
    onSubmit(formattedAnswers)
  }

  const goToPrevious = () => {
    setCurrentQuestion((prev) => Math.max(0, prev - 1))
    setShowConfirm(false)
  }

  const goToNext = () => {
    setCurrentQuestion((prev) => Math.min(totalQuestions - 1, prev + 1))
    setShowConfirm(false)
  }

  const isTimeLow = hasTimer && timeLeft <= 60

  return (
    <div className="space-y-4">
      {/* Top bar: timer + progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            Question {currentQuestion + 1} of {totalQuestions}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            {answeredCount} / {totalQuestions} answered
          </Badge>
        </div>

        {hasTimer && (
          <Badge
            variant={isTimeLow ? 'destructive' : 'outline'}
            className={cn('text-sm font-mono', isTimeLow && 'animate-pulse')}
          >
            <Clock className="h-3.5 w-3.5 mr-1" />
            {formatTime(timeLeft)}
          </Badge>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all"
          style={{
            width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
          }}
        />
      </div>

      {/* Question card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              <span className="text-muted-foreground mr-2">
                Q{currentQuestion + 1}.
              </span>
              {question.question}
            </CardTitle>
            <Badge variant="outline" className="shrink-0 ml-2">
              {question.points} pt{question.points !== 1 && 's'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* MCQ or True/False */}
          {(question.type === 'mcq' || question.type === 'true_false') && (
            <RadioGroup
              value={answers[question.id] ?? ''}
              onValueChange={(value) => setAnswer(question.id, value)}
              className="space-y-3"
            >
              {question.options.map((option, optIndex) => (
                <div
                  key={optIndex}
                  className={cn(
                    'flex items-center space-x-3 rounded-md border p-3 transition-colors',
                    answers[question.id] === option
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <RadioGroupItem
                    value={option}
                    id={`${question.id}-opt-${optIndex}`}
                  />
                  <Label
                    htmlFor={`${question.id}-opt-${optIndex}`}
                    className="flex-1 cursor-pointer font-normal"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {/* Short Answer */}
          {question.type === 'short_answer' && (
            <Input
              placeholder="Type your answer here"
              value={answers[question.id] ?? ''}
              onChange={(e) => setAnswer(question.id, e.target.value)}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation + Submit */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {currentQuestion < totalQuestions - 1 ? (
            <Button onClick={goToNext}>Next</Button>
          ) : !showConfirm ? (
            <Button onClick={() => setShowConfirm(true)}>Submit Quiz</Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                Are you sure?
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Confirm Submit'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== MAIN COMPONENT ====================

export function QuizTaker({
  quiz,
  onSubmit,
  isLoading,
  existingAttempt,
}: QuizTakerProps) {
  if (existingAttempt) {
    return <ResultsView quiz={quiz} attempt={existingAttempt} />
  }

  return <QuizView quiz={quiz} onSubmit={onSubmit} isLoading={isLoading} />
}
