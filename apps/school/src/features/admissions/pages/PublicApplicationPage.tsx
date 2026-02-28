import { useState } from 'react'
import { CheckCircle, ArrowLeft, ArrowRight, GraduationCap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useSubmitPublicApplication } from '../hooks/useAdmissions'
import { CLASSES } from '../types/admission.types'
import type { CreateApplicationRequest } from '../types/admission.types'

type FormAddress = CreateApplicationRequest['address']

interface FormData {
  studentName: string
  dateOfBirth: string
  gender: '' | 'male' | 'female'
  email: string
  phone: string
  address: FormAddress
  applyingForClass: string
  previousSchool: string
  previousClass: string
  previousMarks: string
  fatherName: string
  motherName: string
  guardianPhone: string
  guardianEmail: string
  guardianOccupation: string
}

interface FormErrors {
  [key: string]: string
}

const STEPS = [
  { id: 'student', title: 'Student Info', description: 'Basic student details' },
  { id: 'academic', title: 'Academic Info', description: 'School and class details' },
  { id: 'parent', title: 'Parent Info', description: 'Guardian information' },
  { id: 'review', title: 'Review & Submit', description: 'Verify and submit' },
]

const initialFormData: FormData = {
  studentName: '',
  dateOfBirth: '',
  gender: '',
  email: '',
  phone: '',
  address: { street: '', city: '', state: '', pincode: '' },
  applyingForClass: '',
  previousSchool: '',
  previousClass: '',
  previousMarks: '',
  fatherName: '',
  motherName: '',
  guardianPhone: '',
  guardianEmail: '',
  guardianOccupation: '',
}

