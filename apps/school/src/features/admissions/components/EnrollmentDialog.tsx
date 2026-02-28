import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, UserPlus, GraduationCap, Droplet, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { getInitials } from '@/lib/utils'
import type { Application } from '../types/admission.types'
import { SECTIONS, BLOOD_GROUPS } from '../types/enrollment.types'
import { useEnrollStudent, useNextRollNumber } from '../hooks/useEnrollment'

interface EnrollmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  application: Application
}

export function EnrollmentDialog({ open, onOpenChange, application }: EnrollmentDialogProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [section, setSection] = useState<string>('')
  const [rollNumber, setRollNumber] = useState<string>('')
  const [bloodGroup, setBloodGroup] = useState<string>('')
  const [autoRollNumber, setAutoRollNumber] = useState(true)

  const enrollStudent = useEnrollStudent()
  const { data: rollNumberData, isLoading: rollNumberLoading } = useNextRollNumber(
    application.applyingForClass,
    section
  )

  // Update roll number when section changes and auto mode is enabled
  useEffect(() => {
    if (autoRollNumber && rollNumberData?.nextRollNumber) {
      setRollNumber(String(rollNumberData.nextRollNumber))
    }
  }, [rollNumberData, autoRollNumber])

  const handleSubmit = () => {
    if (!section || !rollNumber || !bloodGroup) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    enrollStudent.mutate(
      {
        applicationId: application.id,
        section,
        rollNumber: parseInt(rollNumber, 10),
        bloodGroup,
      },
      {
        onSuccess: (data) => {
          toast({
            title: 'Student Enrolled Successfully',
            description: `${application.studentName} has been enrolled as a student.`,
          })
          onOpenChange(false)
          // Navigate to the new student's profile
          if (data.student?.id) {
            navigate(`/students/${data.student.id}`)
          }
        },
        onError: (error) => {
          toast({
            title: 'Enrollment Failed',
            description: error instanceof Error ? error.message : 'An error occurred during enrollment.',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleClose = () => {
    setSection('')
    setRollNumber('')
    setBloodGroup('')
    setAutoRollNumber(true)
    onOpenChange(false)
  }

  const isValid = section && rollNumber && bloodGroup

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Enroll Student
          </DialogTitle>
          <DialogDescription>
            Complete the enrollment to create a student record for this applicant.
          </DialogDescription>
        </DialogHeader>

        {/* Student Summary */}
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <Avatar className="h-14 w-14">
            <AvatarImage src={application.photoUrl} />
            <AvatarFallback>{getInitials(application.studentName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{application.studentName}</p>
            <p className="text-sm text-muted-foreground">
              Applying for {application.applyingForClass}
            </p>
            <p className="text-sm text-muted-foreground">
              Application #{application.applicationNumber}
            </p>
          </div>
        </div>

        <div className="space-y-4 py-4">
          {/* Section */}
          <div className="space-y-2">
            <Label htmlFor="section" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Section <span className="text-destructive">*</span>
            </Label>
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger id="section">
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {SECTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    Section {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Roll Number */}
          <div className="space-y-2">
            <Label htmlFor="rollNumber" className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Roll Number <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="rollNumber"
                type="number"
                min={1}
                value={rollNumber}
                onChange={(e) => {
                  setRollNumber(e.target.value)
                  setAutoRollNumber(false)
                }}
                placeholder={rollNumberLoading ? 'Loading...' : 'Enter roll number'}
                disabled={rollNumberLoading && autoRollNumber}
              />
              {!autoRollNumber && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAutoRollNumber(true)
                    if (rollNumberData?.nextRollNumber) {
                      setRollNumber(String(rollNumberData.nextRollNumber))
                    }
                  }}
                >
                  Auto
                </Button>
              )}
            </div>
            {section && autoRollNumber && (
              <p className="text-xs text-muted-foreground">
                Auto-generated based on existing students in {application.applyingForClass} - Section {section}
              </p>
            )}
          </div>

          {/* Blood Group */}
          <div className="space-y-2">
            <Label htmlFor="bloodGroup" className="flex items-center gap-2">
              <Droplet className="h-4 w-4" />
              Blood Group <span className="text-destructive">*</span>
            </Label>
            <Select value={bloodGroup} onValueChange={setBloodGroup}>
              <SelectTrigger id="bloodGroup">
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_GROUPS.map((bg) => (
                  <SelectItem key={bg} value={bg}>
                    {bg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <AlertDescription>
              Upon enrollment, a student record will be created with:
              <ul className="list-disc list-inside mt-2 text-sm">
                <li>Class: {application.applyingForClass}</li>
                <li>Section: {section || '(select above)'}</li>
                <li>Roll Number: {rollNumber || '(enter above)'}</li>
                <li>Admission Date: Today</li>
                <li>Status: Active</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || enrollStudent.isPending}>
            {enrollStudent.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enrolling...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Enroll Student
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
