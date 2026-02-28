import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus,
  Search,
  BookOpen,
  BookMarked,
  AlertTriangle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Bookmark,
  Monitor,
  ScanLine,
  History,
  IndianRupee,
} from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { cn } from '@/lib/utils'

import { BookCard } from '../components/BookCard'
import { BookDetailDialog } from '../components/BookDetailDialog'
import { AddBookDialog } from '../components/AddBookDialog'
import { IssueBookDialog } from '../components/IssueBookDialog'
import { ReturnBookDialog } from '../components/ReturnBookDialog'
import { RenewBookDialog } from '../components/RenewBookDialog'
import { FinesTable } from '../components/FinesTable'
import { ReservationManager } from '../components/ReservationManager'
import { DigitalLibraryView } from '../components/DigitalLibraryView'
import { BarcodeScannerView } from '../components/BarcodeScannerView'
import { ReadingHistoryView } from '../components/ReadingHistoryView'

import { useBooks, useIssuedBooks, useLibraryStats } from '../hooks/useLibrary'
import {
  BOOK_CATEGORIES,
  BOOKS_PER_PAGE,
  ISSUED_BOOKS_PER_PAGE,
  MAX_RENEWALS,
  type Book,
  type BookCategory,
  type BookFilters,
  type IssuedBook,
  type IssuedBookFilters,
  type IssuedBookStatus,
  type FineFilters,
} from '../types/library.types'

// Tab types
type LibraryTab = 'catalog' | 'issued' | 'reservations' | 'digital' | 'fines' | 'scanner' | 'history'

