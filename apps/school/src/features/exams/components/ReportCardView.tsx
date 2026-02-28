import { Printer, Download, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import { downloadReportCardAsPDF } from '@/lib/pdf-export'
import { getGradeColor } from '@/lib/design-tokens'
import type { ReportCard } from '../types/exams.types'

interface ReportCardViewProps {
  reportCard: ReportCard
  onClose?: () => void
}

export function ReportCardView({ reportCard, onClose }: ReportCardViewProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    downloadReportCardAsPDF(reportCard)
  }

  const getGradeStyle = (grade: string) => ({
    color: getGradeColor(grade),
  })

  return (
    <Card className="print:shadow-none print:border-none max-w-3xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between print:hidden">
        <div>
          <h2 className="text-lg font-semibold">Report Card</h2>
          <p className="text-sm text-muted-foreground">
            {reportCard.examName} - {reportCard.academicYear}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <FileDown className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* School Header */}
        <div className="text-center border-b pb-4">
          <h2 className="text-xl font-bold">Paperbook School</h2>
          <p className="text-sm text-muted-foreground">
            123 Education Lane, Knowledge City - 400001
          </p>
          <p className="text-sm text-muted-foreground">
            Phone: +91 98765 43210 | Email: admin@paperbook.edu
          </p>
        </div>

        {/* Report Card Title */}
        <div className="text-center">
          <h3 className="text-lg font-semibold uppercase">Progress Report Card</h3>
          <p className="text-sm text-muted-foreground">
            {reportCard.examName} | Academic Year: {reportCard.academicYear} | {reportCard.term}
          </p>
        </div>

        {/* Student Info */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Student Name</p>
              <p className="font-medium">{reportCard.studentName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Admission No.</p>
              <p className="font-medium">{reportCard.admissionNumber}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Class</p>
              <p className="font-medium">
                {reportCard.studentClass} - {reportCard.studentSection}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Roll Number</p>
              <p className="font-medium">{reportCard.rollNumber}</p>
            </div>
          </div>
        </div>

        {/* Marks Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">S.No</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead className="text-center">Max Marks</TableHead>
              <TableHead className="text-center">Marks Obtained</TableHead>
              <TableHead className="text-center">Grade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportCard.subjects.map((subject, index) => (
              <TableRow key={subject.subjectCode}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{subject.subjectName}</p>
                    <p className="text-xs text-muted-foreground">{subject.subjectCode}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center">{subject.maxMarks}</TableCell>
                <TableCell className="text-center font-medium">{subject.marksObtained}</TableCell>
                <TableCell className="text-center">
                  <span className="font-bold" style={getGradeStyle(subject.grade)}>
                    {subject.grade}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={2} className="font-bold">
                Total
              </TableCell>
              <TableCell className="text-center font-bold">{reportCard.totalMarks}</TableCell>
              <TableCell className="text-center font-bold">{reportCard.totalObtained}</TableCell>
              <TableCell className="text-center">
                <span className="font-bold" style={getGradeStyle(reportCard.grade)}>
                  {reportCard.grade}
                </span>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-primary/5 p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Percentage</p>
            <p className="text-2xl font-bold">{reportCard.percentage}%</p>
          </div>
          <div className="bg-primary/5 p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Grade</p>
            <p className="text-2xl font-bold" style={getGradeStyle(reportCard.grade)}>
              {reportCard.grade}
            </p>
          </div>
          {reportCard.rank && (
            <div className="bg-primary/5 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Class Rank</p>
              <p className="text-2xl font-bold">{reportCard.rank}</p>
            </div>
          )}
          {reportCard.attendance && (
            <div className="bg-primary/5 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Attendance</p>
              <p className="text-2xl font-bold">{reportCard.attendance.percentage}%</p>
            </div>
          )}
        </div>

        {/* Attendance Details */}
        {reportCard.attendance && (
          <div className="text-sm text-muted-foreground">
            <p>
              Attendance: {reportCard.attendance.presentDays} / {reportCard.attendance.totalDays}{' '}
              days
            </p>
          </div>
        )}

        {/* Remarks */}
        {reportCard.remarks && (
          <div>
            <p className="text-sm font-medium">Remarks</p>
            <p className="text-sm text-muted-foreground">{reportCard.remarks}</p>
          </div>
        )}

        <Separator />

        {/* Footer */}
        <div className="flex justify-between items-end text-sm text-muted-foreground">
          <div>
            <p>
              Generated on:{' '}
              {formatDate(reportCard.generatedAt, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex gap-12">
            <div className="text-center">
              <div className="border-t border-dashed pt-2 px-8">
                <p className="text-xs">Class Teacher</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-dashed pt-2 px-8">
                <p className="text-xs">Principal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Print-only footer */}
        <div className="hidden print:block text-center text-xs text-muted-foreground mt-8">
          <p>This is a computer-generated report card.</p>
        </div>
      </CardContent>
    </Card>
  )
}
