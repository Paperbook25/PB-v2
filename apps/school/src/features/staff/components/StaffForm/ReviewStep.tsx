import type { UseFormReturn } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Briefcase, CreditCard, MapPin, Phone, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { StaffFormData } from './types'

interface ReviewStepProps {
  form: UseFormReturn<StaffFormData>
}

function InfoRow({ label, value }: { label: string; value: string | number | string[] }) {
  const displayValue = Array.isArray(value) ? value.join(', ') : value
  return (
    <div className="flex justify-between py-2 border-b last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{displayValue || '-'}</span>
    </div>
  )
}

export function ReviewStep({ form }: ReviewStepProps) {
  const values = form.getValues()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Review & Confirm</h3>
        <p className="text-sm text-muted-foreground">Please review the details before submitting</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <InfoRow label="Name" value={values.name} />
            <InfoRow label="Email" value={values.email} />
            <InfoRow label="Phone" value={values.phone} />
            <InfoRow label="Date of Birth" value={values.dateOfBirth} />
            <InfoRow label="Gender" value={values.gender === 'male' ? 'Male' : 'Female'} />
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <InfoRow label="Street" value={values.address.street} />
            <InfoRow label="City" value={values.address.city} />
            <InfoRow label="State" value={values.address.state} />
            <InfoRow label="Pincode" value={values.address.pincode} />
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <InfoRow label="Name" value={values.emergencyContact.name} />
            <InfoRow label="Phone" value={values.emergencyContact.phone} />
            <InfoRow label="Relationship" value={values.emergencyContact.relationship} />
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <InfoRow label="Department" value={values.department} />
            <InfoRow label="Designation" value={values.designation} />
            <InfoRow label="Joining Date" value={values.joiningDate} />
            <InfoRow label="Specialization" value={values.specialization} />
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Qualifications</span>
              <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                {values.qualification.map((qual) => (
                  <Badge key={qual} variant="secondary" className="text-xs">
                    {qual}
                  </Badge>
                ))}
              </div>
            </div>
            <InfoRow label="Monthly Salary" value={formatCurrency(values.salary)} />
          </CardContent>
        </Card>

        {/* Bank Details */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <InfoRow label="Account Holder" value={values.bankDetails.accountHolderName} />
              <InfoRow label="Account Number" value={values.bankDetails.accountNumber} />
              <InfoRow label="Bank Name" value={values.bankDetails.bankName} />
              <InfoRow label="IFSC Code" value={values.bankDetails.ifscCode} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
