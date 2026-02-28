import { useState } from 'react'
import {
  Star,
  Plus,
  ChevronDown,
  ChevronUp,
  Loader2,
  ClipboardCheck,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  useStaffPerformanceReviews,
  useCreatePerformanceReview,
  useAcknowledgeReview,
} from '../hooks/useStaff'
import type {
  PerformanceReview,
  ReviewPeriod,
  PerformanceRating,
  CreatePerformanceReview,
} from '../types/staff.types'
import {
  REVIEW_PERIOD_LABELS,
  PERFORMANCE_CATEGORIES,
} from '../types/staff.types'
import { statusColors, ratingColors } from '@/lib/design-tokens'

interface PerformanceReviewCardProps {
  staffId: string
}

const STATUS_VARIANTS: Record<string, { variant: 'secondary' | 'default' | 'outline'; label: string }> = {
  draft: { variant: 'secondary', label: 'Draft' },
  submitted: { variant: 'default', label: 'Submitted' },
  acknowledged: { variant: 'outline', label: 'Acknowledged' },
}

const reviewStatusStyles: Record<string, { bg: string; text: string }> = {
  draft: { bg: statusColors.inactiveLight, text: statusColors.inactive },
  submitted: { bg: statusColors.infoLight, text: statusColors.info },
  acknowledged: { bg: statusColors.successLight, text: statusColors.success },
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="h-3.5 w-3.5"
          style={{
            fill: i < Math.round(rating) ? ratingColors.star : 'transparent',
            color: i < Math.round(rating) ? ratingColors.star : ratingColors.starEmpty,
            opacity: i < Math.round(rating) ? 1 : 0.3,
          }}
        />
      ))}
      <span className="ml-1.5 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  )
}

function ReviewSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
            <Skeleton className="h-5 w-20 rounded-md" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  )
}

