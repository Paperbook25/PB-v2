import { useState } from 'react'
import { Award, Eye, Download, Calendar, BookOpen, GraduationCap, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCertificates } from '../hooks/useLms'
import { CertificateViewer } from './CertificateViewer'
import type { Certificate, CertificateType } from '../types/lms.types'
import { statusColors, moduleColors, medalColors } from '@/lib/design-tokens'

interface CertificatesListProps {
  studentId?: string
  courseId?: string
  title?: string
  showEmpty?: boolean
}

const TYPE_BADGE_STYLES: Record<CertificateType, { label: string; bg: string; text: string }> = {
  completion: { label: 'Completion', bg: statusColors.infoLight, text: statusColors.info },
  achievement: { label: 'Achievement', bg: medalColors.goldLight, text: medalColors.gold },
  excellence: { label: 'Excellence', bg: moduleColors.integrationsLight, text: moduleColors.integrations },
}

export function CertificatesList({
  studentId,
  courseId,
  title = 'My Certificates',
  showEmpty = true,
}: CertificatesListProps) {
  const { data: result, isLoading } = useCertificates({ studentId, courseId })
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)

  const certificates = result?.data ?? []

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (certificates.length === 0 && !showEmpty) {
    return null
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No certificates yet</p>
              <p className="text-sm">Complete a course to earn your certificate!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {certificates.map((cert) => {
                const badgeConfig = TYPE_BADGE_STYLES[cert.type]
                const issueDate = new Date(cert.issueDate).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })

                return (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{cert.courseName}</h4>
                          <Badge
                            variant="secondary"
                            style={{
                              backgroundColor: badgeConfig.bg,
                              color: badgeConfig.text,
                            }}
                          >
                            {badgeConfig.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {issueDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {cert.hoursCompleted} hours
                          </span>
                          {cert.grade && (
                            <span className="font-medium text-primary">Grade: {cert.grade}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                          {cert.certificateNumber}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCertificate(cert)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCertificate && (
        <CertificateViewer
          certificate={selectedCertificate}
          open={!!selectedCertificate}
          onOpenChange={(open) => !open && setSelectedCertificate(null)}
        />
      )}
    </>
  )
}
