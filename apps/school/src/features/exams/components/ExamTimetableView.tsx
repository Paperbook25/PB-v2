import { Calendar, Clock, MapPin, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { useExams, useExamTimetable } from '../hooks/useExams'

export function ExamTimetableView() {
  const { data: examsResult } = useExams({})
  const allExams = examsResult?.data || []
  const [selectedExamId, setSelectedExamId] = useState(allExams[0]?.id || '')

  const { data: timetableResult, isLoading } = useExamTimetable(selectedExamId)
  const timetable = timetableResult?.data
  const slots = timetable?.slots || []

  // Group by date
  const dateGroups = new Map<string, typeof slots>()
  slots.forEach(slot => {
    const existing = dateGroups.get(slot.date) || []
    existing.push(slot)
    dateGroups.set(slot.date, existing)
  })

  const sortedDates = [...dateGroups.keys()].sort()

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Exam Timetable</h3>
        <p className="text-sm text-muted-foreground">View exam schedule with dates, times, rooms, and invigilators</p>
      </div>

      <Select value={selectedExamId} onValueChange={setSelectedExamId}>
        <SelectTrigger className="w-[300px]"><SelectValue placeholder="Select an exam" /></SelectTrigger>
        <SelectContent>
          {allExams.map(e => (
            <SelectItem key={e.id} value={e.id}>{e.name} ({e.term})</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoading ? (
        <Skeleton className="h-60 w-full" />
      ) : slots.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No timetable available for this exam.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {sortedDates.map(date => {
            const daySlots = dateGroups.get(date) || []
            return (
              <Card key={date}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Invigilator</TableHead>
                        <TableHead>Classes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {daySlots.map(slot => (
                        <TableRow key={slot.id}>
                          <TableCell>
                            <span className="font-medium">{slot.subjectName}</span>
                            <span className="text-xs text-muted-foreground ml-1">({slot.subjectCode})</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              {slot.startTime} - {slot.endTime}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {slot.room}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              {slot.invigilator}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {slot.applicableClasses.slice(0, 3).map(c => (
                                <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                              ))}
                              {slot.applicableClasses.length > 3 && (
                                <Badge variant="secondary" className="text-xs">+{slot.applicableClasses.length - 3}</Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