// ============================================
// Catalog Tab Component
// ============================================
function CatalogTab({
  onBookClick,
  onIssueBook,
  onAddBook,
}: {
  onBookClick: (book: Book) => void
  onIssueBook: () => void
  onAddBook: () => void
}) {
  const [catalogFilters, setCatalogFilters] = useState<BookFilters>({
    search: '',
    category: 'all',
    availability: 'all',
    page: 1,
    limit: BOOKS_PER_PAGE,
  })

  const {
    data: booksData,
    isLoading: booksLoading,
    error: booksError,
  } = useBooks(catalogFilters)

  const books = booksData?.data || []
  const booksPagination = booksData?.meta

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, or ISBN..."
            value={catalogFilters.search}
            onChange={(e) =>
              setCatalogFilters({ ...catalogFilters, search: e.target.value, page: 1 })
            }
            className="pl-9"
          />
        </div>
        <Select
          value={catalogFilters.category || 'all'}
          onValueChange={(value) =>
            setCatalogFilters({
              ...catalogFilters,
              category: value as BookCategory | 'all',
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {BOOK_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={catalogFilters.availability || 'all'}
          onValueChange={(value) =>
            setCatalogFilters({
              ...catalogFilters,
              availability: value as 'all' | 'available' | 'unavailable',
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Books</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="unavailable">Not Available</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Books Grid */}
      {booksError ? (
        <Card>
          <CardContent className="p-6 text-center text-destructive">
            Failed to load books. Please try again.
          </CardContent>
        </Card>
      ) : booksLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[3/4]" />
              <CardContent className="p-3">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : books.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No books found matching your criteria.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} onClick={() => onBookClick(book)} />
            ))}
          </div>

          {/* Pagination */}
          {booksPagination && booksPagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {(booksPagination.page - 1) * booksPagination.limit + 1} -{' '}
                {Math.min(booksPagination.page * booksPagination.limit, booksPagination.total)}{' '}
                of {booksPagination.total} books
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCatalogFilters({
                      ...catalogFilters,
                      page: (catalogFilters.page || 1) - 1,
                    })
                  }
                  disabled={booksPagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCatalogFilters({
                      ...catalogFilters,
                      page: (catalogFilters.page || 1) + 1,
                    })
                  }
                  disabled={booksPagination.page >= booksPagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ============================================
// Issued Books Tab Component
// ============================================
function IssuedBooksTab({
  onReturnBook,
  onRenewBook,
}: {
  onReturnBook: (issuedBook: IssuedBook) => void
  onRenewBook: (issuedBook: IssuedBook) => void
}) {
  const [issuedFilters, setIssuedFilters] = useState<IssuedBookFilters>({
    search: '',
    status: 'all',
    page: 1,
    limit: ISSUED_BOOKS_PER_PAGE,
  })

  const { data: issuedData, isLoading: issuedLoading } = useIssuedBooks(issuedFilters)

  const issuedBooks = issuedData?.data || []
  const issuedPagination = issuedData?.meta

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by book or student..."
            value={issuedFilters.search}
            onChange={(e) =>
              setIssuedFilters({ ...issuedFilters, search: e.target.value, page: 1 })
            }
            className="pl-9"
          />
        </div>
        <Select
          value={issuedFilters.status || 'all'}
          onValueChange={(value) =>
            setIssuedFilters({
              ...issuedFilters,
              status: value as IssuedBookStatus | 'all',
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="issued">Issued</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Currently Issued Books</CardTitle>
          <CardDescription>Books that are currently checked out</CardDescription>
        </CardHeader>
        <CardContent>
          {issuedLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : issuedBooks.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No issued books found.</p>
          ) : (
            <>
              <div className="space-y-3">
                {issuedBooks.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={item.status === 'overdue' ? {
                      borderColor: 'var(--color-module-exams)',
                      backgroundColor: 'var(--color-module-exams-light)',
                    } : undefined}
                  >
                    <div>
                      <p className="font-medium">{item.bookTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.studentName} • {item.studentClass} - {item.studentSection}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm">
                          Due: {new Date(item.dueDate).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-1 justify-end">
                          {item.status === 'overdue' && (
                            <Badge variant="destructive" className="text-[10px]">
                              Overdue
                            </Badge>
                          )}
                          {(item.renewalCount || 0) > 0 && (
                            <Badge variant="secondary" className="text-[10px]">
                              Renewed {item.renewalCount}x
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRenewBook(item)}
                        disabled={(item.renewalCount || 0) >= MAX_RENEWALS}
                        title={
                          (item.renewalCount || 0) >= MAX_RENEWALS
                            ? 'Maximum renewals reached'
                            : 'Renew this book'
                        }
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Renew
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReturnBook(item)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Return
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {issuedPagination && issuedPagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(issuedPagination.page - 1) * issuedPagination.limit + 1} -{' '}
                    {Math.min(
                      issuedPagination.page * issuedPagination.limit,
                      issuedPagination.total
                    )}{' '}
                    of {issuedPagination.total}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setIssuedFilters({
                          ...issuedFilters,
                          page: (issuedFilters.page || 1) - 1,
                        })
                      }
                      disabled={issuedPagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setIssuedFilters({
                          ...issuedFilters,
                          page: (issuedFilters.page || 1) + 1,
                        })
                      }
                      disabled={issuedPagination.page >= issuedPagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Fines Tab Component
// ============================================
function FinesTab() {
  const [finesFilters, setFinesFilters] = useState<FineFilters>({
    search: '',
    status: 'all',
    page: 1,
    limit: 10,
  })

  return <FinesTable filters={finesFilters} onFiltersChange={setFinesFilters} />
}

// ============================================
// Main LibraryPage Component
// ============================================
export function LibraryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { hasRole } = useAuthStore()
  const canManageLibrary = hasRole(['admin', 'principal', 'librarian'])

  // Primary tab from URL
  const activeTab = (searchParams.get('tab') as LibraryTab) || 'catalog'

  // Dialog states
  const [addBookDialogOpen, setAddBookDialogOpen] = useState(false)
  const [issueBookDialogOpen, setIssueBookDialogOpen] = useState(false)
  const [returnBookDialogOpen, setReturnBookDialogOpen] = useState(false)
  const [renewBookDialogOpen, setRenewBookDialogOpen] = useState(false)
  const [bookDetailDialogOpen, setBookDetailDialogOpen] = useState(false)

  // Selected items
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [selectedIssuedBook, setSelectedIssuedBook] = useState<IssuedBook | null>(null)
  const [editBook, setEditBook] = useState<Book | null>(null)

  // Data hooks for stats
  const { data: statsData, isLoading: statsLoading } = useLibraryStats()
  const stats = statsData?.data

  // Tab change handler
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  // Handlers
  const handleBookClick = (book: Book) => {
    setSelectedBook(book)
    setBookDetailDialogOpen(true)
  }

  const handleEditBook = (book: Book) => {
    setEditBook(book)
    setBookDetailDialogOpen(false)
    setAddBookDialogOpen(true)
  }

  const handleIssueFromDetail = (book: Book) => {
    setSelectedBook(book)
    setBookDetailDialogOpen(false)
    setIssueBookDialogOpen(true)
  }

  const handleReturnBook = (issuedBook: IssuedBook) => {
    setSelectedIssuedBook(issuedBook)
    setReturnBookDialogOpen(true)
  }

  const handleRenewBook = (issuedBook: IssuedBook) => {
    setSelectedIssuedBook(issuedBook)
    setRenewBookDialogOpen(true)
  }

  const handleAddBookClose = (open: boolean) => {
    setAddBookDialogOpen(open)
    if (!open) {
      setEditBook(null)
    }
  }

  const handleIssueBookClose = (open: boolean) => {
    setIssueBookDialogOpen(open)
    if (!open) {
      setSelectedBook(null)
    }
  }

  // Determine header actions based on active tab and role
  const getHeaderActions = () => {
    if (!canManageLibrary) return undefined

    switch (activeTab) {
      case 'catalog':
        return (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setReturnBookDialogOpen(true)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Return Book
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIssueBookDialogOpen(true)}>
              <BookMarked className="h-4 w-4 mr-2" />
              Issue Book
            </Button>
            <Button size="sm" onClick={() => setAddBookDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </div>
        )
      case 'issued':
        return (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setReturnBookDialogOpen(true)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Return Book
            </Button>
            <Button size="sm" onClick={() => setIssueBookDialogOpen(true)}>
              <BookMarked className="h-4 w-4 mr-2" />
              Issue Book
            </Button>
          </div>
        )
      default:
        return undefined
    }
  }

  return (
    <div>
      <PageHeader
        title="Library"
        description="Manage books, issue, returns, and digital resources"
        breadcrumbs={[{ label: 'Dashboard', href: '/' }, { label: 'Library' }]}
        moduleColor="library"
        actions={getHeaderActions()}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-library-light)' }}>
              <BookOpen className="h-5 w-5" style={{ color: 'var(--color-module-library)' }} />
            </div>
            <div>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats?.totalBooks || 0}</p>
              )}
              <p className="text-xs text-muted-foreground">Total Books</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-attendance-light)' }}>
              <BookOpen className="h-5 w-5" style={{ color: 'var(--color-module-attendance)' }} />
            </div>
            <div>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats?.availableBooks || 0}</p>
              )}
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-lms-light)' }}>
              <BookMarked className="h-5 w-5" style={{ color: 'var(--color-module-lms)' }} />
            </div>
            <div>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats?.issuedBooks || 0}</p>
              )}
              <p className="text-xs text-muted-foreground">Books Issued</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-module-exams-light)' }}>
              <AlertTriangle className="h-5 w-5" style={{ color: 'var(--color-module-exams)' }} />
            </div>
            <div>
              {statsLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stats?.overdueBooks || 0}</p>
              )}
              <p className="text-xs text-muted-foreground">Overdue</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 hidden sm:block" />
            Catalog
          </TabsTrigger>
          <TabsTrigger value="issued" className="flex items-center gap-2">
            <BookMarked className="h-4 w-4 hidden sm:block" />
            Issued
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 hidden sm:block" />
            Reservations
          </TabsTrigger>
          <TabsTrigger value="digital" className="flex items-center gap-2">
            <Monitor className="h-4 w-4 hidden sm:block" />
            Digital
          </TabsTrigger>
          <TabsTrigger value="fines" className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4 hidden sm:block" />
            Fines
          </TabsTrigger>
          <TabsTrigger value="scanner" className="flex items-center gap-2">
            <ScanLine className="h-4 w-4 hidden sm:block" />
            Scanner
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4 hidden sm:block" />
            History
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* Catalog Tab */}
          <TabsContent value="catalog" className="mt-0">
            <CatalogTab
              onBookClick={handleBookClick}
              onIssueBook={() => setIssueBookDialogOpen(true)}
              onAddBook={() => setAddBookDialogOpen(true)}
            />
          </TabsContent>

          {/* Issued Books Tab */}
          <TabsContent value="issued" className="mt-0">
            <IssuedBooksTab
              onReturnBook={handleReturnBook}
              onRenewBook={handleRenewBook}
            />
          </TabsContent>

          {/* Reservations Tab */}
          <TabsContent value="reservations" className="mt-0">
            <ReservationManager />
          </TabsContent>

          {/* Digital Library Tab */}
          <TabsContent value="digital" className="mt-0">
            <DigitalLibraryView />
          </TabsContent>

          {/* Fines Tab */}
          <TabsContent value="fines" className="mt-0">
            <FinesTab />
          </TabsContent>

          {/* Scanner Tab */}
          <TabsContent value="scanner" className="mt-0">
            <BarcodeScannerView />
          </TabsContent>

          {/* Reading History Tab */}
          <TabsContent value="history" className="mt-0">
            <ReadingHistoryView />
          </TabsContent>
        </div>
      </Tabs>

      {/* Dialogs */}
      <BookDetailDialog
        open={bookDetailDialogOpen}
        onOpenChange={setBookDetailDialogOpen}
        book={selectedBook}
        onEdit={handleEditBook}
        onIssue={handleIssueFromDetail}
      />

      <AddBookDialog
        open={addBookDialogOpen}
        onOpenChange={handleAddBookClose}
        editBook={editBook}
      />

      <IssueBookDialog
        open={issueBookDialogOpen}
        onOpenChange={handleIssueBookClose}
        preselectedBook={selectedBook}
      />

      <ReturnBookDialog
        open={returnBookDialogOpen}
        onOpenChange={setReturnBookDialogOpen}
        issuedBook={selectedIssuedBook}
      />

      <RenewBookDialog
        open={renewBookDialogOpen}
        onOpenChange={setRenewBookDialogOpen}
        issuedBook={selectedIssuedBook}
      />
    </div>
  )
}
