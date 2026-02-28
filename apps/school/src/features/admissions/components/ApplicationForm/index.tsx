import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { PersonalInfoStep } from './PersonalInfoStep'
import { AcademicInfoStep } from './AcademicInfoStep'
import { ParentInfoStep } from './ParentInfoStep'
import { ReviewStep } from './ReviewStep'
import {
  applicationFormSchema,
  ApplicationFormData,
  FORM_STEPS,
  FormStepId,
  defaultFormValues,
  stepValidationFields,
} from './types'

interface ApplicationFormProps {
  onSubmit: (data: ApplicationFormData) => void
  isSubmitting?: boolean
}

export function ApplicationForm({ onSubmit, isSubmitting }: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationFormSchema),
    defaultValues: defaultFormValues,
    mode: 'onChange',
  })

  const currentStepId = FORM_STEPS[currentStep].id

  const validateCurrentStep = async () => {
    const fields = stepValidationFields[currentStepId]
    if (fields.length === 0) return true

    const result = await form.trigger(fields as any)
    return result
  }

  const handleNext = async () => {
    const isValid = await validateCurrentStep()
    if (isValid && currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data)
  })

  const renderStep = () => {
    switch (currentStepId) {
      case 'personal':
        return <PersonalInfoStep form={form} />
      case 'academic':
        return <AcademicInfoStep form={form} />
      case 'parent':
        return <ParentInfoStep form={form} />
      case 'review':
        return <ReviewStep form={form} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {FORM_STEPS.map((step, index) => (
            <li
              key={step.id}
              className={cn('relative flex-1', index !== FORM_STEPS.length - 1 && 'pr-8 sm:pr-20')}
            >
              {index < currentStep ? (
                // Completed step
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-primary" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(index)}
                    className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary hover:bg-primary/90"
                  >
                    <Check className="h-5 w-5 text-primary-foreground" />
                    <span className="sr-only">{step.title}</span>
                  </button>
                </>
              ) : index === currentStep ? (
                // Current step
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-border" />
                  </div>
                  <div
                    className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background"
                    aria-current="step"
                  >
                    <span className="text-sm font-medium text-primary">{index + 1}</span>
                    <span className="sr-only">{step.title}</span>
                  </div>
                </>
              ) : (
                // Future step
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-border" />
                  </div>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background">
                    <span className="text-sm font-medium text-muted-foreground">{index + 1}</span>
                    <span className="sr-only">{step.title}</span>
                  </div>
                </>
              )}

              {/* Step label (hidden on mobile) */}
              <div className="hidden sm:block absolute top-10 left-0 w-max">
                <p className={cn('text-sm font-medium', index <= currentStep ? 'text-primary' : 'text-muted-foreground')}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Mobile step title */}
      <div className="sm:hidden text-center pt-4">
        <p className="text-sm font-medium">{FORM_STEPS[currentStep].title}</p>
        <p className="text-xs text-muted-foreground">{FORM_STEPS[currentStep].description}</p>
      </div>

      {/* Form Content */}
      <Card className="mt-16 sm:mt-20">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            {renderStep()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep === FORM_STEPS.length - 1 ? (
                <Button type="submit" disabled={isSubmitting}>
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
                <Button type="button" onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
