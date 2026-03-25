import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

// ==================== Schema ====================

const step1Schema = z.object({
  studentName: z.string().min(1, 'Student name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Gender is required',
  }),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
})

const step2Schema = z.object({
  applyingForClass: z.string().min(1, 'Class is required'),
  previousSchool: z.string().min(1, 'Previous school is required'),
  previousClass: z.string().min(1, 'Previous class is required'),
})

const step3Schema = z.object({
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  guardianPhone: z.string().min(10, 'Please enter a valid phone number'),
  guardianEmail: z.string().email('Please enter a valid email'),
})

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema)

type FormData = z.infer<typeof fullSchema>

// ==================== Props ====================

interface EmbeddedAdmissionFormProps {
  /** Primary color from theme (e.g. '#1e40af') */
  primaryColor?: string
  /** Accent color from theme (e.g. '#f59e0b') */
  accentColor?: string
}

// ==================== Constants ====================

const STEPS = [
  { id: 'student', title: 'Student Details', schema: step1Schema },
  { id: 'academic', title: 'Academic Info', schema: step2Schema },
  { id: 'Parent', title: 'Parent / Guardian', schema: step3Schema },
] as const

const CLASS_OPTIONS = [
  'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
  'Class 11', 'Class 12',
]

const defaultFormValues: FormData = {
  studentName: '',
  dateOfBirth: '',
  gender: 'male',
  email: '',
  phone: '',
  applyingForClass: '',
  previousSchool: '',
  previousClass: '',
  fatherName: '',
  motherName: '',
  guardianPhone: '',
  guardianEmail: '',
}

// ==================== Component ====================

