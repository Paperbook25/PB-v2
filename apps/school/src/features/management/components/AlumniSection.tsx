import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  GraduationCap,
  Trophy,
  Heart,
  Search,
  Plus,
  CheckCircle,
  MapPin,
  Briefcase,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  ArrowRight,
  Video,
  ExternalLink,
  Play,
  XCircle,
} from 'lucide-react'
import {
  useAlumni,
  useAlumniStats,
  useCreateAlumni,
  useVerifyAlumni,
  useBatchStats,
  useAchievements,
  useCreateAchievement,
  usePublishAchievement,
  useContributions,
  useCreateContribution,
  useUpdateContributionStatus,
  useEvents,
  useCreateEvent,
  useUpdateEventStatus,
} from '@/features/alumni/hooks/useAlumni'
import {
  ACHIEVEMENT_CATEGORY_LABELS,
  CONTRIBUTION_TYPE_LABELS,
  CONTRIBUTION_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  EVENT_STATUS_LABELS,
  type AchievementCategory,
  type ContributionType,
  type ContributionStatus,
  type EventType,
  type EventStatus,
} from '@/features/alumni/types/alumni.types'
import { BatchGraduationDialog } from '@/features/alumni/components/BatchGraduationDialog'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import type { AlumniTab } from '../types/management.types'

interface AlumniSectionProps {
  activeTab: AlumniTab
  onTabChange: (tab: AlumniTab) => void
}

export function AlumniSection({ activeTab, onTabChange }: AlumniSectionProps) {
  return (
    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as AlumniTab)}>
      <TabsList variant="secondary" className="flex flex-wrap w-full">
        <TabsTrigger variant="secondary" value="directory" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Directory
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="batches" className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Batches
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="achievements" className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Achievements
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="contributions" className="flex items-center gap-2">
          <Heart className="h-4 w-4" />
          Contributions
        </TabsTrigger>
        <TabsTrigger variant="secondary" value="events" className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Events
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="directory" className="mt-0">
          <DirectoryTab />
        </TabsContent>

        <TabsContent value="batches" className="mt-0">
          <BatchesTab />
        </TabsContent>

        <TabsContent value="achievements" className="mt-0">
          <AchievementsTab />
        </TabsContent>

        <TabsContent value="contributions" className="mt-0">
          <ContributionsTab />
        </TabsContent>

        <TabsContent value="events" className="mt-0">
          <EventsTab />
        </TabsContent>
      </div>
    </Tabs>
  )
}

