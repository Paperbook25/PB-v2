import { useState } from 'react'
import { Palette, Music, Dumbbell, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useCoScholasticRecords } from '../hooks/useExams'
import { CO_SCHOLASTIC_AREA_LABELS, CO_SCHOLASTIC_GRADE_LABELS, TERMS, type CoScholasticArea, type CoScholasticGrade } from '../types/exams.types'

const GRADE_COLORS: Record<CoScholasticGrade, string> = {
  A: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
  B: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
  C: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
}

export function CoScholasticView() {
  const [studentId, setStudentId] = useState('')
  const [termFilter, setTermFilter] = useState('all')
  const [areaFilter, setAreaFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data: result, isLoading } = useCoScholasticRecords({
    studentId: studentId || undefined,
    term: termFilter !== 'all' ? termFilter : undefined,
    area: areaFilter,
    page,
    limit: 20,
  })

  const records = result?.data || []
  const pagination = result?.pagination

  // Group records by student for summary view
  const studentGroups = new Map<string, typeof records>()
  records.forEach(r => {
    const existing = studentGroups.get(r.studentId) || []
    existing.push(r)
    studentGroups.set(r.studentId, existing)
  })

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Co-Scholastic Assessment (CCE)</h3>
        <p className="text-sm text-muted-foreground">Art, Music, Sports, Discipline, and other co-scholastic areas as per CBSE CCE guidelines</p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Input
          value={studentId}
          onChange={(e) => { setStudentId(e.target.value); setPage(1) }}
          placeholder="Filter by Student ID..."
          className="max-w-xs"
        />
        <Select value={termFilter} onValueChange={(v) => { setTermFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Terms</SelectItem>
            {TERMS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={areaFilter} onValueChange={(v) => { setAreaFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            {Object.entries(CO_SCHOLASTIC_AREA_LABELS).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-60 w-full" />
      ) : records.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No co-scholastic records found.</CardContent></Card>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead>Assessed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.studentName}</TableCell>
                  <TableCell>{r.studentClass}-{r.studentSection}</TableCell>
                  <TableCell><Badge variant="outline">{r.term}</Badge></TableCell>
                  <TableCell>{CO_SCHOLASTIC_AREA_LABELS[r.area]}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${GRADE_COLORS[r.grade]}`}>
                      {r.grade} - {CO_SCHOLASTIC_GRADE_LABELS[r.grade]}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{r.remarks}</TableCell>
                  <TableCell className="text-sm">{r.assessedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
