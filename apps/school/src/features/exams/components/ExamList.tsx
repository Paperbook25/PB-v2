import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Calendar,
  FileSpreadsheet,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import type { Exam, ExamStatus } from '../types/exams.types'
import { EXAM_TYPE_LABELS, EXAM_STATUS_LABELS } from '../types/exams.types'

interface ExamListProps {
  exams: Exam[]
  onDelete: (id: string) => void
  onPublish: (id: string) => void
  isDeleting?: boolean
  isPublishing?: boolean
  canManageExams?: boolean
}

const statusVariants: Record<ExamStatus, 'default' | 'secondary' | 'success' | 'warning'> = {
  scheduled: 'secondary',
  ongoing: 'warning',
  completed: 'default',
  results_published: 'success',
}

export function ExamList({ exams, onDelete, onPublish, isDeleting, isPublishing, canManageExams = true }: ExamListProps) {
  const navigate = useNavigate()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [publishId, setPublishId] = useState<string | null>(null)

  const examToDelete = exams.find((e) => e.id === deleteId)
  const examToPublish = exams.find((e) => e.id === publishId)

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No exams found. Create your first exam to get started.
                  </TableCell>
                </TableRow>
              ) : (
                exams.map((exam) => (
                  <TableRow
                    key={exam.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/exams/${exam.id}`)}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{exam.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {exam.academicYear} - {exam.term}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{EXAM_TYPE_LABELS[exam.type]}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {exam.applicableClasses.slice(0, 2).map((cls) => (
                          <Badge key={cls} variant="secondary" className="text-xs">
                            {cls.replace('Class ', '')}
                          </Badge>
                        ))}
                        {exam.applicableClasses.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{exam.applicableClasses.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>
                          {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[exam.status]}>
                        {EXAM_STATUS_LABELS[exam.status]}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/exams/${exam.id}`)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {canManageExams && (
                            <>
                              <DropdownMenuItem onClick={() => navigate(`/exams/${exam.id}/edit`)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/exams/${exam.id}/marks`)}>
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                Enter Marks
                              </DropdownMenuItem>
                              {exam.status === 'completed' && (
                                <DropdownMenuItem onClick={() => setPublishId(exam.id)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Publish Results
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteId(exam.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{examToDelete?.name}&quot;? This will also
              delete all marks and report cards associated with this exam. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={() => {
                if (deleteId) {
                  onDelete(deleteId)
                  setDeleteId(null)
                }
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Dialog */}
      <AlertDialog open={!!publishId} onOpenChange={() => setPublishId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Results</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to publish results for &quot;{examToPublish?.name}&quot;? Once
              published, students and parents will be able to view the results. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPublishing}
              onClick={() => {
                if (publishId) {
                  onPublish(publishId)
                  setPublishId(null)
                }
              }}
            >
              {isPublishing ? 'Publishing...' : 'Publish Results'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
