import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Course } from '../types/lms.types'
import { COURSE_CATEGORY_LABELS, COURSE_LEVEL_LABELS } from '../types/lms.types'
import { difficultyColors, ratingColors } from '@/lib/design-tokens'

interface CourseCardProps {
  course: Course
  onClick?: () => void
}

const levelStyleMap: Record<Course['level'], { bg: string; text: string }> = {
  beginner: difficultyColors.easy,
  intermediate: difficultyColors.medium,
  advanced: difficultyColors.hard,
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)

export function CourseCard({ course, onClick }: CourseCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden transition-all cursor-pointer',
        'hover:ring-2 hover:ring-primary hover:shadow-md'
      )}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.parentElement!.classList.add(
                'bg-gradient-to-br',
                'from-muted',
                'to-muted-foreground/20'
              )
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20" />
        )}

        {/* Category badge - top left */}
        <Badge
          variant="secondary"
          className="absolute top-2 left-2 text-[10px] shadow-sm"
        >
          {COURSE_CATEGORY_LABELS[course.category]}
        </Badge>

        {/* Level badge - top right */}
        <Badge
          variant="outline"
          className="absolute top-2 right-2 text-[10px] shadow-sm border"
          style={{
            backgroundColor: levelStyleMap[course.level].bg,
            color: levelStyleMap[course.level].text,
          }}
        >
          {COURSE_LEVEL_LABELS[course.level]}
        </Badge>
      </div>

      <CardContent className="p-3 space-y-2">
        {/* Title */}
        <p className="font-semibold line-clamp-1" title={course.title}>
          {course.title}
        </p>

        {/* Status badge for non-published courses */}
        {course.status !== 'published' && (
          <Badge
            variant={course.status === 'draft' ? 'outline' : 'secondary'}
            className="text-[10px]"
          >
            {course.status === 'draft' ? 'Draft' : 'Archived'}
          </Badge>
        )}

        {/* Instructor */}
        <p className="text-sm text-muted-foreground line-clamp-1">
          {course.instructorName}
        </p>

        {/* Bottom row: price, rating, enrollments */}
        <div className="flex items-center justify-between text-sm pt-1">
          <span className="font-medium">{formatPrice(course.price)}</span>

          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {course.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {course.enrollmentCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
