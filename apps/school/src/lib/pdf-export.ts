import type { ReportCard } from '@/features/exams/types/exams.types'

// Simple PDF generation using browser's print to PDF capability
// For production, consider using jspdf, pdfmake, or server-side PDF generation

export function printReportCard(reportCard: ReportCard) {
  // Create a new window with formatted content
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to print the report card')
    return
  }

  const html = generateReportCardHTML(reportCard)
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.onload = () => {
    printWindow.print()
  }
}

export function downloadReportCardAsPDF(reportCard: ReportCard) {
  // Use print dialog with "Save as PDF" option
  printReportCard(reportCard)
}

function generateReportCardHTML(reportCard: ReportCard): string {
  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return '#16a34a'
    if (grade.startsWith('B')) return '#2563eb'
    if (grade.startsWith('C')) return '#ca8a04'
    if (grade === 'D') return '#ea580c'
    return '#dc2626'
  }

  const subjectsRows = reportCard.subjects
    .map(
      (subject, index) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${index + 1}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">
          <div>${subject.subjectName}</div>
          <div style="font-size: 11px; color: #6b7280;">${subject.subjectCode}</div>
        </td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${subject.maxMarks}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-weight: 600;">${subject.marksObtained}</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; font-weight: 700; color: ${getGradeColor(subject.grade)};">${subject.grade}</td>
      </tr>
    `
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Report Card - ${reportCard.studentName}</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #1f2937;
          margin: 0;
          padding: 20px;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #1f2937;
          padding-bottom: 15px;
          margin-bottom: 15px;
        }
        .school-name {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .school-address {
          font-size: 11px;
          color: #6b7280;
        }
        .title {
          text-align: center;
          margin: 15px 0;
        }
        .title h2 {
          font-size: 16px;
          text-transform: uppercase;
          margin: 0;
        }
        .title p {
          font-size: 11px;
          color: #6b7280;
          margin: 5px 0 0;
        }
        .student-info {
          background: #f3f4f6;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 15px;
        }
        .student-info-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .info-item label {
          font-size: 10px;
          color: #6b7280;
          display: block;
          margin-bottom: 2px;
        }
        .info-item span {
          font-weight: 600;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
        }
        th {
          background: #f3f4f6;
          padding: 8px;
          border: 1px solid #e5e7eb;
          font-weight: 600;
          text-align: left;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }
        .summary-item {
          background: #eff6ff;
          padding: 12px;
          border-radius: 8px;
          text-align: center;
        }
        .summary-item label {
          font-size: 10px;
          color: #6b7280;
          display: block;
          margin-bottom: 4px;
        }
        .summary-item span {
          font-size: 18px;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .signature {
          text-align: center;
          padding: 0 30px;
        }
        .signature-line {
          border-top: 1px dashed #1f2937;
          padding-top: 5px;
          font-size: 10px;
        }
        .generated {
          font-size: 10px;
          color: #6b7280;
        }
        .notice {
          text-align: center;
          font-size: 10px;
          color: #6b7280;
          margin-top: 20px;
        }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="school-name">Paperbook School</div>
        <div class="school-address">123 Education Lane, Knowledge City - 400001</div>
        <div class="school-address">Phone: +91 98765 43210 | Email: admin@paperbook.edu</div>
      </div>

      <div class="title">
        <h2>Progress Report Card</h2>
        <p>${reportCard.examName} | Academic Year: ${reportCard.academicYear} | ${reportCard.term}</p>
      </div>

      <div class="student-info">
        <div class="student-info-grid">
          <div class="info-item">
            <label>Student Name</label>
            <span>${reportCard.studentName}</span>
          </div>
          <div class="info-item">
            <label>Admission No.</label>
            <span>${reportCard.admissionNumber}</span>
          </div>
          <div class="info-item">
            <label>Class</label>
            <span>${reportCard.studentClass} - ${reportCard.studentSection}</span>
          </div>
          <div class="info-item">
            <label>Roll Number</label>
            <span>${reportCard.rollNumber}</span>
          </div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 40px;">S.No</th>
            <th>Subject</th>
            <th style="text-align: center; width: 80px;">Max Marks</th>
            <th style="text-align: center; width: 100px;">Marks Obtained</th>
            <th style="text-align: center; width: 60px;">Grade</th>
          </tr>
        </thead>
        <tbody>
          ${subjectsRows}
        </tbody>
        <tfoot>
          <tr style="font-weight: bold; background: #f9fafb;">
            <td colspan="2" style="padding: 8px; border: 1px solid #e5e7eb;">Total</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${reportCard.totalMarks}</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${reportCard.totalObtained}</td>
            <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center; color: ${getGradeColor(reportCard.grade)};">${reportCard.grade}</td>
          </tr>
        </tfoot>
      </table>

      <div class="summary">
        <div class="summary-item">
          <label>Percentage</label>
          <span>${reportCard.percentage}%</span>
        </div>
        <div class="summary-item">
          <label>Grade</label>
          <span style="color: ${getGradeColor(reportCard.grade)};">${reportCard.grade}</span>
        </div>
        ${reportCard.rank ? `
          <div class="summary-item">
            <label>Class Rank</label>
            <span>${reportCard.rank}</span>
          </div>
        ` : ''}
        ${reportCard.attendance ? `
          <div class="summary-item">
            <label>Attendance</label>
            <span>${reportCard.attendance.percentage}%</span>
          </div>
        ` : ''}
      </div>

      ${reportCard.attendance ? `
        <p style="font-size: 11px; color: #6b7280;">
          Attendance: ${reportCard.attendance.presentDays} / ${reportCard.attendance.totalDays} days
        </p>
      ` : ''}

      ${reportCard.remarks ? `
        <div style="margin: 10px 0;">
          <strong style="font-size: 11px;">Remarks:</strong>
          <p style="font-size: 11px; color: #6b7280; margin: 5px 0;">${reportCard.remarks}</p>
        </div>
      ` : ''}

      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

      <div class="footer">
        <div class="generated">
          Generated on: ${new Date(reportCard.generatedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <div style="display: flex; gap: 50px;">
          <div class="signature">
            <div class="signature-line">Class Teacher</div>
          </div>
          <div class="signature">
            <div class="signature-line">Principal</div>
          </div>
        </div>
      </div>

      <div class="notice">
        This is a computer-generated report card.
      </div>
    </body>
    </html>
  `
}

// Batch export functionality
export async function exportMultipleReportCards(reportCards: ReportCard[]): Promise<void> {
  // For batch export, we'll create individual PDFs
  // In production, you might want to create a combined PDF
  for (const reportCard of reportCards) {
    downloadReportCardAsPDF(reportCard)
    // Small delay to prevent browser from blocking popups
    await new Promise(resolve => setTimeout(resolve, 500))
  }
}
