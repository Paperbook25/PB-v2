import { useState } from 'react'
import {
  BookOpen,
  Calendar,
  Hash,
  MapPin,
  Building,
  Trash2,
  Pencil,
  BookMarked,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useDeleteBook } from '../hooks/useLibrary'
import type { Book } from '../types/library.types'

interface BookDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  book: Book | null
  onEdit?: (book: Book) => void
  onIssue?: (book: Book) => void
}

export function BookDetailDialog({
  open,
  onOpenChange,
  book,
  onEdit,
  onIssue,
}: BookDetailDialogProps) {
  const { toast } = useToast()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const deleteBook = useDeleteBook()

  if (!book) return null

  const isAvailable = book.availableCopies > 0

  const handleDelete = () => {
    deleteBook.mutate(book.id, {
      onSuccess: () => {
        toast({
          title: 'Book Deleted',
          description: `"${book.title}" has been removed from the library.`,
        })
        setShowDeleteConfirm(false)
        onOpenChange(false)
      },
      onError: (error) => {
        toast({
          title: 'Delete Failed',
          description: error instanceof Error ? error.message : 'Failed to delete book',
          variant: 'destructive',
        })
        setShowDeleteConfirm(false)
      },
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Book Details
            </DialogTitle>
            <DialogDescription>View and manage book information</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-[150px_1fr] gap-6">
            {/* Cover Image */}
            <div className="space-y-2">
              <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = `https://placehold.co/200x300/e2e8f0/64748b?text=${encodeURIComponent(book.title.substring(0, 10))}`
                  }}
                />
              </div>
              <div className="text-center">
                <Badge variant={isAvailable ? 'default' : 'destructive'}>
                  {isAvailable ? 'Available' : 'Not Available'}
                </Badge>
              </div>
            </div>

            {/* Book Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{book.title}</h3>
                <p className="text-muted-foreground">by {book.author}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">ISBN:</span>
                  <span className="font-mono text-xs">{book.isbn}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{book.category}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Publisher:</span>
                  <span className="truncate">{book.publisher}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Year:</span>
                  <span>{book.publicationYear}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Location:</span>
                  <span>{book.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Copies:</span>
                  <span>
                    {book.availableCopies} / {book.totalCopies} available
                  </span>
                </div>
              </div>

              {book.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-sm line-clamp-4">{book.description}</p>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Added: {new Date(book.addedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={book.availableCopies < book.totalCopies}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit?.(book)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button size="sm" onClick={() => onIssue?.(book)} disabled={!isAvailable}>
              <BookMarked className="h-4 w-4 mr-2" />
              Issue Book
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Book</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{book.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBook.isPending}
            >
              {deleteBook.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
