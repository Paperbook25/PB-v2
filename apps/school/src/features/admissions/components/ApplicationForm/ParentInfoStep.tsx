import { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ApplicationFormData } from './types'

interface ParentInfoStepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function ParentInfoStep({ form }: ParentInfoStepProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fatherName">Father's Name *</Label>
          <Input
            id="fatherName"
            placeholder="Enter father's full name"
            {...register('fatherName')}
          />
          {errors.fatherName && (
            <p className="text-sm text-destructive">{errors.fatherName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="motherName">Mother's Name *</Label>
          <Input
            id="motherName"
            placeholder="Enter mother's full name"
            {...register('motherName')}
          />
          {errors.motherName && (
            <p className="text-sm text-destructive">{errors.motherName.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground">Guardian Contact Information</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="guardianPhone">Guardian Phone *</Label>
            <Input
              id="guardianPhone"
              placeholder="+91 9876543210"
              {...register('guardianPhone')}
            />
            {errors.guardianPhone && (
              <p className="text-sm text-destructive">{errors.guardianPhone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardianEmail">Guardian Email *</Label>
            <Input
              id="guardianEmail"
              type="email"
              placeholder="guardian@email.com"
              {...register('guardianEmail')}
            />
            {errors.guardianEmail && (
              <p className="text-sm text-destructive">{errors.guardianEmail.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="guardianOccupation">Guardian Occupation *</Label>
          <Input
            id="guardianOccupation"
            placeholder="e.g., Software Engineer, Doctor, Business Owner"
            {...register('guardianOccupation')}
          />
          {errors.guardianOccupation && (
            <p className="text-sm text-destructive">{errors.guardianOccupation.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
