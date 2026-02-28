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
import { CLASSES } from '../../types/admission.types'
import type { ApplicationFormData } from './types'

interface AcademicInfoStepProps {
  form: UseFormReturn<ApplicationFormData>
}

export function AcademicInfoStep({ form }: AcademicInfoStepProps) {
  const { register, formState: { errors }, setValue, watch } = form
  const applyingForClass = watch('applyingForClass')

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="applyingForClass">Applying for Class *</Label>
          <Select
            value={applyingForClass}
            onValueChange={(v) => setValue('applyingForClass', v)}
          >
            <SelectTrigger id="applyingForClass">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {CLASSES.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.applyingForClass && (
            <p className="text-sm text-destructive">{errors.applyingForClass.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-sm text-muted-foreground">Previous School Details</h3>

        <div className="space-y-2">
          <Label htmlFor="previousSchool">Previous School Name *</Label>
          <Input
            id="previousSchool"
            placeholder="Enter previous school name"
            {...register('previousSchool')}
          />
          {errors.previousSchool && (
            <p className="text-sm text-destructive">{errors.previousSchool.message}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="previousClass">Previous Class *</Label>
            <Input
              id="previousClass"
              placeholder="e.g., Class 5, Pre-School"
              {...register('previousClass')}
            />
            {errors.previousClass && (
              <p className="text-sm text-destructive">{errors.previousClass.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="previousMarks">Previous Marks (%) *</Label>
            <Input
              id="previousMarks"
              type="number"
              min="0"
              max="100"
              placeholder="e.g., 85"
              {...register('previousMarks', { valueAsNumber: true })}
            />
            {errors.previousMarks && (
              <p className="text-sm text-destructive">{errors.previousMarks.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
