import { FileText, Check, X, Clock, Download, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatDate } from '@/lib/utils'
import type { ApplicationDocument, DocumentStatus } from '../types/admission.types'
import { DOCUMENT_TYPES } from '../types/admission.types'

interface DocumentListProps {
  documents: ApplicationDocument[]
  onVerify?: (documentId: string) => void
  onReject?: (documentId: string) => void
  readonly?: boolean
}

const statusConfig: Record<DocumentStatus, { label: string; icon: React.ElementType; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', icon: Clock, variant: 'secondary' },
  verified: { label: 'Verified', icon: Check, variant: 'default' },
  rejected: { label: 'Rejected', icon: X, variant: 'destructive' },
}

function getDocumentLabel(type: string): string {
  const docType = DOCUMENT_TYPES.find((d) => d.value === type)
  return docType?.label || type.replace(/_/g, ' ')
}

export function DocumentList({ documents, onVerify, onReject, readonly = false }: DocumentListProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
        <p>No documents uploaded yet</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Document</TableHead>
          <TableHead>Uploaded</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => {
          const status = statusConfig[doc.status]
          const StatusIcon = status.icon

          return (
            <TableRow key={doc.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{getDocumentLabel(doc.type)}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{doc.name}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm">{formatDate(doc.uploadedAt)}</p>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <Badge variant={status.variant} className="gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {status.label}
                  </Badge>
                  {doc.status === 'verified' && doc.verifiedBy && (
                    <p className="text-xs text-muted-foreground">by {doc.verifiedBy}</p>
                  )}
                  {doc.status === 'rejected' && doc.rejectionReason && (
                    <p className="text-xs text-destructive">{doc.rejectionReason}</p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>View</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download</TooltipContent>
                  </Tooltip>

                  {!readonly && doc.status === 'pending' && (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => onVerify?.(doc.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Verify</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => onReject?.(doc.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reject</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
