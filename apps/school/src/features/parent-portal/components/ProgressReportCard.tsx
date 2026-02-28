import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, Award, Calendar, User } from 'lucide-react'
import { useProgressReports } from '../hooks/useParentPortal'
import type { ProgressReport } from '../types/parent-portal.types'

interface ProgressReportCardProps {
  studentId?: string
  onViewFull?: (report: ProgressReport) => void
}

export function ProgressReportCard({ studentId, onViewFull }: ProgressReportCardProps) {
  const { data: result, isLoading } = useProgressReports(studentId)
  const reports = result?.data ?? []
  const latestReport = reports[0]

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!latestReport) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Progress Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No progress reports available
          </p>
        </CardContent>
      </Card>
    )
  }

  const getBehaviorColor = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'bg-green-100 text-green-800'
      case 'good':
        return 'bg-blue-100 text-blue-800'
      case 'satisfactory':
        return 'bg-yellow-100 text-yellow-800'
      case 'needs_improvement':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Latest Progress Report
        </CardTitle>
        {onViewFull && (
          <button
            onClick={() => onViewFull(latestReport)}
            className="text-sm text-primary hover:underline"
          >
            View Full Report
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Header Info */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{latestReport.studentName}</p>
            <p className="text-sm text-muted-foreground">
              {latestReport.studentClass} • {latestReport.term} ({latestReport.academicYear})
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">{latestReport.overallPercentage}%</div>
            <Badge className="bg-primary/10 text-primary">Grade {latestReport.overallGrade}</Badge>
          </div>
        </div>

        {/* Subject Progress */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground">Subject Performance</h4>
          {latestReport.subjects.slice(0, 4).map((subject) => (
            <div key={subject.subjectId} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{subject.subjectName}</span>
                <span className="font-medium">{subject.percentage}%</span>
              </div>
              <Progress value={subject.percentage} className="h-2" />
            </div>
          ))}
          {latestReport.subjects.length > 4 && (
            <p className="text-sm text-muted-foreground">
              +{latestReport.subjects.length - 4} more subjects
            </p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <Calendar className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <div className="text-xl font-semibold">{latestReport.attendance.percentage}%</div>
            <p className="text-xs text-muted-foreground">Attendance</p>
          </div>
          <div className="text-center">
            <Award className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <Badge className={getBehaviorColor(latestReport.behavior.rating)}>
              {latestReport.behavior.rating.replace('_', ' ')}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">Behavior</p>
          </div>
          <div className="text-center">
            <User className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <div className="text-xl font-semibold">{latestReport.subjects.length}</div>
            <p className="text-xs text-muted-foreground">Subjects</p>
          </div>
        </div>

        {/* Teacher Remarks */}
        {latestReport.teacherRemarks && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">Teacher Remarks</h4>
            <p className="text-sm italic text-muted-foreground">
              "{latestReport.teacherRemarks}"
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
