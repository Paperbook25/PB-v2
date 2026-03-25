import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface DownloadFile {
  title: string
  category: string
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
  }
  return map[type.toLowerCase()] || '#718096'
}

export function DownloadsList({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Downloads'
  const description = field(section.content, 'description', '')
  const files = field<DownloadFile[]>(section.content, 'files', [])

  const fallbackFiles: DownloadFile[] = [
    { title: 'Admission Form 2024-25', category: 'Admissions', fileType: 'pdf', size: '245 KB', url: '#' },
    { title: 'Fee Structure', category: 'Admissions', fileType: 'pdf', size: '180 KB', url: '#' },
    { title: 'Academic Calendar', category: 'Academic', fileType: 'pdf', size: '320 KB', url: '#' },
    { title: 'Syllabus (Class 1-5)', category: 'Academic', fileType: 'doc', size: '1.2 MB', url: '#' },
    { title: 'Syllabus (Class 6-10)', category: 'Academic', fileType: 'doc', size: '1.5 MB', url: '#' },
    { title: 'Annual Report 2023-24', category: 'Reports', fileType: 'pdf', size: '4.5 MB', url: '#' },
    { title: 'Transfer Certificate Form', category: 'Forms', fileType: 'pdf', size: '95 KB', url: '#' },
    { title: 'Leave Application Form', category: 'Forms', fileType: 'pdf', size: '72 KB', url: '#' },
  ]

  const displayFiles = files.length > 0 ? files : fallbackFiles

  // Group by category
  const grouped = displayFiles.reduce<Record<string, DownloadFile[]>>((acc, file) => {
    const cat = file.category || 'General'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(file)
    return acc
  }, {})

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-4xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {sectionTitle}
        </h2>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">{description}</p>
        )}

        <div className="mt-10 space-y-8">
          {Object.entries(grouped).map(([category, categoryFiles]) => (
            <div key={category}>
              <h3
                className="border-b-2 pb-2 text-lg font-semibold"
                style={{ borderBottomColor: theme.defaultPrimaryColor, color: theme.defaultPrimaryColor }}
              >
                {category}
              </h3>
              <ul className="mt-3 divide-y divide-gray-100">
                {categoryFiles.map((file, idx) => (
                  <li key={idx} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      {/* File type badge */}
                      <span
                        className={`inline-flex h-8 w-10 items-center justify-center text-[10px] font-bold text-white ${radiusClass(theme.cornerRadius)}`}
                        style={{ backgroundColor: fileTypeColor(file.fileType) }}
                      >
                        {file.fileType.toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.title}</p>
                        <p className="text-xs text-gray-400">{file.size}</p>
                      </div>
                    </div>
                    <a
                      href={file.url}
                      download
                      className="flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
                      style={{ color: theme.defaultAccentColor }}
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
