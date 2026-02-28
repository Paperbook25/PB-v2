import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Send,
  User,
  UserPlus,
  Users,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn, formatDate, getInitials } from '@/lib/utils'
import { useApplication, useUpdateStatus, useAddNote, useUpdateDocumentStatus } from '../hooks/useAdmissions'
import type { ApplicationStatus, DocumentType } from '../types/admission.types'
import { getStatusConfig, canTransitionTo, APPLICATION_STATUSES } from '../types/admission.types'
import { StatusChangeDialog } from '../components/StatusChangeDialog'
import { DocumentList } from '../components/DocumentList'
import { DocumentUpload } from '../components/DocumentUpload'
import { ApplicationTimeline } from '../components/ApplicationTimeline'
import { EnrollmentDialog } from '../components/EnrollmentDialog'

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || '-'}</p>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState('')

  const { data: applicationData, isLoading, error } = useApplication(id!)
  const updateStatus = useUpdateStatus()
  const addNote = useAddNote()
  const updateDocStatus = useUpdateDocumentStatus()

  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Application Details"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Admissions', href: '/admissions' },
            { label: 'Loading...' },
          ]}
        />
        <LoadingSkeleton />
      </div>
    )
  }

  if (error || !applicationData?.data) {
    return (
      <div>
        <PageHeader
          title="Application Not Found"
          breadcrumbs={[
            { label: 'Dashboard', href: '/' },
            { label: 'Admissions', href: '/admissions' },
            { label: 'Not Found' },
          ]}
        />
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">The application you're looking for doesn't exist.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/admissions')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admissions
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const application = applicationData.data
  const statusConfig = getStatusConfig(application.status)
  const allowedTransitions = APPLICATION_STATUSES.filter((s) => canTransitionTo(application.status, s.value))

  const handleStatusChange = (newStatus: ApplicationStatus, note?: string) => {
    updateStatus.mutate(
      { id: application.id, data: { status: newStatus, note } },
      {
        onSuccess: () => setStatusDialogOpen(false),
      }
    )
  }

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNote.mutate(
        { applicationId: application.id, data: { content: newNote.trim() } },
        {
          onSuccess: () => setNewNote(''),
        }
      )
    }
  }

  const handleVerifyDocument = (documentId: string) => {
    updateDocStatus.mutate({
      applicationId: application.id,
      documentId,
      data: { status: 'verified' },
    })
  }

  const handleRejectDocument = (documentId: string) => {
    updateDocStatus.mutate({
      applicationId: application.id,
      documentId,
      data: { status: 'rejected', rejectionReason: 'Document rejected' },
    })
  }

  const handleUploadDocument = (type: DocumentType, file: File) => {
    // In a real app, this would upload to a storage service
    console.log('Uploading document:', type, file.name)
    setUploadDialogOpen(false)
  }

  return (
    <div>
      <PageHeader
        title="Application Details"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Admissions', href: '/admissions' },
          { label: application.applicationNumber },
        ]}
        actions={
          <div className="flex gap-2">
            {application.status === 'approved' && (
              <Button onClick={() => setEnrollmentDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Enroll Student
              </Button>
            )}
            {application.status === 'enrolled' && application.enrolledStudentId && (
              <Button variant="outline" asChild>
                <Link to={`/students/${application.enrolledStudentId}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Student Profile
                </Link>
              </Button>
            )}
            {allowedTransitions.length > 0 && (
              <Button variant={application.status === 'approved' ? 'outline' : 'default'} onClick={() => setStatusDialogOpen(true)}>
                Change Status
              </Button>
            )}
          </div>
        }
      />

      {/* Header Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={application.photoUrl} />
              <AvatarFallback className="text-2xl">{getInitials(application.studentName)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h2 className="text-2xl font-bold">{application.studentName}</h2>
                <Badge className={cn(statusConfig.bgColor, statusConfig.color)}>{statusConfig.label}</Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Application #{application.applicationNumber} • Applying for {application.applyingForClass}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Applied on {formatDate(application.appliedDate)}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="text-center px-4 py-2 bg-muted rounded-lg">
                <p className="text-muted-foreground">Previous Marks</p>
                <p className="text-xl font-bold">{application.previousMarks}%</p>
              </div>
              {application.entranceExamScore && (
                <div className="text-center px-4 py-2 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Exam Score</p>
                  <p className="text-xl font-bold">{application.entranceExamScore}</p>
                </div>
              )}
              {application.interviewScore && (
                <div className="text-center px-4 py-2 bg-muted rounded-lg">
                  <p className="text-muted-foreground">Interview</p>
                  <p className="text-xl font-bold">{application.interviewScore}/10</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents ({application.documents.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes ({application.notes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow icon={User} label="Full Name" value={application.studentName} />
                <InfoRow
                  icon={Calendar}
                  label="Date of Birth"
                  value={formatDate(application.dateOfBirth, { year: 'numeric', month: 'long', day: 'numeric' })}
                />
                <InfoRow icon={User} label="Gender" value={application.gender === 'male' ? 'Male' : 'Female'} />
                <InfoRow icon={Mail} label="Email" value={application.email} />
                <InfoRow icon={Phone} label="Phone" value={application.phone} />
                <InfoRow
                  icon={MapPin}
                  label="Address"
                  value={`${application.address.street}, ${application.address.city}, ${application.address.state} - ${application.address.pincode}`}
                />
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <GraduationCap className="h-4 w-4" />
                  Academic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <InfoRow icon={GraduationCap} label="Applying For" value={application.applyingForClass} />
                <InfoRow icon={GraduationCap} label="Previous School" value={application.previousSchool} />
                <InfoRow icon={GraduationCap} label="Previous Class" value={application.previousClass} />
                <InfoRow icon={GraduationCap} label="Previous Marks" value={`${application.previousMarks}%`} />
                {application.entranceExamDate && (
                  <InfoRow icon={Calendar} label="Entrance Exam" value={formatDate(application.entranceExamDate)} />
                )}
                {application.interviewDate && (
                  <InfoRow icon={Calendar} label="Interview Date" value={formatDate(application.interviewDate)} />
                )}
              </CardContent>
            </Card>

            {/* Parent/Guardian Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  Parent/Guardian Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <InfoRow icon={User} label="Father's Name" value={application.fatherName} />
                    <InfoRow icon={User} label="Mother's Name" value={application.motherName} />
                  </div>
                  <div className="space-y-1">
                    <InfoRow icon={Phone} label="Guardian Phone" value={application.guardianPhone} />
                    <InfoRow icon={Mail} label="Guardian Email" value={application.guardianEmail} />
                    <InfoRow icon={User} label="Occupation" value={application.guardianOccupation} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Documents
                </CardTitle>
                <CardDescription>Uploaded documents for this application</CardDescription>
              </div>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              <DocumentList
                documents={application.documents}
                onVerify={handleVerifyDocument}
                onReject={handleRejectDocument}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Status Timeline
              </CardTitle>
              <CardDescription>History of status changes</CardDescription>
            </CardHeader>
            <CardContent>
              <ApplicationTimeline statusHistory={application.statusHistory} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                Internal Notes
              </CardTitle>
              <CardDescription>Notes and comments from staff</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add Note Form */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button onClick={handleAddNote} disabled={!newNote.trim() || addNote.isPending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Notes List */}
              {application.notes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No notes yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {application.notes.map((note) => (
                    <div key={note.id} className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{note.createdByName}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</p>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Change Dialog */}
      <StatusChangeDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        currentStatus={application.status}
        onConfirm={handleStatusChange}
        isLoading={updateStatus.isPending}
      />

      {/* Document Upload Dialog */}
      <DocumentUpload
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUpload={handleUploadDocument}
      />

      {/* Enrollment Dialog */}
      <EnrollmentDialog
        open={enrollmentDialogOpen}
        onOpenChange={setEnrollmentDialogOpen}
        application={application}
      />
    </div>
  )
}
