import { forwardRef } from 'react'
import type { Certificate, CertificateType } from '../types/lms.types'

interface CertificateTemplateProps {
  certificate: Certificate
  className?: string
}

const TYPE_CONFIG: Record<CertificateType, { title: string; subtitle: string; borderColor: string; bgGradient: string }> = {
  completion: {
    title: 'Certificate of Completion',
    subtitle: 'has successfully completed the course',
    borderColor: 'border-blue-600',
    bgGradient: 'from-blue-50 to-white',
  },
  achievement: {
    title: 'Certificate of Achievement',
    subtitle: 'has demonstrated outstanding performance in',
    borderColor: 'border-amber-600',
    bgGradient: 'from-amber-50 to-white',
  },
  excellence: {
    title: 'Certificate of Excellence',
    subtitle: 'has achieved excellence with distinction in',
    borderColor: 'border-slate-700',
    bgGradient: 'from-slate-50 to-white',
  },
}

export const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(
  ({ certificate, className = '' }, ref) => {
    const config = TYPE_CONFIG[certificate.type]
    const issueDate = new Date(certificate.issueDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })

    return (
      <div
        ref={ref}
        className={`relative w-[800px] min-h-[600px] bg-gradient-to-br ${config.bgGradient} p-8 ${className}`}
      >
        {/* Decorative Border */}
        <div className={`absolute inset-4 border-4 ${config.borderColor} rounded-lg`} />
        <div className={`absolute inset-6 border ${config.borderColor} rounded-lg opacity-50`} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-between h-full min-h-[550px] py-8 px-12">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">P</span>
              </div>
            </div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Paperbook Education</p>
            <h1 className="text-3xl font-serif font-bold text-gray-800 mt-4">{config.title}</h1>
          </div>

          {/* Main Content */}
          <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
            <p className="text-lg text-gray-600">This is to certify that</p>
            <h2 className="text-4xl font-serif font-bold text-gray-900 border-b-2 border-gray-300 pb-2 px-8">
              {certificate.studentName}
            </h2>
            <p className="text-lg text-gray-600">{config.subtitle}</p>
            <h3 className="text-2xl font-semibold text-gray-800">{certificate.courseName}</h3>

            {/* Details */}
            <div className="flex justify-center gap-12 mt-4 text-sm text-gray-600">
              {certificate.grade && (
                <div className="text-center">
                  <p className="font-semibold text-gray-800">Grade</p>
                  <p className="text-xl font-bold text-primary">{certificate.grade}</p>
                </div>
              )}
              <div className="text-center">
                <p className="font-semibold text-gray-800">Hours Completed</p>
                <p className="text-xl font-bold text-primary">{certificate.hoursCompleted}</p>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-800">Completion</p>
                <p className="text-xl font-bold text-primary">{certificate.completionPercentage}%</p>
              </div>
            </div>

            {/* Skills */}
            {certificate.skills.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Skills Acquired</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {certificate.skills.slice(0, 4).map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="w-full">
            <div className="flex justify-between items-end px-8">
              <div className="text-center">
                <div className="w-40 border-t border-gray-400 pt-2">
                  <p className="font-semibold text-gray-800">{certificate.instructorName}</p>
                  <p className="text-xs text-gray-500">Course Instructor</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">Issued on</p>
                <p className="font-semibold text-gray-800">{issueDate}</p>
              </div>

              <div className="text-center">
                <div className="w-40 border-t border-gray-400 pt-2">
                  <p className="font-semibold text-gray-800">Principal</p>
                  <p className="text-xs text-gray-500">Paperbook Education</p>
                </div>
              </div>
            </div>

            {/* Certificate Number & Verification */}
            <div className="text-center mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Certificate No: <span className="font-mono font-semibold">{certificate.certificateNumber}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Verify at: {certificate.verificationUrl}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
)

CertificateTemplate.displayName = 'CertificateTemplate'
