import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  GraduationCap,
  Building,
  Briefcase,
  MapPin,
  Calendar,
  Mail,
  Phone,
  CheckCircle2,
  ExternalLink,
  Trophy,
  Heart,
  Loader2,
} from 'lucide-react'
import { useStudentAlumniRecord } from '../hooks/useStudents'
import { useGraduateStudent, useContributions, useAchievements } from '@/features/alumni/hooks/useAlumni'
import { CONTRIBUTION_TYPE_LABELS, ACHIEVEMENT_CATEGORY_LABELS } from '@/features/alumni/types/alumni.types'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

interface AlumniStatusCardProps {
  studentId: string
  studentStatus: 'active' | 'inactive' | 'graduated' | 'transferred'
  studentClass?: string
}

export function AlumniStatusCard({ studentId, studentStatus, studentClass }: AlumniStatusCardProps) {
  const { data: alumniResponse, isLoading } = useStudentAlumniRecord(studentId)
  const alumni = alumniResponse?.data
  const graduateStudent = useGraduateStudent()
  const { toast } = useToast()

  // Fetch contributions and achievements for alumni
  const { data: contributionsResult, isLoading: contributionsLoading } = useContributions(
    alumni ? { alumniId: alumni.id } : undefined
  )
  const { data: achievementsResult, isLoading: achievementsLoading } = useAchievements(
    alumni ? { alumniId: alumni.id } : undefined
  )

  const contributions = contributionsResult?.data || []
  const achievements = achievementsResult?.data || []
  const totalContributed = contributions
    .filter((c) => c.status === 'received' || c.status === 'utilized')
    .reduce((sum, c) => sum + (c.amount || 0), 0)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    batchYear: String(new Date().getFullYear()),
    occupation: '',
    company: '',
    currentCity: '',
    currentCountry: 'India',
  })

  const handleGraduate = async () => {
    try {
      await graduateStudent.mutateAsync({
        studentId,
        ...formData,
      })
      toast({ title: 'Student graduated successfully' })
      setDialogOpen(false)
    } catch {
      toast({ title: 'Failed to graduate student', variant: 'destructive' })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alumni Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show alumni record if exists
  if (alumni) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Alumni Record</CardTitle>
              <CardDescription>Batch of {alumni.batch}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {alumni.isVerified && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              <Badge variant="secondary">Alumnus</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{alumni.email}</p>
                </div>
              </div>

              {alumni.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{alumni.phone}</p>
                  </div>
                </div>
              )}

              {(alumni.currentCity || alumni.currentCountry) && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">
                      {[alumni.currentCity, alumni.currentCountry].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Professional Info */}
            <div className="space-y-4">
              {alumni.occupation && (
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Occupation</p>
                    <p className="font-medium">{alumni.occupation}</p>
                  </div>
                </div>
              )}

              {alumni.company && (
                <div className="flex items-start gap-3">
                  <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{alumni.company}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p className="font-medium">{formatDate(alumni.registeredAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {alumni.linkedIn && (
            <div className="mt-4 pt-4 border-t">
              <a
                href={alumni.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                View LinkedIn Profile
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          <Separator className="my-6" />

          {/* Contributions & Achievements */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Contributions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  <h4 className="font-medium">Contributions</h4>
                </div>
                {totalContributed > 0 && (
                  <Badge variant="outline" className="text-pink-600">
                    {formatCurrency(totalContributed)}
                  </Badge>
                )}
              </div>
              {contributionsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : contributions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contributions yet</p>
              ) : (
                <div className="space-y-2">
                  {contributions.slice(0, 3).map((c) => (
                    <div key={c.id} className="text-sm p-2 bg-muted rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{CONTRIBUTION_TYPE_LABELS[c.type]}</span>
                        {c.amount && (
                          <span className="text-muted-foreground">{formatCurrency(c.amount)}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{c.description}</p>
                    </div>
                  ))}
                  {contributions.length > 3 && (
                    <Button asChild variant="link" size="sm" className="h-auto p-0">
                      <Link to="/alumni/contributions">+{contributions.length - 3} more</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Achievements */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <h4 className="font-medium">Achievements</h4>
                {achievements.length > 0 && (
                  <Badge variant="outline">{achievements.length}</Badge>
                )}
              </div>
              {achievementsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : achievements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No achievements yet</p>
              ) : (
                <div className="space-y-2">
                  {achievements.slice(0, 3).map((a) => (
                    <div key={a.id} className="text-sm p-2 bg-muted rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">{a.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {ACHIEVEMENT_CATEGORY_LABELS[a.category]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(a.date)}</p>
                    </div>
                  ))}
                  {achievements.length > 3 && (
                    <Button asChild variant="link" size="sm" className="h-auto p-0">
                      <Link to="/alumni/achievements">+{achievements.length - 3} more</Link>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={`/alumni?search=${encodeURIComponent(alumni.name)}`}>
                View in Alumni Directory
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/alumni/contributions">Manage Contributions</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/alumni/achievements">Manage Achievements</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Student is graduated but no alumni record (edge case)
  if (studentStatus === 'graduated') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alumni Status</CardTitle>
          <CardDescription>Student has graduated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              This student has graduated but doesn't have an alumni record yet.
            </p>
            <Button asChild variant="outline">
              <Link to="/alumni">Go to Alumni Directory</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show graduation option for Class 12 active students
  const isEligibleForGraduation = studentStatus === 'active' && studentClass === 'Class 12'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Alumni Status</CardTitle>
        <CardDescription>
          {isEligibleForGraduation
            ? 'This student is eligible for graduation'
            : 'Student has not graduated yet'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          {isEligibleForGraduation ? (
            <>
              <p className="text-muted-foreground mb-4">
                Class 12 student. Ready to be graduated and added to the alumni directory.
              </p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Graduate Student
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Graduate Student</DialogTitle>
                    <DialogDescription>
                      This will update the student's status to graduated and create an alumni record.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Batch Year</Label>
                        <Input
                          type="number"
                          value={formData.batchYear}
                          onChange={(e) =>
                            setFormData({ ...formData, batchYear: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Current Country</Label>
                        <Input
                          value={formData.currentCountry}
                          onChange={(e) =>
                            setFormData({ ...formData, currentCountry: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Current City (Optional)</Label>
                      <Input
                        value={formData.currentCity}
                        onChange={(e) =>
                          setFormData({ ...formData, currentCity: e.target.value })
                        }
                        placeholder="e.g., Bangalore"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Occupation (Optional)</Label>
                        <Input
                          value={formData.occupation}
                          onChange={(e) =>
                            setFormData({ ...formData, occupation: e.target.value })
                          }
                          placeholder="e.g., Engineering Student"
                        />
                      </div>
                      <div>
                        <Label>Company/College (Optional)</Label>
                        <Input
                          value={formData.company}
                          onChange={(e) =>
                            setFormData({ ...formData, company: e.target.value })
                          }
                          placeholder="e.g., IIT Delhi"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleGraduate} disabled={graduateStudent.isPending}>
                      {graduateStudent.isPending ? 'Graduating...' : 'Graduate'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <p className="text-muted-foreground">
              This student is not yet eligible for graduation. Only Class 12 active students can be
              graduated.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
