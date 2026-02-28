import { useState } from 'react'
import { Award, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useGenerateCertificate, useCertificates } from '../hooks/useLms'
import { CertificateViewer } from './CertificateViewer'
import type { Certificate, CertificateType, Enrollment } from '../types/lms.types'

interface GenerateCertificateButtonProps {
  enrollment: Enrollment
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
}

const CERTIFICATE_TYPES: { value: CertificateType; label: string; description: string }[] = [
  { value: 'completion', label: 'Completion', description: 'Standard course completion certificate' },
  { value: 'achievement', label: 'Achievement', description: 'For students with excellent performance' },
  { value: 'excellence', label: 'Excellence', description: 'For outstanding achievement with distinction' },
]

export function GenerateCertificateButton({
  enrollment,
  variant = 'outline',
  size = 'sm',
}: GenerateCertificateButtonProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [certType, setCertType] = useState<CertificateType>('completion')
  const [generatedCert, setGeneratedCert] = useState<Certificate | null>(null)

  const generateMutation = useGenerateCertificate()
  const { data: existingCertsData } = useCertificates({
    studentId: enrollment.studentId,
    courseId: enrollment.courseId,
  })

  const existingCert = existingCertsData?.data?.[0]
  const isCompleted = enrollment.status === 'completed'

  const handleGenerate = async () => {
    try {
      const result = await generateMutation.mutateAsync({
        enrollmentId: enrollment.id,
        type: certType,
      })

      setGeneratedCert(result.data)
      setOpen(false)

      toast({
        title: 'Certificate Generated',
        description: 'Certificate has been created successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate certificate. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // If already has a certificate, show view button
  if (existingCert) {
    return (
      <>
        <Button
          variant={variant}
          size={size}
          onClick={() => setGeneratedCert(existingCert)}
        >
          <Award className="h-4 w-4 mr-2" />
          View Certificate
        </Button>

        {generatedCert && (
          <CertificateViewer
            certificate={generatedCert}
            open={!!generatedCert}
            onOpenChange={(open) => !open && setGeneratedCert(null)}
          />
        )}
      </>
    )
  }

  // Can only generate for completed enrollments
  if (!isCompleted) {
    return (
      <Button variant="ghost" size={size} disabled>
        <Award className="h-4 w-4 mr-2 opacity-50" />
        Complete to Earn
      </Button>
    )
  }

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        <Award className="h-4 w-4 mr-2" />
        Generate Certificate
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Certificate</DialogTitle>
            <DialogDescription>
              Create a certificate for completing "{enrollment.courseName}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Certificate Type</Label>
              <Select value={certType} onValueChange={(v) => setCertType(v as CertificateType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CERTIFICATE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
              <p><strong>Student:</strong> {enrollment.studentName}</p>
              <p><strong>Course:</strong> {enrollment.courseName}</p>
              <p><strong>Progress:</strong> {enrollment.progress}%</p>
              <p><strong>Lessons Completed:</strong> {enrollment.lessonsCompleted}/{enrollment.totalLessons}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {generatedCert && (
        <CertificateViewer
          certificate={generatedCert}
          open={!!generatedCert}
          onOpenChange={(open) => !open && setGeneratedCert(null)}
        />
      )}
    </>
  )
}
