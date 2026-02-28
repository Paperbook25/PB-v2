import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
} from 'lucide-react'
import { useAlumni, useAlumniStats, useCreateAlumni, useVerifyAlumni } from '../hooks/useAlumni'
import { formatCurrency } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { statusColors } from '@/lib/design-tokens'

export function AlumniPage() {
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
    <div>
      <PageHeader
        title="Alumni Directory"
        description="Manage alumni database, achievements, and engagement"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Alumni' }]}
      />

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
                            <Badge variant="success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
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
    </div>
  )
}
