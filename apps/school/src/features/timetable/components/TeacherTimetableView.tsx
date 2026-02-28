import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useTeacherTimetable, usePeriodDefinitions } from '../hooks/useTimetable'
import { DAYS_OF_WEEK } from '../types/timetable.types'

// Mock teachers
const TEACHERS = [
  { id: 'TCH001', name: 'Dr. Ramesh Krishnamurthy' },
  { id: 'TCH002', name: 'Prof. Sunita Venkataraman' },
  { id: 'TCH003', name: 'Dr. Anil Bhattacharya' },
  { id: 'TCH004', name: 'Meenakshi Iyer' },
  { id: 'TCH005', name: 'Dr. Suresh Narayanan' },
  { id: 'TCH006', name: 'Kavitha Raghavan' },
  { id: 'TCH007', name: 'Rajesh Tiwari' },
  { id: 'TCH008', name: 'Deepa Kulkarni' },
  { id: 'TCH009', name: 'Amit Sharma' },
  { id: 'TCH010', name: 'Priya Mehta' },
]

export function TeacherTimetableView() {
  const [selectedTeacherId, setSelectedTeacherId] = useState('')

  const { data: result, isLoading } = useTeacherTimetable(selectedTeacherId)
  const { data: periodsResult, isLoading: periodsLoading } = usePeriodDefinitions()

  const entries = result?.data?.entries ?? []
  const periods = periodsResult?.data ?? []

  // Create lookup map
  const entryMap = new Map<string, (typeof entries)[0]>()
  entries.forEach((entry) => {
    const key = `${entry.day}-${entry.periodId}`
    entryMap.set(key, entry)
  })

  const selectedTeacher = TEACHERS.find((t) => t.id === selectedTeacherId)

  const getPeriodTypeStyle = (type: string) => {
    switch (type) {
      case 'break':
        return 'bg-green-50'
      case 'lunch':
        return 'bg-orange-50'
      default:
        return ''
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Teacher Timetable</CardTitle>
        <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select a teacher" />
          </SelectTrigger>
          <SelectContent>
            {TEACHERS.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {!selectedTeacherId ? (
          <div className="text-center py-12 text-muted-foreground">
            Select a teacher to view their timetable
          </div>
        ) : isLoading || periodsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="mb-4">
              <p className="text-lg font-medium">{selectedTeacher?.name}</p>
              <p className="text-sm text-muted-foreground">
                {entries.length} periods per week
              </p>
            </div>

            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted text-left w-24">Period</th>
                  <th className="border p-2 bg-muted text-center w-16">Time</th>
                  {DAYS_OF_WEEK.map((day) => (
                    <th key={day.value} className="border p-2 bg-muted text-center">
                      {day.short}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {periods.map((period) => (
                  <tr key={period.id} className={getPeriodTypeStyle(period.type)}>
                    <td className="border p-2 font-medium">
                      <div className="flex flex-col">
                        <span>{period.name}</span>
                        {period.type !== 'class' && (
                          <Badge variant="outline" className="w-fit text-xs mt-1">
                            {period.type}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="border p-2 text-center text-xs text-muted-foreground">
                      {period.startTime}
                      <br />
                      {period.endTime}
                    </td>
                    {DAYS_OF_WEEK.map((day) => {
                      const entry = entryMap.get(`${day.value}-${period.id}`)
                      const isBreak = period.type !== 'class'

                      if (isBreak) {
                        return (
                          <td
                            key={day.value}
                            className="border p-2 text-center text-muted-foreground italic"
                          >
                            {period.type === 'lunch' ? '🍽️' : period.type === 'break' ? '☕' : '—'}
                          </td>
                        )
                      }

                      if (!entry) {
                        return (
                          <td key={day.value} className="border p-2 text-center">
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              Free
                            </Badge>
                          </td>
                        )
                      }

                      return (
                        <td key={day.value} className="border p-1">
                          <div className="rounded p-2 text-xs bg-blue-50 border border-blue-200">
                            <div className="font-semibold truncate">{entry.subjectName}</div>
                            <div className="truncate text-[10px] text-muted-foreground">
                              {entry.className} - {entry.sectionName}
                            </div>
                            <div className="truncate text-[10px] text-muted-foreground">
                              {entry.roomName}
                            </div>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