export function EmbeddedAdmissionForm({
  primaryColor = '#1e40af',
  accentColor = '#f59e0b',
}: EmbeddedAdmissionFormProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [applicationNumber, setApplicationNumber] = useState('')
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: defaultFormValues,
    mode: 'onTouched',
  })

  const { register, formState: { errors }, trigger, setValue, watch, reset } = form

  // Validate current step fields before proceeding
  const validateCurrentStep = async (): Promise<boolean> => {
    const stepSchema = STEPS[currentStep].schema
    const fieldsToValidate = Object.keys(stepSchema.shape) as (keyof FormData)[]
    const isValid = await trigger(fieldsToValidate)
    return isValid
  }

  const handleNext = async () => {
    const valid = await validateCurrentStep()
    if (valid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = async () => {
    // Validate all fields
    const valid = await trigger()
    if (!valid) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields correctly.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const values = form.getValues()
      const response = await fetch('/api/public/admissions/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentName: values.studentName,
          dateOfBirth: values.dateOfBirth,
          gender: values.gender,
          email: values.email,
          phone: values.phone,
          applyingForClass: values.applyingForClass,
          previousSchool: values.previousSchool,
          previousClass: values.previousClass,
          previousMarks: 0,
          fatherName: values.fatherName,
          motherName: values.motherName,
          guardianPhone: values.guardianPhone,
          guardianEmail: values.guardianEmail,
          source: 'website',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to submit application')
      }

      const result = await response.json()
      setApplicationNumber(result.data?.applicationNumber || result.applicationNumber || '')
      setSubmitted(true)
    } catch (err) {
      toast({
        title: 'Submission Failed',
        description: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    reset(defaultFormValues)
    setCurrentStep(0)
    setSubmitted(false)
    setApplicationNumber('')
  }

  // ==================== Success State ====================

  if (submitted) {
    return (
      <div className="rounded-xl border bg-green-50 p-8 text-center">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <CheckCircle className="h-10 w-10" style={{ color: primaryColor }} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Application Submitted!</h3>
        {applicationNumber && (
          <div className="rounded-lg bg-white border p-4 my-4 inline-block">
            <p className="text-sm text-gray-500">Your Reference Number</p>
            <p className="text-2xl font-bold tracking-wider" style={{ color: primaryColor }}>
              {applicationNumber}
            </p>
          </div>
        )}
        <p className="text-sm text-gray-600 mt-2 mb-6">
          Please save this reference number. You will receive a confirmation email shortly.
        </p>
        <Button variant="outline" onClick={handleReset}>
          Submit Another Application
        </Button>
      </div>
    )
  }

  // ==================== Step Indicator ====================

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentStep
        const isCurrent = index === currentStep

        return (
          <div key={step.id} className="flex items-center flex-1">
            {index > 0 && (
              <div
                className="flex-1 h-0.5 mx-2"
                style={{
                  backgroundColor: isCompleted ? primaryColor : '#e5e7eb',
                }}
              />
            )}
            <div className="flex flex-col items-center">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: isCompleted || isCurrent ? primaryColor : '#e5e7eb',
                  color: isCompleted || isCurrent ? '#ffffff' : '#6b7280',
                }}
              >
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className="text-xs mt-1 font-medium hidden sm:block"
                style={{ color: isCurrent ? primaryColor : '#6b7280' }}
              >
                {step.title}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2"
                style={{
                  backgroundColor: isCompleted ? primaryColor : '#e5e7eb',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )

  // ==================== Form Steps ====================

  return (
    <div className="rounded-xl border bg-white p-6 sm:p-8">
      <StepIndicator />

      {/* Step 1: Student Details */}
      {currentStep === 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="emb-studentName">
                Student Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="emb-studentName"
                placeholder="Full name of the student"
                {...register('studentName')}
              />
              {errors.studentName && (
                <p className="text-sm text-red-600">{errors.studentName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emb-dateOfBirth">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="emb-dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="emb-gender">
                Gender <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch('gender')}
                onValueChange={(v) => setValue('gender', v as 'male' | 'female' | 'other', { shouldValidate: true })}
              >
                <SelectTrigger id="emb-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emb-email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="emb-email"
                type="email"
                placeholder="student@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="emb-phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="emb-phone"
              type="tel"
              placeholder="10-digit phone number"
              {...register('phone')}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Academic Info */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="emb-applyingForClass">
              Applying for Class <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('applyingForClass')}
              onValueChange={(v) => setValue('applyingForClass', v, { shouldValidate: true })}
            >
              <SelectTrigger id="emb-applyingForClass">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {CLASS_OPTIONS.map((cls) => (
                  <SelectItem key={cls} value={cls}>
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.applyingForClass && (
              <p className="text-sm text-red-600">{errors.applyingForClass.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="emb-previousSchool">
              Previous School <span className="text-red-500">*</span>
            </Label>
            <Input
              id="emb-previousSchool"
              placeholder="Name of previous school"
              {...register('previousSchool')}
            />
            {errors.previousSchool && (
              <p className="text-sm text-red-600">{errors.previousSchool.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="emb-previousClass">
              Previous Class <span className="text-red-500">*</span>
            </Label>
            <Input
              id="emb-previousClass"
              placeholder="e.g., Class 5"
              {...register('previousClass')}
            />
            {errors.previousClass && (
              <p className="text-sm text-red-600">{errors.previousClass.message}</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Parent / Guardian */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="emb-fatherName">
                Father's Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="emb-fatherName"
                placeholder="Father's full name"
                {...register('fatherName')}
              />
              {errors.fatherName && (
                <p className="text-sm text-red-600">{errors.fatherName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emb-motherName">
                Mother's Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="emb-motherName"
                placeholder="Mother's full name"
                {...register('motherName')}
              />
              {errors.motherName && (
                <p className="text-sm text-red-600">{errors.motherName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="emb-guardianPhone">
                Guardian Phone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="emb-guardianPhone"
                type="tel"
                placeholder="10-digit phone number"
                {...register('guardianPhone')}
              />
              {errors.guardianPhone && (
                <p className="text-sm text-red-600">{errors.guardianPhone.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emb-guardianEmail">
                Guardian Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="emb-guardianEmail"
                type="email"
                placeholder="guardian@example.com"
                {...register('guardianEmail')}
              />
              {errors.guardianEmail && (
                <p className="text-sm text-red-600">{errors.guardianEmail.message}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep === STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{ backgroundColor: primaryColor }}
            className="text-white hover:opacity-90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            style={{ backgroundColor: primaryColor }}
            className="text-white hover:opacity-90"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