function ReviewFormDialog({
  open,
  onOpenChange,
  onSubmit,
  isPending,
  staffId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreatePerformanceReview) => void
  isPending: boolean
  staffId: string
}) {
  const currentYear = new Date().getFullYear()
  const [period, setPeriod] = useState<ReviewPeriod | ''>('')
  const [year, setYear] = useState(currentYear)
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(PERFORMANCE_CATEGORIES.map((c) => [c, 3]))
  )
  const [strengths, setStrengths] = useState('')
  const [areasOfImprovement, setAreasOfImprovement] = useState('')
  const [goals, setGoals] = useState('')

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const handleRatingChange = (category: string, value: string) => {
    setRatings((prev) => ({ ...prev, [category]: parseInt(value) }))
  }

  const handleSubmit = () => {
    if (!period) return

    const reviewRatings: PerformanceRating[] = PERFORMANCE_CATEGORIES.map(
      (category) => ({
        category,
        rating: ratings[category] || 3,
      })
    )

    onSubmit({
      staffId,
      period,
      year,
      ratings: reviewRatings,
      strengths,
      areasOfImprovement,
      goals,
    })
  }

  const handleClose = () => {
    setPeriod('')
    setYear(currentYear)
    setRatings(Object.fromEntries(PERFORMANCE_CATEGORIES.map((c) => [c, 3])))
    setStrengths('')
    setAreasOfImprovement('')
    setGoals('')
    onOpenChange(false)
  }

  const isValid = period && strengths.trim() && areasOfImprovement.trim() && goals.trim()

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Add Performance Review
          </DialogTitle>
          <DialogDescription>
            Create a new performance review for this staff member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Period and Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="period">Review Period *</Label>
              <Select value={period} onValueChange={(v) => setPeriod(v as ReviewPeriod)}>
                <SelectTrigger id="period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(REVIEW_PERIOD_LABELS) as ReviewPeriod[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {REVIEW_PERIOD_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Select value={String(year)} onValueChange={(v) => setYear(parseInt(v))}>
                <SelectTrigger id="year">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Category Ratings */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Category Ratings</Label>
            <div className="grid gap-3">
              {PERFORMANCE_CATEGORIES.map((category) => (
                <div
                  key={category}
                  className="flex items-center justify-between gap-4"
                >
                  <span className="text-sm min-w-[160px]">{category}</span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <Progress
                      value={(ratings[category] / 5) * 100}
                      className="h-2 max-w-[120px]"
                    />
                    <Select
                      value={String(ratings[category])}
                      onValueChange={(v) => handleRatingChange(category, v)}
                    >
                      <SelectTrigger className="w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {n}/5
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Strengths */}
          <div className="space-y-2">
            <Label htmlFor="strengths">Strengths *</Label>
            <Textarea
              id="strengths"
              placeholder="Highlight the staff member's key strengths..."
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              rows={3}
            />
          </div>

          {/* Areas of Improvement */}
          <div className="space-y-2">
            <Label htmlFor="improvement">Areas of Improvement *</Label>
            <Textarea
              id="improvement"
              placeholder="Identify areas where the staff member can improve..."
              value={areasOfImprovement}
              onChange={(e) => setAreasOfImprovement(e.target.value)}
              rows={3}
            />
          </div>

          {/* Goals */}
          <div className="space-y-2">
            <Label htmlFor="goals">Goals *</Label>
            <Textarea
              id="goals"
              placeholder="Set goals for the upcoming period..."
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Review'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ReviewDetail({ review }: { review: PerformanceReview }) {
  return (
    <div className="space-y-4 pt-3">
      {/* Category Ratings */}
      <div className="space-y-2.5">
        <p className="text-sm font-medium text-muted-foreground">Category Ratings</p>
        <div className="grid gap-2">
          {review.ratings.map((r) => (
            <div key={r.category} className="flex items-center gap-3">
              <span className="text-sm min-w-[160px]">{r.category}</span>
              <Progress value={(r.rating / 5) * 100} className="h-2 flex-1" />
              <span className="text-sm font-medium w-8 text-right">{r.rating}/5</span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Strengths */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-muted-foreground">Strengths</p>
        <p className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
          {review.strengths}
        </p>
      </div>

      {/* Areas of Improvement */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-muted-foreground">Areas of Improvement</p>
        <p className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
          {review.areasOfImprovement}
        </p>
      </div>

      {/* Goals */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-muted-foreground">Goals</p>
        <p className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">
          {review.goals}
        </p>
      </div>
    </div>
  )
}

export function PerformanceReviewCard({ staffId }: PerformanceReviewCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { toast } = useToast()
  const { data: reviewsResponse, isLoading, isError } = useStaffPerformanceReviews(staffId)
  const reviews = reviewsResponse?.data
  const createMutation = useCreatePerformanceReview()
  const acknowledgeMutation = useAcknowledgeReview()

  const handleCreate = async (data: CreatePerformanceReview) => {
    try {
      await createMutation.mutateAsync(data)
      toast({ title: 'Performance review created successfully' })
      setDialogOpen(false)
    } catch {
      toast({
        title: 'Failed to create performance review',
        variant: 'destructive',
      })
    }
  }

  const handleAcknowledge = async (reviewId: string) => {
    try {
      await acknowledgeMutation.mutateAsync(reviewId)
      toast({ title: 'Review acknowledged successfully' })
    } catch {
      toast({
        title: 'Failed to acknowledge review',
        variant: 'destructive',
      })
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          Performance Reviews
        </CardTitle>
        <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Review
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ReviewSkeleton />
        ) : isError ? (
          <div className="text-center py-8 text-destructive text-sm">
            Failed to load performance reviews. Please try again.
          </div>
        ) : !reviews || reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ClipboardCheck className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No performance reviews yet</p>
            <p className="text-xs mt-1">
              Create the first performance review for this staff member.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review: PerformanceReview) => (
              <div
                key={review.id}
                className="border rounded-lg overflow-hidden"
              >
                {/* Review Header */}
                <button
                  className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => toggleExpand(review.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">
                        {REVIEW_PERIOD_LABELS[review.period]}
                      </Badge>
                      <Badge variant="outline">{review.year}</Badge>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: reviewStatusStyles[review.status]?.bg,
                          color: reviewStatusStyles[review.status]?.text,
                        }}
                      >
                        {STATUS_VARIANTS[review.status]?.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.overallRating)}
                      {expandedId === review.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Reviewer: {review.reviewerName}</span>
                    <span>Created: {formatDate(review.createdAt)}</span>
                  </div>
                </button>

                {/* Expanded Detail */}
                {expandedId === review.id && (
                  <div className="px-4 pb-4 border-t">
                    <ReviewDetail review={review} />

                    {/* Acknowledge Button */}
                    {review.status === 'submitted' && (
                      <div className="mt-4 flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleAcknowledge(review.id)}
                          disabled={acknowledgeMutation.isPending}
                        >
                          {acknowledgeMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Acknowledging...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Acknowledge Review
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add Review Dialog */}
      <ReviewFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
        staffId={staffId}
      />
    </Card>
  )
}
