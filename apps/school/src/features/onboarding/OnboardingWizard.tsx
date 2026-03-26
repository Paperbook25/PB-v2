import { useState, useEffect } from 'react'
import { X, Check, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
import { apiGet, apiPost } from '@/lib/api-client'
import { WelcomeStep } from './steps/WelcomeStep'
import { SchoolProfileStep } from './steps/SchoolProfileStep'
import { AcademicStructureStep } from './steps/AcademicStructureStep'
import { FeeStructureStep } from './steps/FeeStructureStep'
import { InviteTeamStep } from './steps/InviteTeamStep'
import { WebsiteSetupStep } from './steps/WebsiteSetupStep'

interface OnboardingStatus {
  onboardingCompleted: boolean
  onboardingStep: number
  schoolProfile: {
    name: string
    logo: string | null
    city: string | null
    state: string | null
    phone: string | null
    email: string | null
    affiliationBoard: string | null
  }
}

const STEPS = [
  { title: 'Welcome', icon: Sparkles },
  { title: 'School Profile', icon: Sparkles },
  { title: 'Academic Structure', icon: Sparkles },
  { title: 'Fee Structure', icon: Sparkles },
  { title: 'Invite Team', icon: Sparkles },
  { title: 'Website', icon: Sparkles },
]

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [status, setStatus] = useState<OnboardingStatus | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    apiGet<OnboardingStatus>('/api/onboarding/status')
      .then((data) => {
        if (data.onboardingCompleted) {
          onComplete()
          return
        }
        setStatus(data)
        setCurrentStep(data.onboardingStep)
        setVisible(true)
      })
      .catch(() => {
        // If onboarding endpoint fails, skip wizard
        onComplete()
      })
      .finally(() => setLoading(false))
  }, [onComplete])

  const handleNext = async () => {
    try {
      await apiPost('/api/onboarding/complete-step', { step: currentStep })
    } catch {
      // Continue anyway
    }

    if (currentStep >= 5) {
      setVisible(false)
      onComplete()
      return
    }
    setCurrentStep((s) => s + 1)
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1)
  }

  const handleSkip = async () => {
    try {
      await apiPost('/api/onboarding/skip')
    } catch {
      // Continue anyway
    }
    setVisible(false)
    onComplete()
  }

  if (loading || !visible || !status) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with progress */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Setup Wizard</h2>
              <p className="text-xs text-gray-500">Step {currentStep + 1} of {STEPS.length}</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Skip setup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-indigo-600 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1.5 py-3 px-6">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full transition-colors ${
                i < currentStep ? 'bg-indigo-600' :
                i === currentStep ? 'bg-indigo-600' :
                'bg-gray-200'
              }`} />
              {i === currentStep && (
                <span className="text-xs font-medium text-gray-700">{s.title}</span>
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {currentStep === 0 && <WelcomeStep schoolName={status.schoolProfile.name} />}
          {currentStep === 1 && <SchoolProfileStep profile={status.schoolProfile} />}
          {currentStep === 2 && <AcademicStructureStep />}
          {currentStep === 3 && <FeeStructureStep />}
          {currentStep === 4 && <InviteTeamStep />}
          {currentStep === 5 && <WebsiteSetupStep />}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div>
            {currentStep > 0 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <button
                onClick={handleSkip}
                className="text-sm text-gray-400 hover:text-gray-500 transition-colors"
              >
                Skip for now
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {currentStep > 0 && currentStep < 5 && (
              <button
                onClick={handleNext}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip this step
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {currentStep === 5 ? (
                <><Check className="h-4 w-4" /> Finish Setup</>
              ) : (
                <>Continue <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
