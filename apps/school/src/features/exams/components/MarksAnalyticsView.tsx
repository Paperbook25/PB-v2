import { useState } from 'react'
import { Trophy, TrendingUp, Users, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useExams, useClassAnalytics } from '../hooks/useExams'
import { CLASSES, SECTIONS } from '../types/exams.types'

export function MarksAnalyticsView() {
  const { data: examsResult } = useExams({})
  const publishedExams = (examsResult?.data || []).filter(e => e.status === 'results_published' || e.status === 'completed')

  const [selectedExamId, setSelectedExamId] = useState(publishedExams[0]?.id || '')
  const [selectedClass, setSelectedClass] = useState('Class 10')
  const [selectedSection, setSelectedSection] = useState('A')

  const { data: analyticsResult, isLoading } = useClassAnalytics(selectedExamId, selectedClass, selectedSection)
  const analytics = analyticsResult?.data

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Marks Analytics & Rankings</h3>
        <p className="text-sm text-muted-foreground">Class toppers, subject analysis, and grade distribution</p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Select value={selectedExamId} onValueChange={setSelectedExamId}>
          <SelectTrigger className="w-[260px]"><SelectValue placeholder="Select exam" /></SelectTrigger>
          <SelectContent>
            {publishedExams.map(e => (
              <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CLASSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={selectedSection} onValueChange={setSelectedSection}>
          <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SECTIONS.map(s => <SelectItem key={s} value={s}>Section {s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-60 w-full" /></div>
      ) : !analytics ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Select an exam with published results to view analytics.</CardContent></Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{analytics.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Total Students</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{analytics.classAverage}%</div>
                  <p className="text-xs text-muted-foreground">Class Average</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{analytics.passPercentage}%</div>
                  <p className="text-xs text-muted-foreground">Pass Rate</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <div>
                  <div className="text-2xl font-bold">{analytics.toppers[0]?.percentage || 0}%</div>
                  <p className="text-xs text-muted-foreground">Top Score</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="toppers">
            <TabsList>
              <TabsTrigger value="toppers">Class Toppers</TabsTrigger>
              <TabsTrigger value="subjects">Subject Analysis</TabsTrigger>
              <TabsTrigger value="grades">Grade Distribution</TabsTrigger>
            </TabsList>

            <TabsContent value="toppers">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics.toppers.map(t => (
                    <TableRow key={t.studentId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {t.rank <= 3 && <Trophy className={`h-4 w-4 ${t.rank === 1 ? 'text-yellow-500' : t.rank === 2 ? 'text-gray-400' : 'text-amber-600'}`} />}
                          <span className="font-medium">#{t.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{t.studentName}</TableCell>
                      <TableCell className="text-right font-bold">{t.percentage}%</TableCell>
                      <TableCell><Badge variant="outline">{t.grade}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="subjects" className="space-y-3">
              {analytics.subjectWise.map(s => (
                <Card key={s.subjectId}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{s.subjectName}</h4>
                      <Badge variant={s.passPercentage >= 80 ? 'default' : s.passPercentage >= 50 ? 'secondary' : 'destructive'}>
                        {s.passPercentage}% pass
                      </Badge>
                    </div>
                    <div className="grid grid-cols-5 gap-4 text-sm mb-2">
                      <div><span className="text-muted-foreground">Avg:</span> <span className="font-medium">{s.average}</span></div>
                      <div><span className="text-muted-foreground">Highest:</span> <span className="font-medium text-green-600">{s.highest}</span></div>
                      <div><span className="text-muted-foreground">Lowest:</span> <span className="font-medium text-red-600">{s.lowest}</span></div>
                      <div><span className="text-muted-foreground">Appeared:</span> <span className="font-medium">{s.appeared}</span></div>
                      <div><span className="text-muted-foreground">Absent:</span> <span className="font-medium">{s.absent}</span></div>
                    </div>
                    <Progress value={s.passPercentage} className="h-2" />
                    {s.toppers.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Trophy className="h-3 w-3 text-yellow-500" />
                        Top: {s.toppers.map(t => `${t.studentName} (${t.marks})`).join(', ')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="grades">
              <Card>
                <CardContent className="p-4 space-y-3">
                  {analytics.gradeDistribution
                    .sort((a, b) => a.grade.localeCompare(b.grade))
                    .map(g => (
                    <div key={g.grade} className="flex items-center gap-3">
                      <Badge variant="outline" className="w-10 justify-center">{g.grade}</Badge>
                      <Progress value={(g.count / analytics.totalStudents) * 100} className="flex-1 h-3" />
                      <span className="text-sm font-medium w-16 text-right">{g.count} ({Math.round((g.count / analytics.totalStudents) * 100)}%)</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
