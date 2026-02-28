import { useState, useEffect } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useCreateBook, useUpdateBook } from '../hooks/useLibrary'
import { BOOK_CATEGORIES, type Book, type BookCategory } from '../types/library.types'

interface AddBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editBook?: Book | null
}

const initialFormState = {
  isbn: '',
  title: '',
  author: '',
  category: '' as BookCategory | '',
  publisher: '',
  publicationYear: new Date().getFullYear(),
  totalCopies: 1,
  location: '',
  description: '',
  coverUrl: '',
}

export function AddBookDialog({ open, onOpenChange, editBook }: AddBookDialogProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createBook = useCreateBook()
  const updateBook = useUpdateBook()

  const isEditing = !!editBook

  useEffect(() => {
    if (editBook) {
      setFormData({
        isbn: editBook.isbn,
        title: editBook.title,
        author: editBook.author,
        category: editBook.category,
        publisher: editBook.publisher,
        publicationYear: editBook.publicationYear,
        totalCopies: editBook.totalCopies,
        location: editBook.location,
        description: editBook.description,
        coverUrl: editBook.coverUrl,
      })
    } else {
      setFormData(initialFormState)
    }
    setErrors({})
  }, [editBook, open])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.isbn.trim()) newErrors.isbn = 'ISBN is required'
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.author.trim()) newErrors.author = 'Author is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.publisher.trim()) newErrors.publisher = 'Publisher is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (formData.publicationYear < 1000 || formData.publicationYear > new Date().getFullYear() + 1) {
      newErrors.publicationYear = 'Invalid publication year'
    }
    if (formData.totalCopies < 1) newErrors.totalCopies = 'Must have at least 1 copy'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const bookData = {
      isbn: formData.isbn.trim(),
      title: formData.title.trim(),
      author: formData.author.trim(),
      category: formData.category as BookCategory,
      publisher: formData.publisher.trim(),
      publicationYear: formData.publicationYear,
      totalCopies: formData.totalCopies,
      location: formData.location.trim(),
      description: formData.description.trim() || undefined,
      coverUrl: formData.coverUrl.trim() || undefined,
    }

    if (isEditing && editBook) {
      updateBook.mutate(
        { id: editBook.id, data: bookData },
        {
          onSuccess: () => {
            toast({
              title: 'Book Updated',
              description: `"${bookData.title}" has been updated successfully.`,
            })
            handleClose()
          },
          onError: (error) => {
            toast({
              title: 'Update Failed',
              description: error instanceof Error ? error.message : 'Failed to update book',
              variant: 'destructive',
            })
          },
        }
      )
    } else {
      createBook.mutate(bookData, {
        onSuccess: () => {
          toast({
            title: 'Book Added',
            description: `"${bookData.title}" has been added to the library.`,
          })
          handleClose()
        },
        onError: (error) => {
          toast({
            title: 'Failed to Add Book',
            description: error instanceof Error ? error.message : 'An error occurred',
            variant: 'destructive',
          })
        },
      })
    }
  }

  const handleClose = () => {
    setFormData(initialFormState)
    setErrors({})
    onOpenChange(false)
  }

  const isPending = createBook.isPending || updateBook.isPending

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {isEditing ? 'Edit Book' : 'Add New Book'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the book information below.'
              : 'Enter the book details to add it to the library catalog.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* ISBN */}
          <div className="space-y-2">
            <Label htmlFor="isbn">
              ISBN <span className="text-destructive">*</span>
            </Label>
            <Input
              id="isbn"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              placeholder="978-0-123456-78-9"
            />
            {errors.isbn && <p className="text-xs text-destructive">{errors.isbn}</p>}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Book title"
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          {/* Author */}
          <div className="space-y-2">
            <Label htmlFor="author">
              Author <span className="text-destructive">*</span>
            </Label>
            <Input
              id="author"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="Author name"
            />
            {errors.author && <p className="text-xs text-destructive">{errors.author}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value as BookCategory })}
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {BOOK_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
          </div>

          {/* Publisher and Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="publisher">
                Publisher <span className="text-destructive">*</span>
              </Label>
              <Input
                id="publisher"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                placeholder="Publisher name"
              />
              {errors.publisher && <p className="text-xs text-destructive">{errors.publisher}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="publicationYear">Publication Year</Label>
              <Input
                id="publicationYear"
                type="number"
                min={1000}
                max={new Date().getFullYear() + 1}
                value={formData.publicationYear}
                onChange={(e) =>
                  setFormData({ ...formData, publicationYear: parseInt(e.target.value) || 0 })
                }
              />
              {errors.publicationYear && (
                <p className="text-xs text-destructive">{errors.publicationYear}</p>
              )}
            </div>
          </div>

          {/* Copies and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalCopies">
                Total Copies <span className="text-destructive">*</span>
              </Label>
              <Input
                id="totalCopies"
                type="number"
                min={1}
                value={formData.totalCopies}
                onChange={(e) =>
                  setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })
                }
              />
              {errors.totalCopies && (
                <p className="text-xs text-destructive">{errors.totalCopies}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">
                Shelf Location <span className="text-destructive">*</span>
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., A1, B2"
              />
              {errors.location && <p className="text-xs text-destructive">{errors.location}</p>}
            </div>
          </div>

          {/* Cover URL */}
          <div className="space-y-2">
            <Label htmlFor="coverUrl">Cover Image URL (optional)</Label>
            <Input
              id="coverUrl"
              value={formData.coverUrl}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the book..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? 'Updating...' : 'Adding...'}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                {isEditing ? 'Update Book' : 'Add Book'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
