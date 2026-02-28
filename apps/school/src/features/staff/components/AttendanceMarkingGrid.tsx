import { useState, useEffect } from 'react'
import { Check, X, Clock, Calendar as CalendarIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getInitials } from '@/lib/utils'
import { getAttendanceBadgeVariant, ATTENDANCE_COLORS } from '@/lib/attendance-ui'
import type { Staff, StaffAttendanceStatus, BulkAttendanceRecord, StaffAttendanceRecord } from '../types/staff.types'

interface AttendanceMarkingGridProps {
  date: string
  staffList: Staff[]
  existingRecords: StaffAttendanceRecord[]
  onSave: (records: BulkAttendanceRecord[]) => void
  isSaving?: boolean
}

const STATUS_OPTIONS: { value: StaffAttendanceStatus; label: string; icon: React.ReactNode }[] = [
  { value: 'present', label: 'Present', icon: <Check className="h-4 w-4" /> },
  { value: 'absent', label: 'Absent', icon: <X className="h-4 w-4" /> },
  { value: 'half_day', label: 'Half Day', icon: <Clock className="h-4 w-4" /> },
  { value: 'on_leave', label: 'On Leave', icon: <CalendarIcon className="h-4 w-4" /> },
]

interface AttendanceEntry {
  staffId: string
  status: StaffAttendanceStatus
  checkInTime: string
  checkOutTime: string
}

export function AttendanceMarkingGrid({
  date,
  staffList,
  existingRecords,
  onSave,
  isSaving,
}: AttendanceMarkingGridProps) {
  const [search, setSearch] = useState('')
  const [attendance, setAttendance] = useState<Record<string, AttendanceEntry>>({})
  const [hasChanges, setHasChanges] = useState(false)

  // Initialize attendance from existing records
  useEffect(() => {
    const initialAttendance: Record<string, AttendanceEntry> = {}

    // First, set default values for all active staff
    staffList
      .filter((s) => s.status === 'active')
      .forEach((staff) => {
        initialAttendance[staff.id] = {
          staffId: staff.id,
          status: 'present',
          checkInTime: '09:00',
          checkOutTime: '17:00',
        }
      })

    // Then, override with existing records
    existingRecords.forEach((record) => {
      initialAttendance[record.staffId] = {
        staffId: record.staffId,
        status: record.status,
        checkInTime: record.checkInTime || '09:00',
        checkOutTime: record.checkOutTime || '17:00',
      }
    })

    setAttendance(initialAttendance)
    setHasChanges(false)
  }, [staffList, existingRecords, date])

  const updateStatus = (staffId: string, status: StaffAttendanceStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [staffId]: { ...prev[staffId], status },
    }))
    setHasChanges(true)
  }

  const updateCheckIn = (staffId: string, time: string) => {
    setAttendance((prev) => ({
      ...prev,
      [staffId]: { ...prev[staffId], checkInTime: time },
    }))
    setHasChanges(true)
  }

  const updateCheckOut = (staffId: string, time: string) => {
    setAttendance((prev) => ({
      ...prev,
      [staffId]: { ...prev[staffId], checkOutTime: time },
    }))
    setHasChanges(true)
  }

  const markAllPresent = () => {
    const updated: Record<string, AttendanceEntry> = {}
    staffList
      .filter((s) => s.status === 'active')
      .forEach((staff) => {
        updated[staff.id] = {
          staffId: staff.id,
          status: 'present',
          checkInTime: attendance[staff.id]?.checkInTime || '09:00',
          checkOutTime: attendance[staff.id]?.checkOutTime || '17:00',
        }
      })
    setAttendance(updated)
    setHasChanges(true)
  }

  const handleSave = () => {
    const records: BulkAttendanceRecord[] = Object.values(attendance).map((entry) => ({
      staffId: entry.staffId,
      status: entry.status,
      checkInTime: entry.status === 'present' || entry.status === 'half_day' ? entry.checkInTime : undefined,
      checkOutTime: entry.status === 'present' ? entry.checkOutTime : entry.status === 'half_day' ? entry.checkInTime : undefined,
    }))
    onSave(records)
  }

  const filteredStaff = staffList
    .filter((s) => s.status === 'active')
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Input
          placeholder="Search staff..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllPresent}>
            Mark All Present
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Attendance'
            )}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Staff Member</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaff.map((staff) => {
              const entry = attendance[staff.id]
              const showTimes = entry?.status === 'present' || entry?.status === 'half_day'

              return (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={staff.photoUrl} />
                        <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{staff.name}</p>
                        <p className="text-xs text-muted-foreground">{staff.employeeId}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{staff.department}</TableCell>
                  <TableCell>
                    <Select
                      value={entry?.status || 'present'}
                      onValueChange={(value) => updateStatus(staff.id, value as StaffAttendanceStatus)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={getAttendanceBadgeVariant(option.value)}
                                className="w-6 h-6 p-0 flex items-center justify-center"
                              >
                                {option.icon}
                              </Badge>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="time"
                      value={entry?.checkInTime || '09:00'}
                      onChange={(e) => updateCheckIn(staff.id, e.target.value)}
                      disabled={!showTimes}
                      className="w-[120px]"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="time"
                      value={entry?.checkOutTime || '17:00'}
                      onChange={(e) => updateCheckOut(staff.id, e.target.value)}
                      disabled={entry?.status !== 'present'}
                      className="w-[120px]"
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {filteredStaff.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No staff members found
        </div>
      )}
    </div>
  )
}
