import { useState } from 'react'
import {
  Users,
  Search,
  Link2,
  Unlink,
  Plus,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useToast } from '@/hooks/use-toast'
import { getInitials } from '@/lib/utils'
import {
  useStudentSiblings,
  useLinkSibling,
  useUnlinkSibling,
  useStudents,
} from '../hooks/useStudents'

interface SiblingCardProps {
  studentId: string
}

function SiblingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  )
}

export function SiblingCard({ studentId }: SiblingCardProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [unlinkTarget, setUnlinkTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [linkingStudentId, setLinkingStudentId] = useState<string | null>(null)

  const { toast } = useToast()
  const {
    data: siblingResponse,
    isLoading,
    isError,
  } = useStudentSiblings(studentId)
  const siblingGroup = siblingResponse?.data
  const linkMutation = useLinkSibling()
  const unlinkMutation = useUnlinkSibling()

  // Search for students to link
  const { data: searchResults, isLoading: searchLoading } = useStudents({
    search: searchQuery || undefined,
    limit: 20,
  })

  const siblings = siblingGroup?.filter((s) => s.id !== studentId) ?? []

  const searchStudents =
    (searchResults?.data ?? []).filter(
      (s) =>
        s.id !== studentId &&
        !siblings.some((sib: { id: string }) => sib.id === s.id)
    )

  const handleLink = async (siblingId: string) => {
    setLinkingStudentId(siblingId)
    try {
      await linkMutation.mutateAsync({ studentId, siblingId })
      toast({ title: 'Sibling linked successfully' })
      setLinkDialogOpen(false)
      setSearchQuery('')
    } catch {
      toast({
        title: 'Failed to link sibling',
        variant: 'destructive',
      })
    } finally {
      setLinkingStudentId(null)
    }
  }

  const handleUnlink = async () => {
    if (!unlinkTarget) return

    try {
      await unlinkMutation.mutateAsync({
        studentId,
        siblingId: unlinkTarget.id,
      })
      toast({ title: 'Sibling unlinked successfully' })
    } catch {
      toast({
        title: 'Failed to unlink sibling',
        variant: 'destructive',
      })
    } finally {
      setUnlinkTarget(null)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="h-5 w-5" />
          Siblings
        </CardTitle>
        <Button size="sm" onClick={() => setLinkDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Link Sibling
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SiblingSkeleton />
        ) : isError ? (
          <div className="text-center py-8 text-destructive text-sm">
            Failed to load siblings. Please try again.
          </div>
        ) : siblings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Users className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No siblings linked</p>
            <p className="text-xs mt-1">
              Link siblings to track family connections.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {siblings.map((sibling) => (
              <div
                key={sibling.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={sibling.photoUrl} alt={sibling.name} />
                  <AvatarFallback>
                    {getInitials(sibling.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {sibling.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sibling.class} - Section {sibling.section} | Roll #
                    {sibling.rollNumber}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() =>
                    setUnlinkTarget({ id: sibling.id, name: sibling.name })
                  }
                >
                  <Unlink className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Link Sibling Dialog */}
      <Dialog
        open={linkDialogOpen}
        onOpenChange={(open) => {
          setLinkDialogOpen(open)
          if (!open) setSearchQuery('')
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Sibling</DialogTitle>
            <DialogDescription>
              Search for a student to link as a sibling.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or admission number..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <ScrollArea className="h-[300px]">
              {searchLoading ? (
                <div className="space-y-2 p-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !searchQuery.trim() ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="h-8 w-8 mb-2 opacity-40" />
                  <p className="text-sm">Type to search for students</p>
                </div>
              ) : searchStudents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No students found matching "{searchQuery}"
                </div>
              ) : (
                <div className="space-y-1 p-1">
                  {searchStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={student.photoUrl}
                          alt={student.name}
                        />
                        <AvatarFallback className="text-xs">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {student.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.class} - {student.section} |{' '}
                          {student.admissionNumber}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 shrink-0"
                        disabled={linkingStudentId === student.id}
                        onClick={() => handleLink(student.id)}
                      >
                        {linkingStudentId === student.id ? (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        ) : (
                          <Link2 className="h-3 w-3 mr-1" />
                        )}
                        Link
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unlink Confirmation */}
      <AlertDialog
        open={!!unlinkTarget}
        onOpenChange={(open) => {
          if (!open) setUnlinkTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlink Sibling</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unlink {unlinkTarget?.name} as a sibling?
              This will remove the sibling relationship for both students.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnlink}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {unlinkMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Unlinking...
                </>
              ) : (
                'Unlink'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
