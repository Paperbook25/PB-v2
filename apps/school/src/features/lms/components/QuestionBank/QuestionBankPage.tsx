import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Plus,
  Search,
  FileUp,
  BookOpen,
  Target,
  BarChart3,
  Filter,
} from 'lucide-react'
import { useQuestions, useQuestionBankStats } from '../../hooks/useQuestionBank'
import { QuestionList } from './QuestionList'
import { QuestionEditor } from './QuestionEditor'
import { QuestionImport } from './QuestionImport'
import type { QuestionFilters, BankQuestion } from '../../types/question-bank.types'
import {
  COURSE_CATEGORIES,
  COURSE_CATEGORY_LABELS,
  type CourseCategory,
} from '../../types/lms.types'
import {
  QUESTION_DIFFICULTY_LABELS,
  QUESTION_TYPE_LABELS,
  SUBJECT_TOPICS,
  type QuestionDifficulty,
} from '../../types/question-bank.types'
import type { QuizQuestionType } from '../../types/lms.types'

export function QuestionBankPage() {
  const [filters, setFilters] = useState<QuestionFilters>({
    page: 1,
    limit: 20,
  })
  const [showFilters, setShowFilters] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<BankQuestion | undefined>()

  const { data: questionsResult, isLoading } = useQuestions(filters)
  const { data: statsResult } = useQuestionBankStats()

  const questions = questionsResult?.data || []
  const meta = questionsResult?.meta
  const stats = statsResult?.data

  const handleSearch = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }))
  }

  const handleFilterChange = (key: keyof QuestionFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1,
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }))
  }

  const handleEdit = (question: BankQuestion) => {
    setEditingQuestion(question)
    setEditorOpen(true)
  }

  const handleAddNew = () => {
    setEditingQuestion(undefined)
    setEditorOpen(true)
  }

  const topics = filters.subject ? SUBJECT_TOPICS[filters.subject] || [] : []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question Bank"
        description="Manage questions for online exams and quizzes"
        breadcrumbs={[
          { label: 'LMS', href: '/lms' },
          { label: 'Question Bank' },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportOpen(true)}>
              <FileUp className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.recentlyAdded} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">By Difficulty</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge style={{ backgroundColor: 'var(--color-status-success-light)', color: 'var(--color-status-success)' }}>
                  Easy: {stats.byDifficulty.easy}
                </Badge>
                <Badge style={{ backgroundColor: 'var(--color-status-warning-light)', color: 'var(--color-status-warning)' }}>
                  Med: {stats.byDifficulty.medium}
                </Badge>
                <Badge style={{ backgroundColor: 'var(--color-status-error-light)', color: 'var(--color-status-error)' }}>
                  Hard: {stats.byDifficulty.hard}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">By Type</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline">MCQ: {stats.byType.mcq}</Badge>
                <Badge variant="outline">T/F: {stats.byType.true_false}</Badge>
                <Badge variant="outline">Short: {stats.byType.short_answer}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Subjects</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {Object.entries(stats.bySubject)
                  .filter(([_, count]) => count > 0)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 3)
                  .map(([subject, count]) => (
                    <Badge key={subject} variant="secondary">
                      {COURSE_CATEGORY_LABELS[subject as CourseCategory]}: {count}
                    </Badge>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  className="pl-10"
                  value={filters.search || ''}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {(filters.subject || filters.difficulty || filters.type) && (
                  <Badge variant="secondary" className="ml-2">
                    Active
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Row */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Select
                  value={filters.subject || ''}
                  onValueChange={(v) => {
                    handleFilterChange('subject', v)
                    if (!v) handleFilterChange('topic', '')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Subjects</SelectItem>
                    {COURSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {COURSE_CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.topic || ''}
                  onValueChange={(v) => handleFilterChange('topic', v)}
                  disabled={!filters.subject}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Topics" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Topics</SelectItem>
                    {topics.map((topic) => (
                      <SelectItem key={topic} value={topic}>
                        {topic.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.difficulty || ''}
                  onValueChange={(v) => handleFilterChange('difficulty', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Difficulties</SelectItem>
                    {(Object.keys(QUESTION_DIFFICULTY_LABELS) as QuestionDifficulty[]).map(
                      (d) => (
                        <SelectItem key={d} value={d}>
                          {QUESTION_DIFFICULTY_LABELS[d]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.type || ''}
                  onValueChange={(v) => handleFilterChange('type', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    {(Object.keys(QUESTION_TYPE_LABELS) as QuizQuestionType[]).map((t) => (
                      <SelectItem key={t} value={t}>
                        {QUESTION_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <QuestionList
        questions={questions}
        isLoading={isLoading}
        meta={meta}
        onPageChange={handlePageChange}
        onEdit={handleEdit}
      />

      {/* Question Editor Dialog */}
      <QuestionEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        question={editingQuestion}
      />

      {/* Import Dialog */}
      <QuestionImport open={importOpen} onOpenChange={setImportOpen} />
    </div>
  )
}
