import { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ApplicationFormData } from './types'

interface PersonalInfoStepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function PersonalInfoStep({ form }: PersonalInfoStepProps) {
  const { register, formState: { errors }, setValue, watch } = form
  const gender = watch('gender')

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="studentName">Student's Full Name *</Label>
          <Input
            id="studentName"
            placeholder="Enter student's full name"
            {...register('studentName')}
          />
          {errors.studentName && (
            <p className="text-sm text-destructive">{errors.studentName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register('dateOfBirth')}
          />
          {errors.dateOfBirth && (
            <p className="text-sm text-destructive">{errors.dateOfBirth.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select value={gender} onValueChange={(v) => setValue('gender', v as 'male' | 'female')}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && (
            <p className="text-sm text-destructive">{errors.gender.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="student@email.com"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            placeholder="+91 9876543210"
            {...register('phone')}
          />
          {errors.phone && (
            <p className="text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground">Address</h3>

        <div className="space-y-2">
          <Label htmlFor="street">Street Address *</Label>
          <Input
            id="street"
            placeholder="House no., Street name, Area"
            {...register('address.street')}
          />
          {errors.address?.street && (
            <p className="text-sm text-destructive">{errors.address.street.message}</p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="City"
              {...register('address.city')}
            />
            {errors.address?.city && (
              <p className="text-sm text-destructive">{errors.address.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              placeholder="State"
              {...register('address.state')}
            />
            {errors.address?.state && (
              <p className="text-sm text-destructive">{errors.address.state.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode *</Label>
            <Input
              id="pincode"
              placeholder="6-digit pincode"
              {...register('address.pincode')}
            />
            {errors.address?.pincode && (
              <p className="text-sm text-destructive">{errors.address.pincode.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
