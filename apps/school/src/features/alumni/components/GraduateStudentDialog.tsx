import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useGraduateStudent } from '../hooks/useAlumni'
import { useToast } from '@/hooks/use-toast'
import type { EligibleForGraduation } from '../api/alumni.api'

interface GraduateStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: EligibleForGraduation | null
}

export function GraduateStudentDialog({
  open,
  onOpenChange,
  student,
}: GraduateStudentDialogProps) {
  const graduateStudent = useGraduateStudent()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    batchYear: String(new Date().getFullYear()),
    occupation: '',
    company: '',
    currentCity: '',
    currentCountry: 'India',
  })

  const handleGraduate = async () => {
    if (!student) return

    try {
      await graduateStudent.mutateAsync({
        studentId: student.id,
        ...formData,
      })
      toast({ title: `${student.name} graduated successfully` })
      onOpenChange(false)
      // Reset form
      setFormData({
        batchYear: String(new Date().getFullYear()),
        occupation: '',
        company: '',
        currentCity: '',
        currentCountry: 'India',
      })
    } catch {
      toast({ title: 'Failed to graduate student', variant: 'destructive' })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!student) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Graduate Student</DialogTitle>
          <DialogDescription>
            This will update the student's status to graduated and create an alumni record.
          </DialogDescription>
        </DialogHeader>

        {/* Student Info */}
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <Avatar className="h-12 w-12">
            <AvatarImage src={student.photoUrl} alt={student.name} />
            <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{student.name}</p>
            <p className="text-sm text-muted-foreground">
              {student.class} - {student.section} | Roll: {student.rollNumber} |{' '}
              {student.admissionNumber}
            </p>
          </div>
        </div>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Batch Year</Label>
              <Input
                type="number"
                value={formData.batchYear}
                onChange={(e) => setFormData({ ...formData, batchYear: e.target.value })}
              />
            </div>
            <div>
              <Label>Current Country</Label>
              <Input
                value={formData.currentCountry}
                onChange={(e) => setFormData({ ...formData, currentCountry: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Current City (Optional)</Label>
            <Input
              value={formData.currentCity}
              onChange={(e) => setFormData({ ...formData, currentCity: e.target.value })}
              placeholder="e.g., Bangalore"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Occupation (Optional)</Label>
              <Input
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                placeholder="e.g., Engineering Student"
              />
            </div>
            <div>
              <Label>Company/College (Optional)</Label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g., IIT Delhi"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleGraduate} disabled={graduateStudent.isPending}>
            {graduateStudent.isPending ? 'Graduating...' : 'Graduate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
