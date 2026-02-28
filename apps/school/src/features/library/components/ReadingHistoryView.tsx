import { useState } from 'react'
import { Star, BookOpen, TrendingUp, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useReadingHistory, useAvailableStudents, useStudentReadingReport, useBookRecommendations } from '../hooks/useLibrary'
import { BOOK_CATEGORIES, type BookCategory } from '../types/library.types'
import { statusColors, moduleColors, ratingColors } from '@/lib/design-tokens'

export function ReadingHistoryView() {
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data: studentsResult } = useAvailableStudents(studentSearch)
  const studentsList = studentsResult?.data || []

  const { data: historyResult, isLoading: historyLoading } = useReadingHistory({
    studentId: selectedStudentId || undefined,
    category: categoryFilter,
    page,
    limit: 15,
  })

  const { data: reportResult } = useStudentReadingReport(selectedStudentId)
  const { data: recsResult } = useBookRecommendations(selectedStudentId)

  const records = historyResult?.data || []
  const pagination = historyResult?.meta
  const report = reportResult?.data
  const recommendations = recsResult?.data || []

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-muted-foreground text-xs">No rating</span>
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
          <Star key={s} className={`h-3 w-3 ${s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Reading History & Analytics</h3>
        <p className="text-sm text-muted-foreground">Track student reading habits, progress, and personalized recommendations</p>
      </div>

      <div className="flex items-center gap-4">
        <Select value={selectedStudentId} onValueChange={(v) => { setSelectedStudentId(v); setPage(1) }}>
          <SelectTrigger className="w-[260px]"><SelectValue placeholder="Select a student" /></SelectTrigger>
          <SelectContent>
            <div className="px-2 pb-2">
              <Input
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="h-8"
              />
            </div>
            {studentsList.slice(0, 20).map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name} ({s.className}-{s.section})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {BOOK_CATEGORIES.map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedStudentId && report && (
        <Tabs defaultValue="report">
          <TabsList>
            <TabsTrigger value="report">Reading Report</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations ({recommendations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <BookOpen className="h-8 w-8" style={{ color: statusColors.info }} />
                  <div>
                    <div className="text-2xl font-bold">{report.totalBooksRead}</div>
                    <p className="text-xs text-muted-foreground">Books Read</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <TrendingUp className="h-8 w-8" style={{ color: statusColors.success }} />
                  <div>
                    <div className="text-2xl font-bold">{report.averageDaysToRead}</div>
                    <p className="text-xs text-muted-foreground">Avg Days/Book</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <Star className="h-8 w-8" style={{ color: ratingColors.star }} />
                  <div>
                    <div className="text-2xl font-bold">{report.averageRating || '-'}</div>
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <BarChart3 className="h-8 w-8" style={{ color: moduleColors.integrations }} />
                  <div>
                    <div className="text-2xl font-bold">{report.favoriteCategory}</div>
                    <p className="text-xs text-muted-foreground">Favorite Genre</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.categoryBreakdown.map(cb => (
                    <div key={cb.category} className="flex items-center gap-3">
                      <span className="text-sm w-24 truncate">{cb.category}</span>
                      <Progress value={(cb.count / report.totalBooksRead) * 100} className="flex-1 h-2" />
                      <span className="text-sm font-medium w-8 text-right">{cb.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {recommendations.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No recommendations available yet.</CardContent></Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {recommendations.map(rec => (
                  <Card key={rec.bookId}>
                    <CardContent className="p-3 flex gap-3">
                      <img
                        src={rec.coverUrl}
                        alt={rec.bookTitle}
                        className="w-12 h-16 rounded object-cover bg-muted"
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/200x300?text=No+Cover' }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{rec.bookTitle}</h4>
                        <p className="text-xs text-muted-foreground">{rec.bookAuthor}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{rec.bookCategory}</Badge>
                          <Badge variant="secondary" className="text-xs">{rec.matchScore}% match</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{rec.reason}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* History Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Reading History</CardTitle>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : records.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No reading records found.</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Book</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Returned</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map(r => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <span className="font-medium">{r.studentName}</span>
                        <span className="text-xs text-muted-foreground ml-1">{r.studentClass}-{r.studentSection}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{r.bookTitle}</span>
                        <span className="text-xs text-muted-foreground block">{r.bookAuthor}</span>
                      </TableCell>
                      <TableCell><Badge variant="outline">{r.bookCategory}</Badge></TableCell>
                      <TableCell className="text-sm">{new Date(r.issueDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm">{new Date(r.returnDate).toLocaleDateString()}</TableCell>
                      <TableCell>{r.daysToRead}</TableCell>
                      <TableCell>{renderStars(r.rating)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
