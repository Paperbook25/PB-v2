import { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, GraduationCap, Users } from 'lucide-react'
import type { ApplicationFormData } from './types'

interface ReviewStepProps {
  form: UseFormReturn<ApplicationFormData>
}

function InfoItem({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || '-'}</p>
    </div>
  )
}

export function ReviewStep({ form }: ReviewStepProps) {
  const data = form.getValues()

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Please review the information below before submitting the application.
      </p>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <InfoItem label="Student Name" value={data.studentName} />
          <InfoItem label="Date of Birth" value={data.dateOfBirth} />
          <InfoItem label="Gender" value={data.gender === 'male' ? 'Male' : 'Female'} />
          <InfoItem label="Email" value={data.email} />
          <InfoItem label="Phone" value={data.phone} />
          <InfoItem
            label="Address"
            value={`${data.address.street}, ${data.address.city}, ${data.address.state} - ${data.address.pincode}`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-4 w-4" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <InfoItem label="Applying For" value={data.applyingForClass} />
          <InfoItem label="Previous School" value={data.previousSchool} />
          <InfoItem label="Previous Class" value={data.previousClass} />
          <InfoItem label="Previous Marks" value={data.previousMarks ? `${data.previousMarks}%` : undefined} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Parent/Guardian Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <InfoItem label="Father's Name" value={data.fatherName} />
          <InfoItem label="Mother's Name" value={data.motherName} />
          <InfoItem label="Guardian Phone" value={data.guardianPhone} />
          <InfoItem label="Guardian Email" value={data.guardianEmail} />
          <InfoItem label="Occupation" value={data.guardianOccupation} />
        </CardContent>
      </Card>
    </div>
  )
}
