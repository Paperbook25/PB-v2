import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Shield,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { statusColors } from '@/lib/design-tokens'
import {
  setupExamSecurity,
  formatTimeRemaining,
  shuffleArray,
  type SecurityViolation,
} from '@/lib/exam-security'
import type {
  OnlineExamConfig,
  OnlineExamAttempt,
  ExamSecuritySettings,
} from '../types/question-bank.types'

interface ExamQuestion {
  id: string
  question: string
  type: 'mcq' | 'true_false' | 'short_answer'
  options: string[]
  points: number
  correctAnswer?: string
  explanation?: string
}

interface ExamModeProps {
  exam: OnlineExamConfig & { questions: ExamQuestion[] }
  attempt: OnlineExamAttempt
  onSubmit: (data: {
    answers: { questionId: string; answer: string }[]
    timeSpent: number
    tabSwitchCount: number
    securityViolations: SecurityViolation[]
    autoSubmit?: boolean
  }) => void
  onViolation?: (violation: SecurityViolation) => void
  isSubmitting?: boolean
}

interface ExamResultsProps {
  attempt: OnlineExamAttempt
  questions: ExamQuestion[]
  onClose: () => void
}

// Results View Component
function ExamResults({ attempt, questions, onClose }: ExamResultsProps) {
  const questionsMap = new Map(questions.map((q) => [q.id, q]))

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      {/* Score Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-6">
            <div
              className={`rounded-full p-4 ${
                ''
              }`}
            >
              {attempt.passed ? (
                <CheckCircle className="h-12 w-12" style={{ color: statusColors.success }} />
              ) : (
                <XCircle className="h-12 w-12" style={{ color: statusColors.error }} />
              )}
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold">
                {attempt.score} / {attempt.totalPoints}
              </p>
              <p className="text-lg text-muted-foreground">
                {attempt.percentage.toFixed(1)}%
              </p>
              <Badge
                variant={attempt.passed ? 'default' : 'destructive'}
                className="mt-2"
              >
                {attempt.passed ? 'PASSED' : 'FAILED'}
              </Badge>
            </div>
          </div>

          {attempt.tabSwitchCount > 0 && (
            <Alert className="mt-4" variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Security Warnings</AlertTitle>
              <AlertDescription>
                Tab switches detected: {attempt.tabSwitchCount}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Question Review */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Question Review</h3>
        {questions.map((question, index) => {
          const answer = attempt.answers.find((a) => a.questionId === question.id)
          const isCorrect = answer?.correct ?? false

          return (
            <Card
              key={question.id}
              className={`border-l-4 ${
                isCorrect ? 'border-l-green-500' : 'border-l-red-500'
              }`}
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Question {index + 1}
                  </span>
                  <Badge variant={isCorrect ? 'secondary' : 'destructive'}>
                    {isCorrect ? `+${question.points} pts` : '0 pts'}
                  </Badge>
                </div>
                <p className="font-medium mb-3">{question.question}</p>

                {question.type !== 'short_answer' && (
                  <div className="space-y-2 mb-3">
                    {question.options.map((option, i) => {
                      const isSelected = answer?.answer === option
                      const isCorrectOption = question.correctAnswer === option

                      return (
                        <div
                          key={i}
                          className={`p-2 rounded border ${
                            isCorrectOption
                              ? 'bg-green-50 border-green-200'
                              : isSelected && !isCorrect
                              ? 'bg-red-50 border-red-200'
                              : ''
                          }`}
                        >
                          {option}
                          {isCorrectOption && (
                            <Badge className="ml-2" style={{ backgroundColor: 'var(--color-status-success-light)', color: 'var(--color-status-success)' }}>
                              Correct
                            </Badge>
                          )}
                          {isSelected && !isCorrectOption && (
                            <Badge className="ml-2" style={{ backgroundColor: 'var(--color-status-error-light)', color: 'var(--color-status-error)' }}>
                              Your Answer
                            </Badge>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {question.type === 'short_answer' && (
                  <div className="space-y-2 mb-3">
                    <p className="text-sm">
                      <span className="text-muted-foreground">Your answer: </span>
                      <span style={{ color: isCorrect ? statusColors.success : statusColors.error }}>
                        {answer?.answer || '(no answer)'}
                      </span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Correct answer: </span>
                      <span style={{ color: statusColors.success }}>{question.correctAnswer}</span>
                    </p>
                  </div>
                )}

                {question.explanation && (
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    <strong>Explanation:</strong> {question.explanation}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-center">
        <Button onClick={onClose} size="lg">
          Close
        </Button>
      </div>
    </div>
  )
}

// Main Exam Mode Component
export function ExamMode({
  exam,
  attempt,
  onSubmit,
  onViolation,
  isSubmitting,
}: ExamModeProps) {
  const { toast } = useToast()
  const startTimeRef = useRef(Date.now())

  // State
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeRemaining, setTimeRemaining] = useState(exam.duration * 60)
  const [violations, setViolations] = useState<SecurityViolation[]>([])
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')

  // Initialize questions with shuffling if configured
  useEffect(() => {
    let processedQuestions = [...exam.questions]

    if (exam.security.shuffleQuestions) {
      processedQuestions = shuffleArray(processedQuestions)
    }

    if (exam.security.shuffleOptions) {
      processedQuestions = processedQuestions.map((q) => ({
        ...q,
        options: q.type === 'mcq' ? shuffleArray(q.options) : q.options,
      }))
    }

    setQuestions(processedQuestions)
  }, [exam.questions, exam.security.shuffleQuestions, exam.security.shuffleOptions])

  // Handle security violation
  const handleViolation = useCallback(
    (violation: SecurityViolation) => {
      setViolations((prev) => [...prev, violation])
      onViolation?.(violation)

      if (violation.type === 'tab_switch') {
        setTabSwitchCount((prev) => {
          const newCount = prev + 1
          if (
            exam.security.maxTabSwitches &&
            newCount >= exam.security.maxTabSwitches
          ) {
            setWarningMessage('Maximum tab switches exceeded. Exam will be auto-submitted.')
            setShowWarning(true)
            // Auto-submit after a brief delay
            setTimeout(() => handleAutoSubmit(), 2000)
          } else if (exam.security.maxTabSwitches) {
            toast({
              title: 'Warning: Tab Switch Detected',
              description: `${exam.security.maxTabSwitches - newCount} switches remaining before auto-submit`,
              variant: 'destructive',
            })
          }
          return newCount
        })
      } else if (violation.type === 'copy_attempt') {
        toast({
          title: 'Copy/Paste Disabled',
          description: 'This action is not allowed during the exam',
          variant: 'destructive',
        })
      } else if (violation.type === 'right_click') {
        toast({
          title: 'Right-Click Disabled',
          description: 'Context menu is disabled during the exam',
          variant: 'destructive',
        })
      } else if (violation.type === 'fullscreen_exit') {
        toast({
          title: 'Fullscreen Required',
          description: 'Please stay in fullscreen mode during the exam',
          variant: 'destructive',
        })
      }
    },
    [exam.security.maxTabSwitches, onViolation, toast]
  )

  // Setup security measures
  useEffect(() => {
    const cleanup = setupExamSecurity({
      preventCopyPaste: exam.security.preventCopyPaste,
      preventRightClick: exam.security.preventRightClick,
      detectTabSwitch: exam.security.detectTabSwitch,
      fullScreenRequired: exam.security.fullScreenRequired,
      onViolation: handleViolation,
    })

    return cleanup
  }, [exam.security, handleViolation])

  // Timer
  useEffect(() => {
    if (exam.duration <= 0 || !exam.security.showRemainingTime) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          if (exam.security.autoSubmitOnTimeUp) {
            handleAutoSubmit()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [exam.duration, exam.security.showRemainingTime, exam.security.autoSubmitOnTimeUp])

  // Handle auto-submit
  const handleAutoSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000)
    onSubmit({
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
      timeSpent,
      tabSwitchCount,
      securityViolations: violations,
      autoSubmit: true,
    })
  }

  // Handle manual submit
  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000)
    onSubmit({
      answers: Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
      timeSpent,
      tabSwitchCount,
      securityViolations: violations,
    })
    setShowSubmitDialog(false)
  }

  // Current question
  const currentQuestion = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0
  const isLastQuestion = currentIndex === questions.length - 1
  const isTimeLow = timeRemaining > 0 && timeRemaining < 60

  if (!currentQuestion) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b">
        <div className="container max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold">{exam.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Security indicator */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span className="text-xs">Secure</span>
              </div>

              {/* Progress */}
              <div className="hidden sm:flex items-center gap-2">
                <Progress value={progress} className="w-24" />
                <span className="text-sm text-muted-foreground">
                  {answeredCount}/{questions.length}
                </span>
              </div>

              {/* Timer */}
              {exam.security.showRemainingTime && exam.duration > 0 && (
                <Badge
                  variant={isTimeLow ? 'destructive' : 'secondary'}
                  className={`${isTimeLow ? 'animate-pulse' : ''}`}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTimeRemaining(timeRemaining)}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
              <Badge variant="outline">{currentQuestion.points} pts</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* MCQ / True-False */}
            {(currentQuestion.type === 'mcq' || currentQuestion.type === 'true_false') && (
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={(value) =>
                  setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
                }
              >
                <div className="space-y-3">
                  {currentQuestion.options.map((option, i) => (
                    <div
                      key={i}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === option
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option }))
                      }
                    >
                      <RadioGroupItem value={option} id={`option-${i}`} />
                      <Label
                        htmlFor={`option-${i}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {/* Short Answer */}
            {currentQuestion.type === 'short_answer' && (
              <Input
                placeholder="Type your answer here..."
                value={answers[currentQuestion.id] || ''}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.id]: e.target.value,
                  }))
                }
                className="text-lg"
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex gap-2">
            {/* Question dots */}
            <div className="hidden md:flex gap-1">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i === currentIndex
                      ? 'bg-primary'
                      : answers[q.id]
                      ? 'bg-green-500'
                      : 'bg-muted-foreground/30'
                  }`}
                  title={`Question ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {isLastQuestion ? (
            <Button onClick={() => setShowSubmitDialog(true)} disabled={isSubmitting}>
              Submit Exam
            </Button>
          ) : (
            <Button
              onClick={() =>
                setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))
              }
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>

        {/* Unanswered warning */}
        {answeredCount < questions.length && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            {questions.length - answeredCount} question(s) unanswered
          </p>
        )}
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              {answeredCount < questions.length ? (
                <>
                  You have {questions.length - answeredCount} unanswered question(s).
                  Are you sure you want to submit?
                </>
              ) : (
                'Are you sure you want to submit your exam? This action cannot be undone.'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Exam</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Exam'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Auto-submit Warning Dialog */}
      <AlertDialog open={showWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <AlertTriangle className="h-5 w-5 text-destructive inline mr-2" />
              Warning
            </AlertDialogTitle>
            <AlertDialogDescription>{warningMessage}</AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Export results component separately
ExamMode.Results = ExamResults
