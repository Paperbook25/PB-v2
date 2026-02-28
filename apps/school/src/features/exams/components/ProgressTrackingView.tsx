import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useStudentProgress } from '../hooks/useExams'

export function ProgressTrackingView() {
  const [studentId, setStudentId] = useState('')
  const [inputId, setInputId] = useState('')

  const { data: progressResult, isLoading } = useStudentProgress(studentId)
  const progress = progressResult?.data

  const handleSearch = () => {
    if (inputId.trim()) setStudentId(inputId.trim())
  }

  const TrendIcon = progress?.overallTrend === 'improving' ? TrendingUp :
    progress?.overallTrend === 'declining' ? TrendingDown : Minus

  const trendColor = progress?.overallTrend === 'improving' ? 'text-green-600' :
    progress?.overallTrend === 'declining' ? 'text-red-600' : 'text-yellow-600'

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Progress Tracking</h3>
        <p className="text-sm text-muted-foreground">Track student performance across terms and identify improvement trends</p>
      </div>

      <div className="flex items-center gap-3 max-w-md">
        <Input
          value={inputId}
          onChange={(e) => setInputId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter Student ID"
        />
        <button onClick={handleSearch} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Track
        </button>
      </div>

      {isLoading && <Skeleton className="h-60 w-full" />}

      {progress && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-lg">{progress.studentName}</h4>
                  <p className="text-sm text-muted-foreground">{progress.studentClass} - {progress.studentSection}</p>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${trendColor}`}>
                    <TrendIcon className="h-5 w-5" />
                    <span className="font-bold text-lg capitalize">{progress.overallTrend}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {progress.improvementPercentage > 0 ? '+' : ''}{progress.improvementPercentage}% overall change
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Term-over-Term Comparison */}
          <div className="grid gap-4 md:grid-cols-3">
            {progress.terms.map((term, idx) => {
              const prevPct = idx > 0 ? progress.terms[idx - 1].percentage : null
              const diff = prevPct !== null ? term.percentage - prevPct : null

              return (
                <Card key={term.examId}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">{term.term}</CardTitle>
                      <Badge variant="outline">{term.grade}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground mb-1">{term.examName}</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{term.percentage}%</span>
                      {diff !== null && (
                        <span className={`text-sm flex items-center ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {diff > 0 ? <ArrowUpRight className="h-3 w-3" /> : diff < 0 ? <ArrowDownRight className="h-3 w-3" /> : null}
                          {diff > 0 ? '+' : ''}{Math.round(diff * 10) / 10}%
                        </span>
                      )}
                    </div>
                    {term.rank && <p className="text-xs text-muted-foreground mt-1">Rank: #{term.rank}</p>}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Subject-wise Progress Table */}
          {progress.terms.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Subject-wise Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      {progress.terms.map(t => (
                        <TableHead key={t.examId} className="text-center">{t.examName}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {progress.terms[0].subjectWise.map(subj => (
                      <TableRow key={subj.subjectName}>
                        <TableCell className="font-medium">{subj.subjectName}</TableCell>
                        {progress.terms.map(term => {
                          const s = term.subjectWise.find(sw => sw.subjectName === subj.subjectName)
                          return (
                            <TableCell key={term.examId} className="text-center">
                              {s ? (
                                <span className={s.percentage >= 80 ? 'text-green-600 font-medium' : s.percentage >= 50 ? '' : 'text-red-600'}>
                                  {s.marks}/{s.maxMarks} ({s.percentage}%)
                                </span>
                              ) : '-'}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {studentId && !isLoading && !progress && (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No progress data found for this student.</CardContent></Card>
      )}
    </div>
  )
}
