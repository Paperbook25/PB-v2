import { useState, useEffect, useMemo } from 'react'
import { BookMarked, Loader2, Search, Calendar, User, BookOpen } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { useBooks, useAvailableStudents, useIssueBook } from '../hooks/useLibrary'
import { DEFAULT_LOAN_DAYS, type Book } from '../types/library.types'

interface IssueBookDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedBook?: Book | null
}

export function IssueBookDialog({ open, onOpenChange, preselectedBook }: IssueBookDialogProps) {
  const { toast } = useToast()
  const [bookSearch, setBookSearch] = useState('')
  const [studentSearch, setStudentSearch] = useState('')
  const [selectedBookId, setSelectedBookId] = useState<string>('')
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [dueDate, setDueDate] = useState('')

  const { data: booksData, isLoading: booksLoading } = useBooks({
    search: bookSearch,
    availability: 'available',
    limit: 20,
  })

  const { data: studentsData, isLoading: studentsLoading } = useAvailableStudents(studentSearch)

  const issueBook = useIssueBook()

  // Set default due date (14 days from now)
  useEffect(() => {
    if (open) {
      const defaultDue = new Date()
      defaultDue.setDate(defaultDue.getDate() + DEFAULT_LOAN_DAYS)
      setDueDate(defaultDue.toISOString().split('T')[0])

      // If there's a preselected book, set it
      if (preselectedBook) {
        setSelectedBookId(preselectedBook.id)
      }
    }
  }, [open, preselectedBook])

  const availableBooks = useMemo(() => {
    return booksData?.data.filter((b) => b.availableCopies > 0) || []
  }, [booksData])

  const students = studentsData?.data || []

  const selectedBook = useMemo(() => {
    if (preselectedBook && selectedBookId === preselectedBook.id) {
      return preselectedBook
    }
    return availableBooks.find((b) => b.id === selectedBookId)
  }, [selectedBookId, availableBooks, preselectedBook])

  const selectedStudent = students.find((s) => s.id === selectedStudentId)

  const handleSubmit = () => {
    if (!selectedBookId || !selectedStudentId || !dueDate) {
      toast({
        title: 'Missing Information',
        description: 'Please select a book, student, and due date.',
        variant: 'destructive',
      })
      return
    }

    issueBook.mutate(
      {
        bookId: selectedBookId,
        studentId: selectedStudentId,
        dueDate: new Date(dueDate).toISOString(),
      },
      {
        onSuccess: () => {
          toast({
            title: 'Book Issued Successfully',
            description: `${selectedBook?.title} has been issued to ${selectedStudent?.name}.`,
          })
          handleClose()
        },
        onError: (error) => {
          toast({
            title: 'Issue Failed',
            description: error instanceof Error ? error.message : 'Failed to issue book',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const handleClose = () => {
    setBookSearch('')
    setStudentSearch('')
    setSelectedBookId('')
    setSelectedStudentId('')
    setDueDate('')
    onOpenChange(false)
  }

  const isValid = selectedBookId && selectedStudentId && dueDate

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookMarked className="h-5 w-5" />
            Issue Book
          </DialogTitle>
          <DialogDescription>Issue a book to a student from the library.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Book Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Select Book <span className="text-destructive">*</span>
            </Label>

            {preselectedBook ? (
              <div className="p-3 border rounded-lg bg-muted">
                <p className="font-medium">{preselectedBook.title}</p>
                <p className="text-sm text-muted-foreground">
                  by {preselectedBook.author} • {preselectedBook.availableCopies} available
                </p>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search books by title or author..."
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <ScrollArea className="h-[150px] border rounded-lg">
                  {booksLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : availableBooks.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                      No available books found
                    </div>
                  ) : (
                    <div className="p-2 space-y-1">
                      {availableBooks.map((book) => (
                        <div
                          key={book.id}
                          className={`p-2 rounded cursor-pointer transition-colors ${
                            selectedBookId === book.id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedBookId(book.id)}
                        >
                          <p className="font-medium text-sm">{book.title}</p>
                          <p
                            className={`text-xs ${
                              selectedBookId === book.id
                                ? 'text-primary-foreground/80'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {book.author} • {book.availableCopies} copies available
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </>
            )}
          </div>

          {/* Student Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Select Student <span className="text-destructive">*</span>
            </Label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or admission number..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="h-[150px] border rounded-lg">
              {studentsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : students.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No students found
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        selectedStudentId === student.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => setSelectedStudentId(student.id)}
                    >
                      <p className="font-medium text-sm">{student.name}</p>
                      <p
                        className={`text-xs ${
                          selectedStudentId === student.id
                            ? 'text-primary-foreground/80'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {student.className} - {student.section} • Roll: {student.rollNumber} •{' '}
                        {student.admissionNumber}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground">
              Default loan period is {DEFAULT_LOAN_DAYS} days. Late returns incur Rs 5/day fine.
            </p>
          </div>

          {/* Summary */}
          {selectedBook && selectedStudent && (
            <div className="p-3 bg-muted rounded-lg space-y-1">
              <p className="text-sm font-medium">Issue Summary</p>
              <p className="text-sm">
                <span className="text-muted-foreground">Book:</span> {selectedBook.title}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Student:</span> {selectedStudent.name} (
                {selectedStudent.className} - {selectedStudent.section})
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Due:</span>{' '}
                {dueDate ? new Date(dueDate).toLocaleDateString() : '-'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || issueBook.isPending}>
            {issueBook.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Issuing...
              </>
            ) : (
              <>
                <BookMarked className="h-4 w-4 mr-2" />
                Issue Book
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
