import { useState } from 'react'
import { Calendar, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { useClassTimetable, useStaffList } from '../hooks/useStaff'
import { DAYS_OF_WEEK, PERIODS, type DayOfWeek, type TimetableEntry } from '../types/staff.types'
import { TimetableView } from '../components/TimetableView'

const CLASSES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']
const SECTIONS = ['A', 'B', 'C']

function ClassTimetableGrid({ cls, section }: { cls: string; section: string }) {
  const { data: timetableResponse, isLoading } = useClassTimetable(cls, section)
  const timetable = timetableResponse?.data

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />
  }

  const entries = timetable?.entries ?? []

  const getEntry = (day: DayOfWeek, period: number): TimetableEntry | undefined => {
    return entries.find((e: TimetableEntry) => e.day === day && e.periodNumber === period)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border p-2 bg-muted text-left font-medium w-24">Period</th>
            {DAYS_OF_WEEK.map((day) => (
              <th key={day} className="border p-2 bg-muted text-center font-medium">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((period) => (
            <tr key={period.number}>
              <td className="border p-2 bg-muted/50">
                <div className="text-xs font-medium">Period {period.number}</div>
                <div className="text-xs text-muted-foreground">
                  {period.startTime} - {period.endTime}
                </div>
              </td>
              {DAYS_OF_WEEK.map((day) => {
                const entry = getEntry(day, period.number)
                return (
                  <td key={day} className="border p-2 min-w-[120px]">
                    {entry ? (
                      <div className="space-y-1">
                        <p className="text-xs font-medium">{entry.subject}</p>
                        <p className="text-xs text-muted-foreground">{entry.staffName}</p>
                        {entry.room && (
                          <Badge variant="outline" className="text-[10px] h-4">
                            {entry.room}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function TimetableManagementPage() {
  const [selectedClass, setSelectedClass] = useState('Class 10')
  const [selectedSection, setSelectedSection] = useState('A')
  const [selectedStaffId, setSelectedStaffId] = useState('')

  const { data: staffData } = useStaffList({ status: 'active' })
  const staffList = staffData?.data ?? []
  const teachingStaff = staffList.filter((s) =>
    ['Teacher', 'Senior Teacher', 'Assistant Teacher'].includes(s.designation)
  )

  return (
    <div>
      <PageHeader
        title="Timetable Management"
        description="View and manage class and teacher timetables"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Staff', href: '/staff' },
          { label: 'Timetable' },
        ]}
      />

      <Tabs defaultValue="class" className="space-y-4">
        <TabsList>
          <TabsTrigger value="class">
            <Calendar className="h-4 w-4 mr-2" />
            Class Timetable
          </TabsTrigger>
          <TabsTrigger value="teacher">
            <Users className="h-4 w-4 mr-2" />
            Teacher Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="class" className="space-y-4">
          <div className="flex gap-3">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLASSES.map((cls) => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SECTIONS.map((sec) => (
                  <SelectItem key={sec} value={sec}>Section {sec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedClass} - Section {selectedSection}
              </CardTitle>
              <CardDescription>Weekly class schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <ClassTimetableGrid cls={selectedClass} section={selectedSection} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teacher" className="space-y-4">
          <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select a teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachingStaff.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} - {s.department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedStaffId ? (
            <TimetableView staffId={selectedStaffId} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Users className="h-10 w-10 mb-3 opacity-40" />
                <p className="text-sm font-medium">Select a teacher to view their schedule</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
