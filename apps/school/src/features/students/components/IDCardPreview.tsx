import { useRef } from 'react'
import { Printer, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate, getInitials } from '@/lib/utils'
import { useIDCardData } from '../hooks/useStudents'
import type { IDCardData } from '../types/student.types'

interface IDCardPreviewProps {
  studentId: string
}

function IDCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      <Skeleton className="w-[342px] h-[216px] rounded-xl" />
      <Skeleton className="w-[342px] h-[216px] rounded-xl" />
    </div>
  )
}

function IDCardFront({ data }: { data: IDCardData }) {
  return (
    <div className="w-[342px] h-[216px] rounded-xl border-2 border-primary/20 bg-white overflow-hidden shadow-sm flex flex-col">
      {/* Header with school branding */}
      <div className="bg-primary px-4 py-2 flex items-center gap-2">
        {data.schoolLogo ? (
          <img
            src={data.schoolLogo}
            alt="School Logo"
            className="h-8 w-8 rounded-full bg-white object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">
            {data.schoolName.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-xs font-bold text-primary-foreground leading-tight">
            {data.schoolName}
          </p>
          <p className="text-[10px] text-primary-foreground/80">
            Student Identity Card
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex items-center gap-4 px-4 py-3">
        {/* Photo */}
        <Avatar className="h-[72px] w-[72px] shrink-0 rounded-lg border">
          <AvatarImage
            src={data.photoUrl}
            alt={data.name}
            className="object-cover"
          />
          <AvatarFallback className="rounded-lg text-lg">
            {getInitials(data.name)}
          </AvatarFallback>
        </Avatar>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-bold text-gray-900 truncate">
            {data.name}
          </p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
            <div>
              <span className="text-gray-500">Class:</span>{' '}
              <span className="font-medium text-gray-800">
                {data.class} - {data.section}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Roll:</span>{' '}
              <span className="font-medium text-gray-800">
                {data.rollNumber}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500">Adm. No:</span>{' '}
              <span className="font-medium text-gray-800">
                {data.admissionNumber}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-primary/5 px-4 py-1.5 text-center">
        <p className="text-[9px] text-gray-500">
          Academic Year {data.academicYear}
        </p>
      </div>
    </div>
  )
}

function IDCardBack({ data }: { data: IDCardData }) {
  return (
    <div className="w-[342px] h-[216px] rounded-xl border-2 border-primary/20 bg-white overflow-hidden shadow-sm flex flex-col">
      {/* Header */}
      <div className="bg-primary px-4 py-1.5">
        <p className="text-[10px] text-primary-foreground text-center font-medium">
          Student Details
        </p>
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-2 space-y-1.5">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
          <div>
            <span className="text-gray-500">Date of Birth:</span>
            <p className="font-medium text-gray-800">
              {formatDate(data.dateOfBirth)}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Blood Group:</span>
            <p className="font-medium text-gray-800">
              {data.bloodGroup || 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Parent/Guardian:</span>
            <p className="font-medium text-gray-800 truncate">
              {data.parentName}
            </p>
          </div>
          <div>
            <span className="text-gray-500">Contact:</span>
            <p className="font-medium text-gray-800">{data.parentPhone}</p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-500">Address:</span>
            <p className="font-medium text-gray-800 truncate">
              {data.address}
            </p>
          </div>
        </div>

        <Separator className="my-1" />

        {/* Barcode placeholder */}
        <div className="flex items-center justify-center">
          <div className="flex gap-px items-end h-6">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-900"
                style={{
                  width: i % 3 === 0 ? '2px' : '1px',
                  height: `${14 + (i % 5) * 3}px`,
                }}
              />
            ))}
          </div>
        </div>
        <p className="text-center text-[8px] text-gray-400 tracking-widest">
          {data.admissionNumber}
        </p>
      </div>

      {/* Footer */}
      <div className="bg-primary/5 px-4 py-1.5 text-center">
        <p className="text-[9px] text-gray-500">
          Valid until: {formatDate(data.validUntil)}
        </p>
      </div>
    </div>
  )
}

export function IDCardPreview({ studentId }: IDCardPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const { data: dataResponse, isLoading, isError } = useIDCardData(studentId)
  const data = dataResponse?.data

  const handlePrint = () => {
    if (!printRef.current) return

    const printContent = printRef.current.innerHTML
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student ID Card - ${data?.name ?? ''}</title>
          <style>
            @page {
              size: auto;
              margin: 10mm;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              flex-wrap: wrap;
              gap: 24px;
              justify-content: center;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()

    // Slight delay to ensure styles are applied
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">ID Card Preview</CardTitle>
        <Button
          size="sm"
          disabled={isLoading || isError || !data}
          onClick={handlePrint}
        >
          <Printer className="h-4 w-4 mr-1" />
          Print
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <IDCardSkeleton />
        ) : isError || !data ? (
          <div className="text-center py-8 text-destructive text-sm">
            Failed to load ID card data. Please try again.
          </div>
        ) : (
          <div
            ref={printRef}
            className="flex flex-col sm:flex-row gap-6 items-start"
          >
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                Front
              </p>
              <IDCardFront data={data} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">
                Back
              </p>
              <IDCardBack data={data} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
