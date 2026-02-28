import { useState } from 'react'
import { Plus, Trash2, FileText, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { useQuestionPapers, useCreateQuestionPaper, useDeleteQuestionPaper } from '../hooks/useExams'
import { PAPER_DIFFICULTY_LABELS, CLASSES, TERMS, ACADEMIC_YEARS, DEFAULT_SUBJECTS, type PaperDifficulty, type PaperSection } from '../types/exams.types'

const DIFFICULTY_COLORS: Record<PaperDifficulty, string> = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
}

export function QuestionPaperManager() {
  const { toast } = useToast()
  const [examIdFilter, setExamIdFilter] = useState('')
  const { data: result, isLoading } = useQuestionPapers({ examId: examIdFilter || undefined })
  const createMutation = useCreateQuestionPaper()
  const deleteMutation = useDeleteQuestionPaper()

  const papers = result?.data || []
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({
    subjectName: DEFAULT_SUBJECTS[0].name,
    subjectCode: DEFAULT_SUBJECTS[0].code,
    className: 'Class 10',
    academicYear: ACADEMIC_YEARS[0],
    term: TERMS[0],
    totalMarks: 100,
    duration: '3 hours',
    difficulty: 'medium' as PaperDifficulty,
  })

  const handleCreate = () => {
    const subject = DEFAULT_SUBJECTS.find(s => s.name === form.subjectName)
    createMutation.mutate(
      {
        subjectId: `subj_custom_${Date.now()}`,
        subjectName: form.subjectName,
        subjectCode: subject?.code || form.subjectCode,
        className: form.className,
        academicYear: form.academicYear,
        term: form.term,
        totalMarks: form.totalMarks,
        duration: form.duration,
        difficulty: form.difficulty,
        sections: [
          { name: 'Section A - MCQ', instructions: 'Choose the correct answer', questionCount: 20, marksPerQuestion: 1, totalMarks: 20 },
          { name: 'Section B - Short Answer', instructions: 'Answer briefly', questionCount: 10, marksPerQuestion: 3, totalMarks: 30 },
          { name: 'Section C - Long Answer', instructions: 'Answer in detail', questionCount: 10, marksPerQuestion: 5, totalMarks: 50 },
        ],
      },
      {
        onSuccess: () => {
          toast({ title: 'Created', description: 'Question paper template created.' })
          setCreateOpen(false)
        },
        onError: () => toast({ title: 'Error', description: 'Failed to create paper', variant: 'destructive' }),
      }
    )
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast({ title: 'Deleted', description: 'Question paper deleted.' }),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Question Paper Management</h3>
          <p className="text-sm text-muted-foreground">Create, manage, and organize examination question paper templates</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Paper
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}</div>
      ) : papers.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No question papers found.</CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {papers.map(paper => (
            <Card key={paper.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-base">{paper.subjectName} ({paper.subjectCode})</CardTitle>
                      <p className="text-xs text-muted-foreground">{paper.className} &middot; {paper.term} &middot; {paper.academicYear}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(paper.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">{paper.totalMarks} marks</Badge>
                  <Badge variant="outline">{paper.duration}</Badge>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[paper.difficulty]}`}>
                    {PAPER_DIFFICULTY_LABELS[paper.difficulty]}
                  </span>
                </div>
                {paper.examName && <p className="text-xs text-muted-foreground mb-2">Exam: {paper.examName}</p>}
                <div className="space-y-1">
                  {paper.sections.map((section, idx) => (
                    <div key={idx} className="text-xs flex items-center justify-between bg-muted rounded px-2 py-1">
                      <span>{section.name}</span>
                      <span className="text-muted-foreground">{section.questionCount} Qs &middot; {section.totalMarks} marks</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Created by {paper.createdBy}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Question Paper</DialogTitle>
            <DialogDescription>Create a new question paper template.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Subject</Label>
                <Select value={form.subjectName} onValueChange={(v) => {
                  const subj = DEFAULT_SUBJECTS.find(s => s.name === v)
                  setForm(f => ({ ...f, subjectName: v, subjectCode: subj?.code || f.subjectCode }))
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEFAULT_SUBJECTS.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Class</Label>
                <Select value={form.className} onValueChange={(v) => setForm(f => ({ ...f, className: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Total Marks</Label>
                <Input type="number" value={form.totalMarks} onChange={(e) => setForm(f => ({ ...f, totalMarks: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>Duration</Label>
                <Input value={form.duration} onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))} />
              </div>
              <div>
                <Label>Difficulty</Label>
                <Select value={form.difficulty} onValueChange={(v) => setForm(f => ({ ...f, difficulty: v as PaperDifficulty }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(PAPER_DIFFICULTY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Academic Year</Label>
                <Select value={form.academicYear} onValueChange={(v) => setForm(f => ({ ...f, academicYear: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACADEMIC_YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Term</Label>
                <Select value={form.term} onValueChange={(v) => setForm(f => ({ ...f, term: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Paper
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
