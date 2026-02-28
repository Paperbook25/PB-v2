import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { FileUp, AlertCircle, CheckCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useImportQuestions } from '../../hooks/useQuestionBank'
import {
  COURSE_CATEGORIES,
  COURSE_CATEGORY_LABELS,
  type CourseCategory,
} from '../../types/lms.types'

interface QuestionImportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SAMPLE_JSON = `[
  {
    "question": "What is 2 + 2?",
    "type": "mcq",
    "options": ["3", "4", "5", "6"],
    "correctAnswer": "4",
    "points": 1,
    "topic": "arithmetic",
    "difficulty": "easy",
    "explanation": "Basic addition"
  },
  {
    "question": "The Earth is flat.",
    "type": "true_false",
    "options": ["True", "False"],
    "correctAnswer": "False",
    "points": 1,
    "topic": "general_knowledge",
    "difficulty": "easy"
  }
]`

export function QuestionImport({ open, onOpenChange }: QuestionImportProps) {
  const { toast } = useToast()
  const importMutation = useImportQuestions()

  const [subject, setSubject] = useState<CourseCategory>('mathematics')
  const [jsonInput, setJsonInput] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    imported: number
    failed: number
    errors: { index: number; error: string }[]
  } | null>(null)

  const handleImport = async () => {
    setParseError(null)
    setResult(null)

    // Parse JSON
    let questions
    try {
      questions = JSON.parse(jsonInput)
      if (!Array.isArray(questions)) {
        throw new Error('Input must be a JSON array')
      }
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Invalid JSON format')
      return
    }

    // Validate basic structure
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.question || !q.type || !q.correctAnswer) {
        setParseError(
          `Question at index ${i} is missing required fields (question, type, correctAnswer)`
        )
        return
      }
    }

    try {
      const response = await importMutation.mutateAsync({
        questions,
        subject,
      })
      setResult(response.data)

      if (response.data.imported > 0) {
        toast({
          title: `Imported ${response.data.imported} questions`,
          description:
            response.data.failed > 0
              ? `${response.data.failed} questions failed to import`
              : undefined,
        })
      }

      if (response.data.failed === 0) {
        setTimeout(() => {
          onOpenChange(false)
          setJsonInput('')
          setResult(null)
        }, 1500)
      }
    } catch {
      toast({ title: 'Failed to import questions', variant: 'destructive' })
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setJsonInput('')
    setParseError(null)
    setResult(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Questions</DialogTitle>
          <DialogDescription>
            Import questions from JSON format. Questions will be validated before import.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Subject Selection */}
          <div className="space-y-2">
            <Label>Default Subject</Label>
            <Select value={subject} onValueChange={(v) => setSubject(v as CourseCategory)}>
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
            <p className="text-xs text-muted-foreground">
              Used when questions don't specify a subject
            </p>
          </div>

          {/* JSON Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Questions JSON</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setJsonInput(SAMPLE_JSON)}
              >
                Load Sample
              </Button>
            </div>
            <Textarea
              placeholder="Paste your JSON array of questions here..."
              rows={12}
              className="font-mono text-sm"
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value)
                setParseError(null)
              }}
            />
          </div>

          {/* Format Guide */}
          <Alert>
            <FileUp className="h-4 w-4" />
            <AlertTitle>Required Fields</AlertTitle>
            <AlertDescription className="text-xs">
              <span className="font-mono">question</span>,{' '}
              <span className="font-mono">type</span> (mcq/true_false/short_answer),{' '}
              <span className="font-mono">correctAnswer</span>,{' '}
              <span className="font-mono">points</span>,{' '}
              <span className="font-mono">topic</span>,{' '}
              <span className="font-mono">difficulty</span> (easy/medium/hard)
              <br />
              For MCQ: <span className="font-mono">options</span> array is required
            </AlertDescription>
          </Alert>

          {/* Parse Error */}
          {parseError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Parse Error</AlertTitle>
              <AlertDescription>{parseError}</AlertDescription>
            </Alert>
          )}

          {/* Import Result */}
          {result && (
            <Alert variant={result.failed === 0 ? 'default' : 'destructive'}>
              {result.failed === 0 ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>Import Complete</AlertTitle>
              <AlertDescription>
                <div className="flex gap-2 mt-1">
                  <Badge style={{ backgroundColor: 'var(--color-status-success-light)', color: 'var(--color-status-success)' }}>
                    Imported: {result.imported}
                  </Badge>
                  {result.failed > 0 && (
                    <Badge style={{ backgroundColor: 'var(--color-status-error-light)', color: 'var(--color-status-error)' }}>
                      Failed: {result.failed}
                    </Badge>
                  )}
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-2 text-xs">
                    {result.errors.slice(0, 3).map((e) => (
                      <p key={e.index}>
                        Row {e.index + 1}: {e.error}
                      </p>
                    ))}
                    {result.errors.length > 3 && (
                      <p>...and {result.errors.length - 3} more errors</p>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!jsonInput.trim() || importMutation.isPending}
          >
            {importMutation.isPending ? 'Importing...' : 'Import Questions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
