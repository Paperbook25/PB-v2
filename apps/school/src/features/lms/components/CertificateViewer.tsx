import { useRef, useState } from 'react'
import { Download, Printer, Share2, X, Award, CheckCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { CertificateTemplate } from './CertificateTemplate'
import type { Certificate } from '../types/lms.types'
import { statusColors } from '@/lib/design-tokens'

interface CertificateViewerProps {
  certificate: Certificate
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CertificateViewer({ certificate, open, onOpenChange }: CertificateViewerProps) {
  const { toast } = useToast()
  const certificateRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const handlePrint = () => {
    const printContent = certificateRef.current
    if (!printContent) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast({
        title: 'Print Blocked',
        description: 'Please allow popups to print the certificate.',
        variant: 'destructive',
      })
      return
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${certificate.studentName}</title>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              background: white;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .certificate-wrapper {
              width: 800px;
              min-height: 600px;
            }
            @media print {
              body { background: white; }
              .certificate-wrapper {
                width: 100%;
                page-break-inside: avoid;
              }
            }
          </style>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body>
          <div class="certificate-wrapper">
            ${printContent.outerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const handleDownloadPNG = async () => {
    setIsExporting(true)
    try {
      // Dynamically import html2canvas
      const html2canvas = (await import('html2canvas')).default

      if (!certificateRef.current) {
        throw new Error('Certificate element not found')
      }

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      })

      const link = document.createElement('a')
      link.download = `certificate-${certificate.certificateNumber}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      toast({
        title: 'Downloaded',
        description: 'Certificate saved as PNG.',
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: 'Export Failed',
        description: 'Could not export certificate. Try printing instead.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: `Certificate of ${certificate.type}`,
      text: `${certificate.studentName} has completed ${certificate.courseName}`,
      url: certificate.verificationUrl,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(certificate.verificationUrl)
      toast({
        title: 'Link Copied',
        description: 'Verification link copied to clipboard.',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Certificate Preview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button size="sm" onClick={handleDownloadPNG} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Download PNG'}
            </Button>
          </div>

          {/* Certificate Preview */}
          <div className="overflow-auto border rounded-lg bg-gray-100 p-4">
            <div className="flex justify-center">
              <CertificateTemplate ref={certificateRef} certificate={certificate} />
            </div>
          </div>

          {/* Verification Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4" style={{ color: statusColors.success }} />
              <span className="font-medium">Verified Certificate</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Certificate Number</p>
                <p className="font-mono font-medium">{certificate.certificateNumber}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Issue Date</p>
                <p className="font-medium">
                  {new Date(certificate.issueDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <a
              href={certificate.verificationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Verify Online
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
