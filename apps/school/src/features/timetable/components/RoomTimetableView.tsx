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
import { useRoomTimetable, useRooms, usePeriodDefinitions } from '../hooks/useTimetable'
import { DAYS_OF_WEEK } from '../types/timetable.types'

export function RoomTimetableView() {
  const [selectedRoomId, setSelectedRoomId] = useState('')

  const { data: roomsResult } = useRooms()
  const { data: result, isLoading } = useRoomTimetable(selectedRoomId)
  const { data: periodsResult, isLoading: periodsLoading } = usePeriodDefinitions()

  const rooms = roomsResult?.data ?? []
  const entries = result?.data?.entries ?? []
  const periods = periodsResult?.data ?? []

  // Create lookup map
  const entryMap = new Map<string, (typeof entries)[0]>()
  entries.forEach((entry) => {
    const key = `${entry.day}-${entry.periodId}`
    entryMap.set(key, entry)
  })

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId)

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

  // Calculate utilization
  const classPeriods = periods.filter((p) => p.type === 'class')
  const totalSlots = classPeriods.length * 6 // 6 days
  const occupiedSlots = entries.length
  const utilization = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Room Schedule</CardTitle>
        <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select a room" />
          </SelectTrigger>
          <SelectContent>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name} - {room.building}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {!selectedRoomId ? (
          <div className="text-center py-12 text-muted-foreground">
            Select a room to view its schedule
          </div>
        ) : isLoading || periodsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-lg font-medium">{selectedRoom?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedRoom?.building} • Capacity: {selectedRoom?.capacity}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{utilization}%</div>
                <p className="text-sm text-muted-foreground">Utilization</p>
              </div>
            </div>

            {selectedRoom?.facilities && selectedRoom.facilities.length > 0 && (
              <div className="mb-4 flex gap-2 flex-wrap">
                {selectedRoom.facilities.map((facility) => (
                  <Badge key={facility} variant="secondary">
                    {facility}
                  </Badge>
                ))}
              </div>
            )}

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
                            —
                          </td>
                        )
                      }

                      if (!entry) {
                        return (
                          <td key={day.value} className="border p-2 text-center">
                            <Badge variant="outline" className="text-green-600 border-green-300">
                              Available
                            </Badge>
                          </td>
                        )
                      }

                      return (
                        <td key={day.value} className="border p-1">
                          <div className="rounded p-2 text-xs bg-purple-50 border border-purple-200">
                            <div className="font-semibold truncate">
                              {entry.className} - {entry.sectionName}
                            </div>
                            <div className="truncate text-[10px] text-muted-foreground">
                              {entry.subjectName}
                            </div>
                            <div className="truncate text-[10px] text-muted-foreground">
                              {entry.teacherName}
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
