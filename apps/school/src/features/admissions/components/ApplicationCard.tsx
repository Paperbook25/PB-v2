import { Eye, MoreHorizontal, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getInitials, formatDate } from '@/lib/utils'
import type { Application, ApplicationStatus } from '../types/admission.types'
import { getStatusConfig, canTransitionTo } from '../types/admission.types'

interface ApplicationCardProps {
  application: Application
  onStatusChange?: (applicationId: string, newStatus: ApplicationStatus) => void
}

export function ApplicationCard({ application, onStatusChange }: ApplicationCardProps) {
  const navigate = useNavigate()
  const statusConfig = getStatusConfig(application.status)

  const handleViewDetails = () => {
    navigate(`/admissions/${application.id}`)
  }

  const allTransitions: { status: ApplicationStatus; label: string }[] = [
    { status: 'under_review' as const, label: 'Move to Review' },
    { status: 'document_verification' as const, label: 'Document Verification' },
    { status: 'entrance_exam' as const, label: 'Schedule Exam' },
    { status: 'interview' as const, label: 'Schedule Interview' },
    { status: 'approved' as const, label: 'Approve' },
    { status: 'rejected' as const, label: 'Reject' },
    { status: 'enrolled' as const, label: 'Enroll' },
    { status: 'withdrawn' as const, label: 'Withdraw' },
  ]
  const possibleTransitions = allTransitions.filter((t) => canTransitionTo(application.status, t.status))

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10" onClick={handleViewDetails}>
            <AvatarImage src={application.photoUrl} />
            <AvatarFallback>{getInitials(application.studentName)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0" onClick={handleViewDetails}>
            <p className="font-medium text-sm truncate">{application.studentName}</p>
            <p className="text-xs text-muted-foreground">{application.applyingForClass}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Applied: {formatDate(application.appliedDate, { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewDetails}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>

              {possibleTransitions.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  {possibleTransitions.map((transition) => (
                    <DropdownMenuItem
                      key={transition.status}
                      onClick={() => onStatusChange?.(application.id, transition.status)}
                      className={transition.status === 'rejected' ? 'text-destructive' : ''}
                    >
                      <ArrowRight className="h-4 w-4 mr-2" />
                      {transition.label}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
