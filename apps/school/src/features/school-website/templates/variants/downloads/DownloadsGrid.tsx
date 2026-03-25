import type { VariantProps } from '../../section-variants'
import { spacingClass, cardClass, radiusClass, field, tint } from '../shared'

interface DownloadFile {
  title: string
  description: string
  fileType: string
  size: string
  url: string
}

function fileTypeColor(type: string): string {
  const map: Record<string, string> = {
    pdf: '#E53E3E',
    doc: '#3182CE',
    docx: '#3182CE',
    xls: '#38A169',
    xlsx: '#38A169',
    ppt: '#D69E2E',
    pptx: '#D69E2E',
    zip: '#805AD5',
    img: '#DD6B20',
  }
  return map[type.toLowerCase()] || '#718096'
}

function fileTypeLabel(type: string): string {
  return type.toUpperCase()
}

export function DownloadsGrid({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Downloads'
  const description = field(section.content, 'description', '')
  const files = field<DownloadFile[]>(section.content, 'files', [])

  const fallbackFiles: DownloadFile[] = [
    { title: 'Admission Form 2024-25', description: 'Download and fill the admission form for the upcoming academic session.', fileType: 'pdf', size: '245 KB', url: '#' },
    { title: 'Fee Structure', description: 'Detailed fee structure for all classes and streams.', fileType: 'pdf', size: '180 KB', url: '#' },
    { title: 'Academic Calendar', description: 'Complete academic calendar with holidays and exam schedules.', fileType: 'pdf', size: '320 KB', url: '#' },
    { title: 'Syllabus (Class 1-5)', description: 'Subject-wise syllabus for primary classes.', fileType: 'doc', size: '1.2 MB', url: '#' },
    { title: 'Syllabus (Class 6-10)', description: 'Subject-wise syllabus for secondary classes.', fileType: 'doc', size: '1.5 MB', url: '#' },
    { title: 'Transfer Certificate Form', description: 'Application form for requesting a transfer certificate.', fileType: 'pdf', size: '95 KB', url: '#' },
  ]

  const displayFiles = files.length > 0 ? files : fallbackFiles

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {sectionTitle}
        </h2>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">{description}</p>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayFiles.map((file, idx) => (
            <div
              key={idx}
              className={`flex flex-col p-5 ${cardClass(theme.cardStyle, theme.cornerRadius)}`}
            >
              <div className="flex items-start gap-4">
                {/* File type icon */}
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center text-xs font-bold ${radiusClass(theme.cornerRadius)}`}
                  style={{ backgroundColor: tint(theme.defaultPrimaryColor, 0.1), color: theme.defaultPrimaryColor }}
                >
                  {fileTypeLabel(file.fileType)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">{file.title}</h3>
                  <p className="mt-1 text-xs text-gray-400">{file.size}</p>
                </div>
              </div>

              {file.description && (
                <p className="mt-3 flex-1 text-sm text-gray-600">{file.description}</p>
              )}

              <a
                href={file.url}
                download
                className={`mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 ${radiusClass(theme.cornerRadius)}`}
                style={{ backgroundColor: theme.defaultAccentColor }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
