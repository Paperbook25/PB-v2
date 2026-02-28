import { useState } from 'react'
import {
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Plus,
  File,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import {
  useStudentDocuments,
  useUploadDocument,
  useDeleteDocument,
  useVerifyDocument,
} from '../hooks/useStudents'
import {
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
  type StudentDocument,
} from '../types/student.types'

interface DocumentVaultProps {
  studentId: string
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DocumentCard({
  document,
  onVerify,
  onDelete,
  isVerifying,
}: {
  document: StudentDocument
  onVerify: (docId: string) => void
  onDelete: (docId: string) => void
  isVerifying: boolean
}) {
  return (
    <div className="group relative flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50">
      {/* Document icon and info */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{document.name}</p>
          <p className="text-xs text-muted-foreground">{document.fileName}</p>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {DOCUMENT_TYPE_LABELS[document.type]}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {formatFileSize(document.fileSize)}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatDate(document.uploadedAt)}
        </span>
      </div>

      {/* Verified badge */}
      {document.verified && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>
            Verified{' '}
            {document.verifiedAt ? formatDate(document.verifiedAt) : ''}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        {!document.verified && (
          <Button
            variant="outline"
            size="sm"
            disabled={isVerifying}
            onClick={() => onVerify(document.id)}
            className="h-8 text-xs"
          >
            {isVerifying ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            )}
            Verify
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs text-destructive hover:text-destructive"
          onClick={() => onDelete(document.id)}
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  )
}

function DocumentGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-md" />
            <Skeleton className="h-5 w-14" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function DocumentVault({ studentId }: DocumentVaultProps) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null)
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null)
  const [docType, setDocType] = useState<DocumentType | ''>('')
  const [docName, setDocName] = useState('')

  const { toast } = useToast()
  const { data: documentsResponse, isLoading, isError } = useStudentDocuments(studentId)
  const documents = documentsResponse?.data
  const uploadMutation = useUploadDocument()
  const deleteMutation = useDeleteDocument()
  const verifyMutation = useVerifyDocument()

  const handleUpload = async () => {
    if (!docType || !docName.trim()) return

    try {
      await uploadMutation.mutateAsync({
        studentId,
        data: {
          type: docType,
          name: docName.trim(),
          fileName: `${docName.trim().toLowerCase().replace(/\s+/g, '_')}.pdf`,
          fileSize: 0,
          mimeType: 'application/pdf',
        },
      })
      toast({ title: 'Document uploaded successfully' })
      setUploadOpen(false)
      setDocType('')
      setDocName('')
    } catch {
      toast({
        title: 'Failed to upload document',
        variant: 'destructive',
      })
    }
  }

  const handleVerify = async (docId: string) => {
    setVerifyingDocId(docId)
    try {
      await verifyMutation.mutateAsync({ studentId, docId })
      toast({ title: 'Document verified successfully' })
    } catch {
      toast({
        title: 'Failed to verify document',
        variant: 'destructive',
      })
    } finally {
      setVerifyingDocId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteDocId) return

    try {
      await deleteMutation.mutateAsync({ studentId, docId: deleteDocId })
      toast({ title: 'Document deleted successfully' })
    } catch {
      toast({
        title: 'Failed to delete document',
        variant: 'destructive',
      })
    } finally {
      setDeleteDocId(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Documents</CardTitle>
        <Button size="sm" onClick={() => setUploadOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Upload Document
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <DocumentGridSkeleton />
        ) : isError ? (
          <div className="text-center py-8 text-destructive text-sm">
            Failed to load documents. Please try again.
          </div>
        ) : !documents || documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <File className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No documents uploaded</p>
            <p className="text-xs mt-1">
              Upload student documents like birth certificate, Aadhar card, etc.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setUploadOpen(true)}
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload First Document
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onVerify={handleVerify}
                onDelete={(docId) => setDeleteDocId(docId)}
                isVerifying={verifyingDocId === doc.id}
              />
            ))}
          </div>
        )}
      </CardContent>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a new document to this student's vault.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="docType">Document Type</Label>
              <Select
                value={docType}
                onValueChange={(v) => setDocType(v as DocumentType)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {(
                    Object.entries(DOCUMENT_TYPE_LABELS) as [
                      DocumentType,
                      string,
                    ][]
                  ).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="docName">Document Name</Label>
              <Input
                id="docName"
                placeholder="e.g. Birth Certificate - Original"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setUploadOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={
                  !docType || !docName.trim() || uploadMutation.isPending
                }
                onClick={handleUpload}
              >
                {uploadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteDocId}
        onOpenChange={(open) => {
          if (!open) setDeleteDocId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