function validateStep(step: number, data: FormData): FormErrors {
  const errors: FormErrors = {}

  switch (step) {
    case 0: {
      if (!data.studentName.trim()) errors.studentName = 'Student name is required'
      if (!data.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
      if (!data.gender) errors.gender = 'Gender is required'
      if (!data.email.trim()) {
        errors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Please enter a valid email'
      }
      if (!data.phone.trim()) {
        errors.phone = 'Phone number is required'
      } else if (!/^\d{10}$/.test(data.phone.replace(/\s/g, ''))) {
        errors.phone = 'Please enter a valid 10-digit phone number'
      }
      if (!data.address.street.trim()) errors['address.street'] = 'Street is required'
      if (!data.address.city.trim()) errors['address.city'] = 'City is required'
      if (!data.address.state.trim()) errors['address.state'] = 'State is required'
      if (!data.address.pincode.trim()) {
        errors['address.pincode'] = 'Pincode is required'
      } else if (!/^\d{6}$/.test(data.address.pincode)) {
        errors['address.pincode'] = 'Please enter a valid 6-digit pincode'
      }
      break
    }
    case 1: {
      if (!data.applyingForClass) errors.applyingForClass = 'Class is required'
      if (!data.previousSchool.trim()) errors.previousSchool = 'Previous school is required'
      if (!data.previousClass.trim()) errors.previousClass = 'Previous class is required'
      if (!data.previousMarks.trim()) {
        errors.previousMarks = 'Previous marks are required'
      } else {
        const marks = parseFloat(data.previousMarks)
        if (isNaN(marks) || marks < 0 || marks > 100) {
          errors.previousMarks = 'Marks must be between 0 and 100'
        }
      }
      break
    }
    case 2: {
      if (!data.fatherName.trim()) errors.fatherName = "Father's name is required"
      if (!data.motherName.trim()) errors.motherName = "Mother's name is required"
      if (!data.guardianPhone.trim()) {
        errors.guardianPhone = 'Guardian phone is required'
      } else if (!/^\d{10}$/.test(data.guardianPhone.replace(/\s/g, ''))) {
        errors.guardianPhone = 'Please enter a valid 10-digit phone number'
      }
      if (!data.guardianEmail.trim()) {
        errors.guardianEmail = 'Guardian email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.guardianEmail)) {
        errors.guardianEmail = 'Please enter a valid email'
      }
      if (!data.guardianOccupation.trim()) errors.guardianOccupation = 'Occupation is required'
      break
    }
  }

  return errors
}

export function PublicApplicationPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<{
    applicationNumber: string
    message: string
  } | null>(null)

  const submitApplication = useSubmitPublicApplication()

  const updateField = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1] as keyof FormAddress
      setFormData((prev) => ({
        ...prev,
        address: { ...prev.address, [addressField]: value },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
    // Clear the error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleNext = () => {
    const stepErrors = validateStep(currentStep, formData)
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors)
      return
    }
    setErrors({})
    setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  const handlePrevious = () => {
    setErrors({})
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = () => {
    const request: CreateApplicationRequest = {
      studentName: formData.studentName,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender as 'male' | 'female',
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      applyingForClass: formData.applyingForClass,
      previousSchool: formData.previousSchool,
      previousClass: formData.previousClass,
      previousMarks: parseFloat(formData.previousMarks),
      fatherName: formData.fatherName,
      motherName: formData.motherName,
      guardianPhone: formData.guardianPhone,
      guardianEmail: formData.guardianEmail,
      guardianOccupation: formData.guardianOccupation,
    }

    submitApplication.mutate({ ...request, source: 'website' }, {
      onSuccess: (response) => {
        setSubmitted(true)
        setSubmissionResult(response.data)
      },
    })
  }

  // Success Screen
  if (submitted && submissionResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b py-4 px-6 shadow-sm">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">PaperBook School</h1>
              <p className="text-sm text-muted-foreground">Online Admission</p>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Application Submitted!</CardTitle>
              <CardDescription>{submissionResult.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Your Application Number</p>
                <p className="text-2xl font-bold tracking-wider mt-1">
                  {submissionResult.applicationNumber}
                </p>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Please save this application number for future reference. You will also receive a
                confirmation email with the details.
              </p>
            </CardContent>
            <CardFooter className="justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false)
                  setSubmissionResult(null)
                  setFormData(initialFormData)
                  setCurrentStep(0)
                  setErrors({})
                }}
              >
                Submit Another Application
              </Button>
            </CardFooter>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header / Branding */}
      <header className="bg-white border-b py-4 px-6 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">PaperBook School</h1>
            <p className="text-sm text-muted-foreground">Online Admission</p>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-6">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Step Indicator */}
          <nav aria-label="Progress" className="mb-8">
            <ol className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const isCompleted = index < currentStep
                const isCurrent = index === currentStep

                return (
                  <li key={step.id} className="flex flex-col items-center flex-1">
                    <div className="flex items-center w-full">
                      {index > 0 && (
                        <div
                          className={`flex-1 h-0.5 ${
                            isCompleted ? 'bg-primary' : 'bg-border'
                          }`}
                        />
                      )}
                      <div
                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                          isCompleted
                            ? 'bg-primary border-primary'
                            : isCurrent
                              ? 'border-primary bg-background'
                              : 'border-border bg-background'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-primary-foreground" />
                        ) : (
                          <span
                            className={`text-sm font-medium ${
                              isCurrent ? 'text-primary' : 'text-muted-foreground'
                            }`}
                          >
                            {index + 1}
                          </span>
                        )}
                      </div>
                      {index < STEPS.length - 1 && (
                        <div
                          className={`flex-1 h-0.5 ${
                            isCompleted ? 'bg-primary' : 'bg-border'
                          }`}
                        />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className={`text-xs font-medium ${
                          isCurrent || isCompleted ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {step.description}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </nav>

          {/* Form Card */}
          <Card>
            <CardHeader>
              <CardTitle>{STEPS[currentStep].title}</CardTitle>
              <CardDescription>{STEPS[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent>
              {currentStep === 0 && (
                <StudentInfoStep
                  formData={formData}
                  errors={errors}
                  onFieldChange={updateField}
                />
              )}
              {currentStep === 1 && (
                <AcademicInfoStep
                  formData={formData}
                  errors={errors}
                  onFieldChange={updateField}
                />
              )}
              {currentStep === 2 && (
                <ParentInfoStep
                  formData={formData}
                  errors={errors}
                  onFieldChange={updateField}
                />
              )}
              {currentStep === 3 && <ReviewStep formData={formData} />}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
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
                <Button onClick={handleSubmit} disabled={submitApplication.isPending}>
                  {submitApplication.isPending ? 'Submitting...' : 'Submit Application'}
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 px-6 text-center">
        <p className="text-sm text-muted-foreground">
          PaperBook School - Online Admission Portal
        </p>
      </footer>
    </div>
  )
}

// ==================== Step Components ====================

interface StepProps {
  formData: FormData
  errors: FormErrors
  onFieldChange: (field: string, value: string) => void
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-red-600 mt-1">{message}</p>
}

function StudentInfoStep({ formData, errors, onFieldChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="studentName">
            Student Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="studentName"
            placeholder="Enter full name"
            value={formData.studentName}
            onChange={(e) => onFieldChange('studentName', e.target.value)}
          />
          <FieldError message={errors.studentName} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => onFieldChange('dateOfBirth', e.target.value)}
          />
          <FieldError message={errors.dateOfBirth} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">
            Gender <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.gender} onValueChange={(v) => onFieldChange('gender', v)}>
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          <FieldError message={errors.gender} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="student@example.com"
            value={formData.email}
            onChange={(e) => onFieldChange('email', e.target.value)}
          />
          <FieldError message={errors.email} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="10-digit phone number"
          value={formData.phone}
          onChange={(e) => onFieldChange('phone', e.target.value)}
        />
        <FieldError message={errors.phone} />
      </div>

      <Separator />

      <h3 className="text-sm font-semibold">Address</h3>

      <div className="space-y-2">
        <Label htmlFor="address-street">
          Street <span className="text-red-500">*</span>
        </Label>
        <Input
          id="address-street"
          placeholder="Street address"
          value={formData.address.street}
          onChange={(e) => onFieldChange('address.street', e.target.value)}
        />
        <FieldError message={errors['address.street']} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address-city">
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address-city"
            placeholder="City"
            value={formData.address.city}
            onChange={(e) => onFieldChange('address.city', e.target.value)}
          />
          <FieldError message={errors['address.city']} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address-state">
            State <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address-state"
            placeholder="State"
            value={formData.address.state}
            onChange={(e) => onFieldChange('address.state', e.target.value)}
          />
          <FieldError message={errors['address.state']} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address-pincode">
            Pincode <span className="text-red-500">*</span>
          </Label>
          <Input
            id="address-pincode"
            placeholder="6-digit pincode"
            value={formData.address.pincode}
            onChange={(e) => onFieldChange('address.pincode', e.target.value)}
          />
          <FieldError message={errors['address.pincode']} />
        </div>
      </div>
    </div>
  )
}

function AcademicInfoStep({ formData, errors, onFieldChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="applyingForClass">
          Applying for Class <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.applyingForClass}
          onValueChange={(v) => onFieldChange('applyingForClass', v)}
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
        <FieldError message={errors.applyingForClass} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="previousSchool">
          Previous School <span className="text-red-500">*</span>
        </Label>
        <Input
          id="previousSchool"
          placeholder="Name of previous school"
          value={formData.previousSchool}
          onChange={(e) => onFieldChange('previousSchool', e.target.value)}
        />
        <FieldError message={errors.previousSchool} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="previousClass">
            Previous Class <span className="text-red-500">*</span>
          </Label>
          <Input
            id="previousClass"
            placeholder="e.g., Class 5"
            value={formData.previousClass}
            onChange={(e) => onFieldChange('previousClass', e.target.value)}
          />
          <FieldError message={errors.previousClass} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="previousMarks">
            Previous Marks (%) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="previousMarks"
            type="number"
            placeholder="e.g., 85"
            min={0}
            max={100}
            value={formData.previousMarks}
            onChange={(e) => onFieldChange('previousMarks', e.target.value)}
          />
          <FieldError message={errors.previousMarks} />
        </div>
      </div>
    </div>
  )
}

function ParentInfoStep({ formData, errors, onFieldChange }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fatherName">
            Father's Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fatherName"
            placeholder="Father's full name"
            value={formData.fatherName}
            onChange={(e) => onFieldChange('fatherName', e.target.value)}
          />
          <FieldError message={errors.fatherName} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="motherName">
            Mother's Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="motherName"
            placeholder="Mother's full name"
            value={formData.motherName}
            onChange={(e) => onFieldChange('motherName', e.target.value)}
          />
          <FieldError message={errors.motherName} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="guardianPhone">
            Guardian Phone <span className="text-red-500">*</span>
          </Label>
          <Input
            id="guardianPhone"
            type="tel"
            placeholder="10-digit phone number"
            value={formData.guardianPhone}
            onChange={(e) => onFieldChange('guardianPhone', e.target.value)}
          />
          <FieldError message={errors.guardianPhone} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="guardianEmail">
            Guardian Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="guardianEmail"
            type="email"
            placeholder="guardian@example.com"
            value={formData.guardianEmail}
            onChange={(e) => onFieldChange('guardianEmail', e.target.value)}
          />
          <FieldError message={errors.guardianEmail} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="guardianOccupation">
          Guardian Occupation <span className="text-red-500">*</span>
        </Label>
        <Input
          id="guardianOccupation"
          placeholder="e.g., Engineer, Doctor, Business"
          value={formData.guardianOccupation}
          onChange={(e) => onFieldChange('guardianOccupation', e.target.value)}
        />
        <FieldError message={errors.guardianOccupation} />
      </div>
    </div>
  )
}

function ReviewStep({ formData }: { formData: FormData }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">Student Information</h3>
        <div className="rounded-lg border p-4 space-y-2">
          <ReviewField label="Name" value={formData.studentName} />
          <ReviewField label="Date of Birth" value={formData.dateOfBirth} />
          <ReviewField label="Gender" value={formData.gender === 'male' ? 'Male' : 'Female'} />
          <ReviewField label="Email" value={formData.email} />
          <ReviewField label="Phone" value={formData.phone} />
          <ReviewField
            label="Address"
            value={`${formData.address.street}, ${formData.address.city}, ${formData.address.state} - ${formData.address.pincode}`}
          />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-3">Academic Information</h3>
        <div className="rounded-lg border p-4 space-y-2">
          <ReviewField label="Applying for Class" value={formData.applyingForClass} />
          <ReviewField label="Previous School" value={formData.previousSchool} />
          <ReviewField label="Previous Class" value={formData.previousClass} />
          <ReviewField label="Previous Marks" value={`${formData.previousMarks}%`} />
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="text-sm font-semibold mb-3">Parent / Guardian Information</h3>
        <div className="rounded-lg border p-4 space-y-2">
          <ReviewField label="Father's Name" value={formData.fatherName} />
          <ReviewField label="Mother's Name" value={formData.motherName} />
          <ReviewField label="Guardian Phone" value={formData.guardianPhone} />
          <ReviewField label="Guardian Email" value={formData.guardianEmail} />
          <ReviewField label="Occupation" value={formData.guardianOccupation} />
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4">
        <p className="text-sm text-muted-foreground">
          Please review all the information above before submitting. Once submitted, you will
          receive an application number that can be used to track your application status.
        </p>
      </div>
    </div>
  )
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right max-w-[60%]">{value}</span>
    </div>
  )
}
