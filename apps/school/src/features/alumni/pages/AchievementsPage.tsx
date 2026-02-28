import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Badge } from '@/components/ui/badge'
import { Plus, Trophy, Eye, EyeOff, Calendar } from 'lucide-react'
import {
  useAchievements,
  useCreateAchievement,
  usePublishAchievement,
  useAlumni,
} from '../hooks/useAlumni'
import {
  ACHIEVEMENT_CATEGORY_LABELS,
  type AchievementCategory,
} from '../types/alumni.types'
import { useToast } from '@/hooks/use-toast'

export function AchievementsPage() {
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

  const getCategoryColor = (category: AchievementCategory) => {
    switch (category) {
      case 'academic':
        return 'bg-blue-100 text-blue-800'
      case 'professional':
        return 'bg-purple-100 text-purple-800'
      case 'sports':
        return 'bg-green-100 text-green-800'
      case 'arts':
        return 'bg-pink-100 text-pink-800'
      case 'social':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div>
      <PageHeader
        title="Achievements"
        description="Celebrate alumni accomplishments and milestones"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Alumni', href: '/alumni' },
          { label: 'Achievements' },
        ]}
      />

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
                      <Badge className={getCategoryColor(achievement.category)}>
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
    </div>
  )
}