// ============================================
// Directory Tab Component
// ============================================
function DirectoryTab() {
  const [batchFilter, setBatchFilter] = useState<string>('')
  const [verifiedFilter, setVerifiedFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [page, setPage] = useState(1)

  const { data: statsResult } = useAlumniStats()
  const { data: alumniResult, isLoading } = useAlumni({
    batch: batchFilter && batchFilter !== 'all' ? batchFilter : undefined,
    isVerified: verifiedFilter && verifiedFilter !== 'all' ? verifiedFilter === 'true' : undefined,
    search: searchTerm || undefined,
    page,
    limit: 15,
  })
  const createAlumni = useCreateAlumni()
  const verifyAlumni = useVerifyAlumni()
  const { toast } = useToast()

  const stats = statsResult?.data
  const alumniList = alumniResult?.data || []
  const meta = alumniResult?.meta

  // Generate batch options (last 15 years)
  const currentYear = new Date().getFullYear()
  const batches = Array.from({ length: 15 }, (_, i) => String(currentYear - i))

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    batch: '',
    class: '12',
    section: 'A',
    rollNumber: '',
    currentCity: '',
    currentCountry: '',
    occupation: '',
    company: '',
    linkedIn: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createAlumni.mutateAsync(formData)
      toast({ title: 'Alumni registered successfully' })
      setIsDialogOpen(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        batch: '',
        class: '12',
        section: 'A',
        rollNumber: '',
        currentCity: '',
        currentCountry: '',
        occupation: '',
        company: '',
        linkedIn: '',
      })
    } catch {
      toast({ title: 'Failed to register alumni', variant: 'destructive' })
    }
  }

  const handleVerify = async (id: string) => {
    try {
      await verifyAlumni.mutateAsync(id)
      toast({ title: 'Alumni verified successfully' })
    } catch {
      toast({ title: 'Failed to verify alumni', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alumni</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAlumni || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.verifiedAlumni || 0} verified
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Batches</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.batchCount || 0}</div>
            <p className="text-xs text-muted-foreground">Years represented</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalAchievements || 0}</div>
            <p className="text-xs text-muted-foreground">Published achievements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributions</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.contributionAmount ? formatCurrency(stats.contributionAmount) : '₹0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalContributions || 0} contributions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Name, email, company..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label>Batch</Label>
              <Select
                value={batchFilter}
                onValueChange={(v) => {
                  setBatchFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Batches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch) => (
                    <SelectItem key={batch} value={batch}>
                      Batch of {batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={verifiedFilter}
                onValueChange={(v) => {
                  setVerifiedFilter(v)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Verified</SelectItem>
                  <SelectItem value="false">Pending Verification</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Alumni
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Register Alumni</DialogTitle>
                    <DialogDescription>Add a new alumni to the directory</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Full Name *</Label>
                          <Input
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="Full name"
                            required
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                            placeholder="email@example.com"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Batch *</Label>
                          <Select
                            value={formData.batch}
                            onValueChange={(v) => setFormData({ ...formData, batch: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select batch" />
                            </SelectTrigger>
                            <SelectContent>
                              {batches.map((batch) => (
                                <SelectItem key={batch} value={batch}>
                                  {batch}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Class</Label>
                          <Input
                            value={formData.class}
                            onChange={(e) =>
                              setFormData({ ...formData, class: e.target.value })
                            }
                            placeholder="12"
                          />
                        </div>
                        <div>
                          <Label>Section</Label>
                          <Input
                            value={formData.section}
                            onChange={(e) =>
                              setFormData({ ...formData, section: e.target.value })
                            }
                            placeholder="A"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Phone</Label>
                          <Input
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({ ...formData, phone: e.target.value })
                            }
                            placeholder="+91 9876543210"
                          />
                        </div>
                        <div>
                          <Label>Roll Number</Label>
                          <Input
                            value={formData.rollNumber}
                            onChange={(e) =>
                              setFormData({ ...formData, rollNumber: e.target.value })
                            }
                            placeholder="Roll number"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Current City</Label>
                          <Input
                            value={formData.currentCity}
                            onChange={(e) =>
                              setFormData({ ...formData, currentCity: e.target.value })
                            }
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <Label>Country</Label>
                          <Input
                            value={formData.currentCountry}
                            onChange={(e) =>
                              setFormData({ ...formData, currentCountry: e.target.value })
                            }
                            placeholder="Country"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Occupation</Label>
                          <Input
                            value={formData.occupation}
                            onChange={(e) =>
                              setFormData({ ...formData, occupation: e.target.value })
                            }
                            placeholder="e.g., Software Engineer"
                          />
                        </div>
                        <div>
                          <Label>Company</Label>
                          <Input
                            value={formData.company}
                            onChange={(e) =>
                              setFormData({ ...formData, company: e.target.value })
                            }
                            placeholder="Company name"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>LinkedIn Profile</Label>
                        <Input
                          value={formData.linkedIn}
                          onChange={(e) =>
                            setFormData({ ...formData, linkedIn: e.target.value })
                          }
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createAlumni.isPending}>
                        {createAlumni.isPending ? 'Registering...' : 'Register Alumni'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alumni Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading alumni...</div>
          ) : alumniList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No alumni found. Try adjusting your filters.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alumni</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Profession</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alumniList.map((alumnus) => (
                    <TableRow key={alumnus.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={alumnus.photo} />
                            <AvatarFallback>
                              {alumnus.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{alumnus.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Class {alumnus.class}-{alumnus.section}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{alumnus.batch}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{alumnus.email}</p>
                          {alumnus.phone && (
                            <p className="text-muted-foreground">{alumnus.phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {alumnus.currentCity || alumnus.currentCountry ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {[alumnus.currentCity, alumnus.currentCountry]
                              .filter(Boolean)
                              .join(', ')}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {alumnus.occupation ? (
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {alumnus.occupation}
                            </div>
                            {alumnus.company && (
                              <p className="text-muted-foreground">{alumnus.company}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {alumnus.isVerified ? (
                          <Badge style={{ backgroundColor: 'var(--color-module-attendance-light)', color: 'var(--color-module-attendance)' }}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge style={{ backgroundColor: 'var(--color-module-finance-light)', color: 'var(--color-module-finance)' }}>Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {!alumnus.isVerified && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerify(alumnus.id)}
                            disabled={verifyAlumni.isPending}
                          >
                            Verify
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {meta && meta.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(page - 1) * meta.limit + 1} to{' '}
                    {Math.min(page * meta.limit, meta.total)} of {meta.total} alumni
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                      disabled={page === meta.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Batches Tab Component
// ============================================
function BatchesTab() {
  const { data: batchStatsResult, isLoading } = useBatchStats()
  const [graduationDialogOpen, setGraduationDialogOpen] = useState(false)

  const batchStats = batchStatsResult?.data || []

  type BatchStatItem = typeof batchStats extends (infer U)[] ? U : never

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setGraduationDialogOpen(true)}>
          <GraduationCap className="h-4 w-4 mr-2" />
          Graduate Batch
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading batches...</div>
      ) : batchStats.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No batch data available.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {batchStats.map((batch: BatchStatItem) => {
            const verificationRate =
              batch.totalAlumni > 0
                ? Math.round((batch.verifiedAlumni / batch.totalAlumni) * 100)
                : 0

            return (
              <Card key={batch.batch} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">Batch of {batch.batch}</CardTitle>
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {batch.totalAlumni}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Verification Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Verification Rate</span>
                      <span className="font-medium">{verificationRate}%</span>
                    </div>
                    <Progress value={verificationRate} className="h-2" />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-alumni-light)' }}>
                        <Users className="h-4 w-4" style={{ color: 'var(--color-module-alumni)' }} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="font-medium">{batch.totalAlumni}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-attendance-light)' }}>
                        <CheckCircle className="h-4 w-4" style={{ color: 'var(--color-module-attendance)' }} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Verified</p>
                        <p className="font-medium">{batch.verifiedAlumni}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-finance-light)' }}>
                        <Trophy className="h-4 w-4" style={{ color: 'var(--color-module-finance)' }} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Achievements</p>
                        <p className="font-medium">{batch.achievements}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-parent-portal-light)' }}>
                        <Heart className="h-4 w-4" style={{ color: 'var(--color-module-parent-portal)' }} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contributions</p>
                        <p className="font-medium">{batch.contributions}</p>
                      </div>
                    </div>
                  </div>

                  {/* View Link */}
                  <Link
                    to={`/management?section=alumni&tab=directory&batch=${batch.batch}`}
                    className="block text-center text-sm text-primary hover:underline pt-2"
                  >
                    View all alumni from this batch →
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <BatchGraduationDialog
        open={graduationDialogOpen}
        onOpenChange={setGraduationDialogOpen}
      />
    </div>
  )
}

// ============================================
// Achievements Tab Component
// ============================================
function AchievementsTab() {
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [publishedFilter, setPublishedFilter] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: achievementsResult, isLoading } = useAchievements({
    category: categoryFilter && categoryFilter !== 'all' ? categoryFilter as AchievementCategory : undefined,
    isPublished: publishedFilter && publishedFilter !== 'all' ? publishedFilter === 'true' : undefined,
  })
  const { data: alumniResult } = useAlumni({ limit: 200 })
  const createAchievement = useCreateAchievement()
  const publishAchievement = usePublishAchievement()
  const { toast } = useToast()

  const achievements = achievementsResult?.data || []
  const alumniList = alumniResult?.data || []

  type Achievement = typeof achievements extends (infer U)[] ? U : never
  type AlumniMember = typeof alumniList extends (infer U)[] ? U : never

  const [formData, setFormData] = useState({
    alumniId: '',
    title: '',
    description: '',
    category: 'professional' as AchievementCategory,
    date: new Date().toISOString().split('T')[0],
    isPublished: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createAchievement.mutateAsync(formData)
      toast({ title: 'Achievement added successfully' })
      setIsDialogOpen(false)
      setFormData({
        alumniId: '',
        title: '',
        description: '',
        category: 'professional',
        date: new Date().toISOString().split('T')[0],
        isPublished: true,
      })
    } catch {
      toast({ title: 'Failed to add achievement', variant: 'destructive' })
    }
  }

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      await publishAchievement.mutateAsync({ id, isPublished: !currentStatus })
      toast({ title: currentStatus ? 'Achievement unpublished' : 'Achievement published' })
    } catch {
      toast({ title: 'Failed to update achievement', variant: 'destructive' })
    }
  }

  const getCategoryStyle = (category: AchievementCategory) => {
    switch (category) {
      case 'academic':
        return { backgroundColor: 'var(--color-module-students-light)', color: 'var(--color-module-students)' }
      case 'professional':
        return { backgroundColor: 'var(--color-module-integrations-light)', color: 'var(--color-module-integrations)' }
      case 'sports':
        return { backgroundColor: 'var(--color-module-attendance-light)', color: 'var(--color-module-attendance)' }
      case 'arts':
        return { backgroundColor: 'var(--color-module-parent-portal-light)', color: 'var(--color-module-parent-portal)' }
      case 'social':
        return { backgroundColor: 'var(--color-module-finance-light)', color: 'var(--color-module-finance)' }
      default:
        return { backgroundColor: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(ACHIEVEMENT_CATEGORY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={publishedFilter} onValueChange={setPublishedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Published</SelectItem>
                  <SelectItem value="false">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Achievement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add Achievement</DialogTitle>
                    <DialogDescription>Record an alumni accomplishment</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Alumni *</Label>
                        <Select
                          value={formData.alumniId}
                          onValueChange={(v) => setFormData({ ...formData, alumniId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select alumni" />
                          </SelectTrigger>
                          <SelectContent>
                            {alumniList.map((a: AlumniMember) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.name} ({a.batch})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Title *</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          placeholder="Achievement title"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Category *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(v) =>
                              setFormData({ ...formData, category: v as AchievementCategory })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(ACHIEVEMENT_CATEGORY_LABELS).map(
                                ([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Date *</Label>
                          <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                              setFormData({ ...formData, date: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Description *</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          placeholder="Describe the achievement"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isPublished"
                          checked={formData.isPublished}
                          onChange={(e) =>
                            setFormData({ ...formData, isPublished: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        <Label htmlFor="isPublished" className="font-normal">
                          Publish immediately
                        </Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createAchievement.isPending}>
                        {createAchievement.isPending ? 'Adding...' : 'Add Achievement'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Grid */}
      {isLoading ? (
        <div className="text-center py-8">Loading achievements...</div>
      ) : achievements.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              No achievements found. Add your first achievement.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement: Achievement) => (
            <Card key={achievement.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    </div>
                    <Badge style={getCategoryStyle(achievement.category)}>
                      {ACHIEVEMENT_CATEGORY_LABELS[achievement.category]}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleTogglePublish(achievement.id, achievement.isPublished)
                    }
                    disabled={publishAchievement.isPending}
                  >
                    {achievement.isPublished ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.alumniName}</p>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {achievement.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(achievement.date).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {achievement.addedBy === 'self' ? 'Self-reported' : 'Admin added'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// Contributions Tab Component
// ============================================
function ContributionsTab() {
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: contributionsResult, isLoading } = useContributions({
    type: typeFilter && typeFilter !== 'all' ? typeFilter as ContributionType : undefined,
    status: statusFilter && statusFilter !== 'all' ? statusFilter as ContributionStatus : undefined,
  })
  const { data: alumniResult } = useAlumni({ isVerified: true, limit: 200 })
  const createContribution = useCreateContribution()
  const updateStatus = useUpdateContributionStatus()
  const { toast } = useToast()

  const contributions = contributionsResult?.data || []
  const alumniList = alumniResult?.data || []

  type Contribution = typeof contributions extends (infer U)[] ? U : never
  type AlumniMember = typeof alumniList extends (infer U)[] ? U : never

  // Calculate summary stats
  const totalPledged = contributions
    .filter((c: Contribution) => c.status === 'pledged' && c.amount)
    .reduce((sum: number, c: Contribution) => sum + (c.amount || 0), 0)
  const totalReceived = contributions
    .filter((c: Contribution) => c.status === 'received' && c.amount)
    .reduce((sum: number, c: Contribution) => sum + (c.amount || 0), 0)
  const totalUtilized = contributions
    .filter((c: Contribution) => c.status === 'utilized' && c.amount)
    .reduce((sum: number, c: Contribution) => sum + (c.amount || 0), 0)

  const [formData, setFormData] = useState({
    alumniId: '',
    type: 'monetary' as ContributionType,
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createContribution.mutateAsync({
        ...formData,
        amount: formData.amount ? parseInt(formData.amount) : undefined,
      })
      toast({ title: 'Contribution recorded successfully' })
      setIsDialogOpen(false)
      setFormData({
        alumniId: '',
        type: 'monetary',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
      })
    } catch {
      toast({ title: 'Failed to record contribution', variant: 'destructive' })
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: ContributionStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus })
      toast({ title: `Status updated to ${CONTRIBUTION_STATUS_LABELS[newStatus]}` })
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' })
    }
  }

  const getStatusStyle = (status: ContributionStatus) => {
    switch (status) {
      case 'pledged':
        return { backgroundColor: 'var(--color-module-finance-light)', color: 'var(--color-module-finance)' }
      case 'received':
        return { backgroundColor: 'var(--color-module-communication-light)', color: 'var(--color-module-communication)' }
      case 'utilized':
        return { backgroundColor: 'var(--color-module-attendance-light)', color: 'var(--color-module-attendance)' }
      default:
        return { backgroundColor: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }
    }
  }

  const getNextStatus = (
    current: ContributionStatus
  ): { status: ContributionStatus; label: string } | null => {
    switch (current) {
      case 'pledged':
        return { status: 'received', label: 'Mark Received' }
      case 'received':
        return { status: 'utilized', label: 'Mark Utilized' }
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pledged</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPledged)}</div>
            <p className="text-xs text-muted-foreground">Awaiting collection</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
            <Heart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalReceived)}</div>
            <p className="text-xs text-muted-foreground">Ready for utilization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilized</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalUtilized)}</div>
            <p className="text-xs text-muted-foreground">Applied to programs</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(CONTRIBUTION_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(CONTRIBUTION_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Record Contribution
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Record Contribution</DialogTitle>
                    <DialogDescription>
                      Record a new alumni contribution or pledge
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Alumni *</Label>
                        <Select
                          value={formData.alumniId}
                          onValueChange={(v) => setFormData({ ...formData, alumniId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select verified alumni" />
                          </SelectTrigger>
                          <SelectContent>
                            {alumniList.map((a: AlumniMember) => (
                              <SelectItem key={a.id} value={a.id}>
                                {a.name} ({a.batch})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Type *</Label>
                          <Select
                            value={formData.type}
                            onValueChange={(v) =>
                              setFormData({ ...formData, type: v as ContributionType })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(CONTRIBUTION_TYPE_LABELS).map(
                                ([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Date *</Label>
                          <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                              setFormData({ ...formData, date: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                      {(formData.type === 'monetary' || formData.type === 'scholarship') && (
                        <div>
                          <Label>Amount (₹)</Label>
                          <Input
                            type="number"
                            value={formData.amount}
                            onChange={(e) =>
                              setFormData({ ...formData, amount: e.target.value })
                            }
                            placeholder="Enter amount"
                          />
                        </div>
                      )}
                      <div>
                        <Label>Description *</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          placeholder="Describe the contribution"
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createContribution.isPending}>
                        {createContribution.isPending ? 'Recording...' : 'Record Contribution'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contributions Table */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Loading contributions...</div>
          ) : contributions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No contributions found. Record your first contribution.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumni</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributions.map((contribution: Contribution) => {
                  const nextAction = getNextStatus(contribution.status)
                  return (
                    <TableRow key={contribution.id}>
                      <TableCell className="font-medium">{contribution.alumniName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {CONTRIBUTION_TYPE_LABELS[contribution.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {contribution.description}
                      </TableCell>
                      <TableCell>
                        {contribution.amount ? formatCurrency(contribution.amount) : '-'}
                      </TableCell>
                      <TableCell>
                        {new Date(contribution.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge style={getStatusStyle(contribution.status)}>
                          {CONTRIBUTION_STATUS_LABELS[contribution.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {nextAction && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleStatusUpdate(contribution.id, nextAction.status)
                            }
                            disabled={updateStatus.isPending}
                          >
                            <ArrowRight className="h-3 w-3 mr-1" />
                            {nextAction.label}
                          </Button>
                        )}
                        {contribution.acknowledgement && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {contribution.acknowledgement}
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Events Tab Component
// ============================================
function EventsTab() {
  const [typeFilter, setTypeFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const { data: eventsResult, isLoading } = useEvents({
    type: typeFilter && typeFilter !== 'all' ? typeFilter as EventType : undefined,
    status: statusFilter && statusFilter !== 'all' ? statusFilter as EventStatus : undefined,
  })
  const createEvent = useCreateEvent()
  const updateStatus = useUpdateEventStatus()
  const { toast } = useToast()

  const events = eventsResult?.data || []

  type Event = typeof events extends (infer U)[] ? U : never

  // Generate batch options
  const currentYear = new Date().getFullYear()
  const batches = Array.from({ length: 15 }, (_, i) => String(currentYear - i))

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'meet' as EventType,
    date: '',
    venue: '',
    isVirtual: false,
    meetingLink: '',
    targetBatches: [] as string[],
    maxCapacity: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createEvent.mutateAsync({
        ...formData,
        maxCapacity: formData.maxCapacity ? parseInt(formData.maxCapacity) : undefined,
      })
      toast({ title: 'Event created successfully' })
      setIsDialogOpen(false)
      setFormData({
        title: '',
        description: '',
        type: 'meet',
        date: '',
        venue: '',
        isVirtual: false,
        meetingLink: '',
        targetBatches: [],
        maxCapacity: '',
      })
    } catch {
      toast({ title: 'Failed to create event', variant: 'destructive' })
    }
  }

  const handleStatusUpdate = async (id: string, newStatus: EventStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus })
      toast({ title: `Event ${EVENT_STATUS_LABELS[newStatus].toLowerCase()}` })
    } catch {
      toast({ title: 'Failed to update event', variant: 'destructive' })
    }
  }

  const toggleBatch = (batch: string) => {
    setFormData((prev) => ({
      ...prev,
      targetBatches: prev.targetBatches.includes(batch)
        ? prev.targetBatches.filter((b) => b !== batch)
        : [...prev.targetBatches, batch],
    }))
  }

  const getEventStatusStyle = (status: EventStatus) => {
    switch (status) {
      case 'upcoming':
        return { backgroundColor: 'var(--color-module-communication-light)', color: 'var(--color-module-communication)' }
      case 'ongoing':
        return { backgroundColor: 'var(--color-module-attendance-light)', color: 'var(--color-module-attendance)' }
      case 'completed':
        return { backgroundColor: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }
      case 'cancelled':
        return { backgroundColor: 'var(--color-module-exams-light)', color: 'var(--color-module-exams)' }
      default:
        return { backgroundColor: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }
    }
  }

  const getTypeStyle = (type: EventType) => {
    switch (type) {
      case 'reunion':
        return { backgroundColor: 'var(--color-module-integrations-light)', color: 'var(--color-module-integrations)' }
      case 'meet':
        return { backgroundColor: 'var(--color-module-communication-light)', color: 'var(--color-module-communication)' }
      case 'webinar':
        return { backgroundColor: 'var(--color-module-alumni-light)', color: 'var(--color-module-alumni)' }
      case 'fundraiser':
        return { backgroundColor: 'var(--color-module-parent-portal-light)', color: 'var(--color-module-parent-portal)' }
      case 'sports':
        return { backgroundColor: 'var(--color-module-attendance-light)', color: 'var(--color-module-attendance)' }
      default:
        return { backgroundColor: 'var(--color-muted)', color: 'var(--color-muted-foreground)' }
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.entries(EVENT_STATUS_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Event</DialogTitle>
                    <DialogDescription>
                      Schedule a new alumni event or gathering
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Event Title *</Label>
                        <Input
                          value={formData.title}
                          onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                          }
                          placeholder="e.g., Annual Alumni Reunion 2024"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Type *</Label>
                          <Select
                            value={formData.type}
                            onValueChange={(v) =>
                              setFormData({ ...formData, type: v as EventType })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Date *</Label>
                          <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                              setFormData({ ...formData, date: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Venue</Label>
                          <Input
                            value={formData.venue}
                            onChange={(e) =>
                              setFormData({ ...formData, venue: e.target.value })
                            }
                            placeholder="Location or address"
                          />
                        </div>
                        <div>
                          <Label>Max Capacity</Label>
                          <Input
                            type="number"
                            value={formData.maxCapacity}
                            onChange={(e) =>
                              setFormData({ ...formData, maxCapacity: e.target.value })
                            }
                            placeholder="Leave empty for unlimited"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isVirtual"
                            checked={formData.isVirtual}
                            onChange={(e) =>
                              setFormData({ ...formData, isVirtual: e.target.checked })
                            }
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <Label htmlFor="isVirtual" className="font-normal">
                            Virtual / Online Event
                          </Label>
                        </div>
                      </div>
                      {formData.isVirtual && (
                        <div>
                          <Label>Meeting Link</Label>
                          <Input
                            value={formData.meetingLink}
                            onChange={(e) =>
                              setFormData({ ...formData, meetingLink: e.target.value })
                            }
                            placeholder="https://meet.google.com/..."
                          />
                        </div>
                      )}
                      <div>
                        <Label>Target Batches</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {batches.slice(0, 10).map((batch) => (
                            <Badge
                              key={batch}
                              variant={
                                formData.targetBatches.includes(batch) ? 'default' : 'outline'
                              }
                              className="cursor-pointer"
                              onClick={() => toggleBatch(batch)}
                            >
                              {batch}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty to invite all batches
                        </p>
                      </div>
                      <div>
                        <Label>Description *</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          placeholder="Event details and agenda"
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={createEvent.isPending}>
                        {createEvent.isPending ? 'Creating...' : 'Create Event'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {isLoading ? (
        <div className="text-center py-8">Loading events...</div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              No events found. Create your first event.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event: Event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <Badge style={getTypeStyle(event.type)}>
                    {EVENT_TYPE_LABELS[event.type]}
                  </Badge>
                  <Badge style={getEventStatusStyle(event.status)}>
                    {EVENT_STATUS_LABELS[event.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <h3 className="font-semibold text-lg">{event.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(event.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  {event.venue && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {event.venue}
                    </div>
                  )}
                  {event.isVirtual && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Video className="h-4 w-4" />
                      Virtual Event
                      {event.meetingLink && (
                        <a
                          href={event.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline inline-flex items-center"
                        >
                          Join <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {event.registeredCount} registered
                    {event.maxCapacity && ` / ${event.maxCapacity} max`}
                  </div>
                </div>

                {event.targetBatches.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {event.targetBatches.slice(0, 4).map((batch: string) => (
                      <Badge key={batch} variant="outline" className="text-xs">
                        {batch}
                      </Badge>
                    ))}
                    {event.targetBatches.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{event.targetBatches.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {event.status === 'upcoming' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(event.id, 'ongoing')}
                      disabled={updateStatus.isPending}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(event.id, 'cancelled')}
                      disabled={updateStatus.isPending}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
                {event.status === 'ongoing' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(event.id, 'completed')}
                    disabled={updateStatus.isPending}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Mark Completed
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
