import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  GraduationCap,
  CreditCard,
  FileText,
  ClipboardCheck,
  Pencil,
  MessageSquare,
  IndianRupee,
  Heart,
  Users,
  CreditCard as IdCard,
  Clock,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { PageHeader } from '@/components/layout/PageHeader'
import { CollectFeeDialog } from '../components/CollectFeeDialog'
import { MessageParentDialog } from '../components/MessageParentDialog'
import { StudentTimeline } from '../components/StudentTimeline'
import { DocumentVault } from '../components/DocumentVault'
import { HealthRecordCard } from '../components/HealthRecordCard'
import { SiblingCard } from '../components/SiblingCard'
import { IDCardPreview } from '../components/IDCardPreview'
import { HostelStatusCard } from '../components/HostelStatusCard'
import { AlumniStatusCard } from '../components/AlumniStatusCard'
import { useStudent } from '../hooks/useStudents'
import { useStudentMarks } from '@/features/exams/hooks/useExams'
import { useStudentAttendance } from '@/features/attendance/hooks/useAttendance'
import { useStudentFeesById } from '@/features/finance/hooks/useFinance'
import { cn, getInitials, formatDate, formatCurrency } from '@/lib/utils'

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

export function StudentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [collectFeeOpen, setCollectFeeOpen] = useState(false)
  const [messageOpen, setMessageOpen] = useState(false)

  const { data: result, isLoading, error } = useStudent(id!)
  const { data: marksResult, isLoading: marksLoading } = useStudentMarks(id!)
  const { data: attendanceResult, isLoading: attendanceLoading } = useStudentAttendance(id!)
  const { data: feesResult, isLoading: feesLoading } = useStudentFeesById(id!)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  const data = result?.data

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <p className="text-lg text-muted-foreground mb-4">Student not found</p>
        <Button onClick={() => navigate('/students')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
      </div>
    )
  }

  const student = data

  return (
    <div>
      <PageHeader
        title={student.name}
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Students', href: '/students' },
          { label: student.name },
        ]}
        moduleColor="students"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCollectFeeOpen(true)}>
              <IndianRupee className="h-4 w-4 mr-2" />
              Collect Fee
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMessageOpen(true)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Message Parent
            </Button>
            <Button size="sm" onClick={() => navigate(`/students/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        }
      />

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={student.photoUrl} alt={student.name} />
              <AvatarFallback className="text-2xl">{getInitials(student.name)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{student.name}</h2>
                <Badge
                  variant={student.status === 'active' ? 'success' : 'secondary'}
                >
                  {student.status}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">
                {student.class} - {student.section} | Roll No: {student.rollNumber}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Admission No.</p>
                  <p className="font-mono font-medium">{student.admissionNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">{formatDate(student.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Blood Group</p>
                  <p className="font-medium">{student.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Admission Date</p>
                  <p className="font-medium">{formatDate(student.admissionDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="siblings">Siblings</TabsTrigger>
          <TabsTrigger value="idcard">ID Card</TabsTrigger>
          <TabsTrigger value="hostel">Hostel</TabsTrigger>
          <TabsTrigger value="alumni">Alumni</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <InfoRow icon={Mail} label="Email" value={student.email} />
                <InfoRow icon={Phone} label="Phone" value={student.phone} />
                <InfoRow icon={User} label="Gender" value={student.gender.charAt(0).toUpperCase() + student.gender.slice(1)} />
                <InfoRow
                  icon={MapPin}
                  label="Address"
                  value={`${student.address.street}, ${student.address.city}, ${student.address.state} - ${student.address.pincode}`}
                />
              </CardContent>
            </Card>

            {/* Parent Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Parent/Guardian Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <InfoRow icon={User} label="Father's Name" value={student.parent.fatherName} />
                <InfoRow icon={User} label="Mother's Name" value={student.parent.motherName} />
                <InfoRow icon={Phone} label="Contact Number" value={student.parent.guardianPhone} />
                <InfoRow icon={Mail} label="Email" value={student.parent.guardianEmail} />
                <InfoRow icon={GraduationCap} label="Occupation" value={student.parent.occupation} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <StudentTimeline studentId={id!} />
        </TabsContent>

        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Academic Performance</CardTitle>
              <CardDescription>Exam marks and subject-wise performance</CardDescription>
            </CardHeader>
            <CardContent>
              {marksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (() => {
                const marks = marksResult?.data || []
                // Group marks by subject, use the latest per subject
                const subjectMap = new Map<string, { name: string; obtained: number; max: number }>()
                marks.forEach((m) => {
                  const existing = subjectMap.get(m.subjectId)
                  if (!existing || m.marksObtained > existing.obtained) {
                    subjectMap.set(m.subjectId, { name: m.subjectName, obtained: m.marksObtained, max: m.maxMarks })
                  }
                })
                const subjects = Array.from(subjectMap.values())
                return subjects.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No exam marks available</p>
                ) : (
                  <div className="space-y-4">
                    {subjects.map((s) => {
                      const pct = Math.round((s.obtained / s.max) * 100)
                      return (
                        <div key={s.name}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{s.name}</span>
                            <span className="text-sm text-muted-foreground">{s.obtained}/{s.max} ({pct}%)</span>
                          </div>
                          <Progress value={pct} className="h-2" />
                        </div>
                      )
                    })}
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Attendance Summary</CardTitle>
              <CardDescription>Current academic year attendance</CardDescription>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (() => {
                const att = attendanceResult?.data
                if (!att) return <p className="text-center py-8 text-muted-foreground">No attendance data available</p>
                return (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-module-attendance-light)' }}>
                      <p className="text-2xl font-bold" style={{ color: 'var(--color-module-attendance)' }}>{att.summary.attendancePercentage}%</p>
                      <p className="text-sm text-muted-foreground">Overall Attendance</p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-module-communication-light)' }}>
                      <p className="text-2xl font-bold" style={{ color: 'var(--color-module-communication)' }}>{att.summary.presentDays}</p>
                      <p className="text-sm text-muted-foreground">Days Present</p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-module-exams-light)' }}>
                      <p className="text-2xl font-bold" style={{ color: 'var(--color-module-exams)' }}>{att.summary.absentDays}</p>
                      <p className="text-sm text-muted-foreground">Days Absent</p>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fee Summary</CardTitle>
              <CardDescription>Current academic year fee status</CardDescription>
            </CardHeader>
            <CardContent>
              {feesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (() => {
                const fees = feesResult?.data || []
                const totalFees = fees.reduce((sum, f) => sum + f.totalAmount, 0)
                const totalPaid = fees.reduce((sum, f) => sum + f.paidAmount, 0)
                const totalPending = totalFees - totalPaid
                return fees.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No fee records available</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">Total Annual Fee</p>
                        <p className="text-sm text-muted-foreground">{fees[0]?.academicYear || ''}</p>
                      </div>
                      <p className="text-xl font-bold">{formatCurrency(totalFees)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Paid</p>
                        <p className="text-lg font-bold" style={{ color: 'var(--color-module-attendance)' }}>{formatCurrency(totalPaid)}</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Pending</p>
                        <p className="text-lg font-bold" style={{ color: 'var(--color-module-exams)' }}>{formatCurrency(totalPending)}</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <p className="font-medium mb-2">Fee Breakdown</p>
                      <div className="space-y-2">
                        {fees.map((fee) => (
                          <div key={fee.id} className="flex items-center justify-between py-2 text-sm">
                            <div>
                              <p className="font-medium">{fee.feeTypeName}</p>
                              <p className="text-xs text-muted-foreground">
                                Due: {formatDate(fee.dueDate)} &middot;{' '}
                                <Badge variant={fee.status === 'paid' ? 'success' : fee.status === 'partial' ? 'warning' : 'destructive'} className="text-[10px] px-1">
                                  {fee.status}
                                </Badge>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(fee.totalAmount)}</p>
                              {fee.paidAmount > 0 && (
                                <p className="text-xs" style={{ color: 'var(--color-module-attendance)' }}>Paid: {formatCurrency(fee.paidAmount)}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DocumentVault studentId={id!} />
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <HealthRecordCard studentId={id!} />
        </TabsContent>

        <TabsContent value="siblings" className="space-y-4">
          <SiblingCard studentId={id!} />
        </TabsContent>

        <TabsContent value="idcard" className="space-y-4">
          <IDCardPreview studentId={id!} />
        </TabsContent>

        <TabsContent value="hostel" className="space-y-4">
          <HostelStatusCard studentId={id!} />
        </TabsContent>

        <TabsContent value="alumni" className="space-y-4">
          <AlumniStatusCard
            studentId={id!}
            studentStatus={student.status}
            studentClass={student.class}
          />
        </TabsContent>
      </Tabs>

      {/* Collect Fee Dialog */}
      <CollectFeeDialog
        open={collectFeeOpen}
        onOpenChange={setCollectFeeOpen}
        student={{
          id: student.id,
          name: student.name,
          className: student.class,
          section: student.section,
          admissionNumber: student.admissionNumber,
        }}
      />

      {/* Message Parent Dialog */}
      <MessageParentDialog
        open={messageOpen}
        onOpenChange={setMessageOpen}
        student={{
          id: student.id,
          name: student.name,
          parent: student.parent,
        }}
      />
    </div>
  )
}
