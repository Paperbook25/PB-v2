import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import {
  books,
  issuedBooks,
  fines,
  reservations,
  readingHistory,
  digitalBooks,
  overdueNotifications,
  notificationConfig,
  getLibraryStats,
  getAvailableStudents,
  getStudentReadingReport,
  getBookRecommendations,
} from '../data/library.data'
import { getUserContext, isStudent, isParent } from '../utils/auth-context'
import type {
  Book,
  IssuedBook,
  Fine,
  CreateBookRequest,
  UpdateBookRequest,
  IssueBookRequest,
  UpdateFineRequest,
  CreateReservationRequest,
  BookReservation,
  DigitalBook,
  OverdueNotification,
  NotificationConfig,
  RenewBookRequest,
  RenewalRecord,
} from '@/features/library/types/library.types'
import { MAX_RENEWALS } from '@/features/library/types/library.types'

// Helper to generate IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}

export const libraryHandlers = [
  // ==================== USER-SCOPED HANDLERS ====================

  // Get student's own issued books
  http.get('/api/library/my-books', async ({ request }) => {
    await mockDelay('read')

    const context = getUserContext(request)

    if (!context || !isStudent(context) || !context.studentId) {
      return HttpResponse.json({ error: 'Unauthorized - Student access required' }, { status: 403 })
    }

    // Get active issued books for this student
    const today = new Date()
    let myBooks = issuedBooks.filter(
      (ib) => ib.studentId === context.studentId && ib.status !== 'returned'
    )

    // Update overdue status
    myBooks = myBooks.map((ib) => {
      if (ib.status === 'issued' && new Date(ib.dueDate) < today) {
        return { ...ib, status: 'overdue' as const }
      }
      return ib
    })

    return HttpResponse.json({ data: myBooks })
  }),

  // Get parent's children issued books
  http.get('/api/library/my-children-books', async ({ request }) => {
    await mockDelay('read')

    const context = getUserContext(request)

    if (!context || !isParent(context)) {
      return HttpResponse.json({ error: 'Unauthorized - Parent access required' }, { status: 403 })
    }

    if (!context.childIds || context.childIds.length === 0) {
      return HttpResponse.json({ error: 'No children linked to account' }, { status: 404 })
    }

    const today = new Date()

    // Group books by child
    const childrenBooks = context.childIds.map((childId) => {
      let childBooks = issuedBooks.filter(
        (ib) => ib.studentId === childId && ib.status !== 'returned'
      )

      // Update overdue status
      childBooks = childBooks.map((ib) => {
        if (ib.status === 'issued' && new Date(ib.dueDate) < today) {
          return { ...ib, status: 'overdue' as const }
        }
        return ib
      })

      // Get student info from first book or use default
      const studentName = childBooks[0]?.studentName || `Student ${childId}`
      const studentClass = childBooks[0]?.studentClass || ''
      const studentSection = childBooks[0]?.studentSection || ''

      return {
        studentId: childId,
        studentName,
        studentClass,
        studentSection,
        books: childBooks,
      }
    })

    return HttpResponse.json({ data: childrenBooks })
  }),

  // Get student/parent library fines
  http.get('/api/library/my-fines', async ({ request }) => {
    await mockDelay('read')

    const context = getUserContext(request)

    if (!context) {
      return HttpResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    let studentIds: string[] = []

    if (isStudent(context) && context.studentId) {
      studentIds = [context.studentId]
    } else if (isParent(context) && context.childIds) {
      studentIds = context.childIds
    } else {
      return HttpResponse.json({ error: 'Unauthorized - Student or Parent access required' }, { status: 403 })
    }

    const userFines = fines.filter((f) => studentIds.includes(f.studentId))

    // Sort by createdAt descending
    userFines.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Calculate summary
    const totalFines = userFines.reduce((sum, f) => sum + f.amount, 0)
    const pendingFines = userFines
      .filter((f) => f.status === 'pending')
      .reduce((sum, f) => sum + f.amount, 0)
    const paidFines = userFines
      .filter((f) => f.status === 'paid')
      .reduce((sum, f) => sum + f.amount, 0)

    return HttpResponse.json({
      data: {
        fines: userFines,
        summary: {
          totalFines,
          pendingFines,
          paidFines,
        },
      },
    })
  }),

  // ==================== BOOK HANDLERS ====================

  // Get all books with pagination and filters
  http.get('/api/library/books', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const category = url.searchParams.get('category')
    const availability = url.searchParams.get('availability')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '12')

    let filtered = [...books]

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(search) ||
          b.author.toLowerCase().includes(search) ||
          b.isbn.toLowerCase().includes(search)
      )
    }

    // Category filter
    if (category && category !== 'all') {
      filtered = filtered.filter((b) => b.category === category)
    }

    // Availability filter
    if (availability === 'available') {
      filtered = filtered.filter((b) => b.availableCopies > 0)
    } else if (availability === 'unavailable') {
      filtered = filtered.filter((b) => b.availableCopies === 0)
    }

    // Sort by addedAt descending (newest first)
    filtered.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedBooks = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedBooks,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  }),

  // Get single book
  http.get('/api/library/books/:id', async ({ params }) => {
    await mockDelay('read')
    const book = books.find((b) => b.id === params.id)

    if (!book) {
      return HttpResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    return HttpResponse.json({ data: book })
  }),

  // Create new book
  http.post('/api/library/books', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateBookRequest

    const newBook: Book = {
      id: generateId(),
      isbn: body.isbn,
      title: body.title,
      author: body.author,
      category: body.category,
      publisher: body.publisher,
      publicationYear: body.publicationYear,
      totalCopies: body.totalCopies,
      availableCopies: body.totalCopies,
      description: body.description || '',
      coverUrl: body.coverUrl || `https://picsum.photos/seed/${generateId()}/200/300`,
      location: body.location,
      addedAt: new Date().toISOString(),
    }

    books.unshift(newBook)

    return HttpResponse.json({ data: newBook }, { status: 201 })
  }),

  // Update book
  http.put('/api/library/books/:id', async ({ params, request }) => {
    await mockDelay('read')
    const bookIndex = books.findIndex((b) => b.id === params.id)

    if (bookIndex === -1) {
      return HttpResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateBookRequest
    const existingBook = books[bookIndex]

    // Calculate new available copies if total copies changed
    let newAvailableCopies = existingBook.availableCopies
    if (body.totalCopies !== undefined) {
      const copiesDiff = body.totalCopies - existingBook.totalCopies
      newAvailableCopies = Math.max(0, existingBook.availableCopies + copiesDiff)
    }

    const updatedBook: Book = {
      ...existingBook,
      ...body,
      availableCopies: newAvailableCopies,
    }

    books[bookIndex] = updatedBook

    return HttpResponse.json({ data: updatedBook })
  }),

  // Delete book
  http.delete('/api/library/books/:id', async ({ params }) => {
    await mockDelay('read')
    const bookIndex = books.findIndex((b) => b.id === params.id)

    if (bookIndex === -1) {
      return HttpResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Check if book has issued copies
    const hasIssuedCopies = issuedBooks.some(
      (ib) => ib.bookId === params.id && ib.status !== 'returned'
    )

    if (hasIssuedCopies) {
      return HttpResponse.json(
        { error: 'Cannot delete book with issued copies' },
        { status: 400 }
      )
    }

    books.splice(bookIndex, 1)

    return HttpResponse.json({ success: true })
  }),

  // ==================== ISSUED BOOKS HANDLERS ====================

  // Get all issued books with filters
  http.get('/api/library/issued', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = issuedBooks.filter((ib) => ib.status !== 'returned')

    // Update overdue status for items past due date
    const today = new Date()
    filtered = filtered.map((ib) => {
      if (ib.status === 'issued' && new Date(ib.dueDate) < today) {
        return { ...ib, status: 'overdue' as const }
      }
      return ib
    })

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (ib) =>
          ib.bookTitle.toLowerCase().includes(search) ||
          ib.studentName.toLowerCase().includes(search) ||
          ib.bookIsbn.toLowerCase().includes(search)
      )
    }

    // Status filter
    if (status && status !== 'all') {
      filtered = filtered.filter((ib) => ib.status === status)
    }

    // Sort by issue date descending
    filtered.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedBooks = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedBooks,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  }),

  // Issue a book to a student
  http.post('/api/library/issue', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as IssueBookRequest

    const book = books.find((b) => b.id === body.bookId)
    if (!book) {
      return HttpResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    if (book.availableCopies < 1) {
      return HttpResponse.json({ error: 'No copies available' }, { status: 400 })
    }

    // Get student info from available students
    const students = getAvailableStudents()
    const student = students.find((s) => s.id === body.studentId)
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Check if student already has this book
    const alreadyHasBook = issuedBooks.some(
      (ib) =>
        ib.bookId === body.bookId &&
        ib.studentId === body.studentId &&
        ib.status !== 'returned'
    )
    if (alreadyHasBook) {
      return HttpResponse.json(
        { error: 'Student already has this book' },
        { status: 400 }
      )
    }

    const newIssuedBook: IssuedBook = {
      id: generateId(),
      bookId: book.id,
      bookTitle: book.title,
      bookIsbn: book.isbn,
      studentId: student.id,
      studentName: student.name,
      studentClass: student.className,
      studentSection: student.section,
      issueDate: new Date().toISOString(),
      dueDate: body.dueDate,
      status: 'issued',
      renewalCount: 0,
      renewalHistory: [],
    }

    // Update book availability
    const bookIndex = books.findIndex((b) => b.id === body.bookId)
    books[bookIndex].availableCopies--

    issuedBooks.unshift(newIssuedBook)

    return HttpResponse.json({ data: newIssuedBook }, { status: 201 })
  }),

  // Return a book
  http.post('/api/library/return/:id', async ({ params }) => {
    await mockDelay('write')
    const issuedBookIndex = issuedBooks.findIndex((ib) => ib.id === params.id)

    if (issuedBookIndex === -1) {
      return HttpResponse.json({ error: 'Issued book record not found' }, { status: 404 })
    }

    const issuedBook = issuedBooks[issuedBookIndex]

    if (issuedBook.status === 'returned') {
      return HttpResponse.json({ error: 'Book already returned' }, { status: 400 })
    }

    const returnDate = new Date()
    const dueDate = new Date(issuedBook.dueDate)
    let createdFine: Fine | null = null

    // Calculate fine if overdue
    if (returnDate > dueDate) {
      const overdueDays = Math.ceil(
        (returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      const fineAmount = overdueDays * 5 // Rs 5 per day

      createdFine = {
        id: generateId(),
        issuedBookId: issuedBook.id,
        bookId: issuedBook.bookId,
        bookTitle: issuedBook.bookTitle,
        studentId: issuedBook.studentId,
        studentName: issuedBook.studentName,
        studentClass: issuedBook.studentClass,
        studentSection: issuedBook.studentSection,
        overdueDays,
        amount: fineAmount,
        status: 'pending',
        createdAt: returnDate.toISOString(),
      }

      fines.unshift(createdFine)
    }

    // Update issued book record
    issuedBooks[issuedBookIndex] = {
      ...issuedBook,
      returnDate: returnDate.toISOString(),
      status: 'returned',
    }

    // Update book availability
    const bookIndex = books.findIndex((b) => b.id === issuedBook.bookId)
    if (bookIndex !== -1) {
      books[bookIndex].availableCopies++
    }

    return HttpResponse.json({
      data: issuedBooks[issuedBookIndex],
      fine: createdFine,
    })
  }),

  // Renew a book (extend due date)
  http.post('/api/library/renew/:id', async ({ params, request }) => {
    await mockDelay('write')
    const issuedBookIndex = issuedBooks.findIndex((ib) => ib.id === params.id)

    if (issuedBookIndex === -1) {
      return HttpResponse.json({ error: 'Issued book record not found' }, { status: 404 })
    }

    const issuedBook = issuedBooks[issuedBookIndex]

    if (issuedBook.status === 'returned') {
      return HttpResponse.json({ error: 'Cannot renew a returned book' }, { status: 400 })
    }

    // Check renewal count
    const renewalCount = issuedBook.renewalCount || 0
    if (renewalCount >= MAX_RENEWALS) {
      return HttpResponse.json(
        { error: `Maximum renewals (${MAX_RENEWALS}) reached. Please return and re-issue the book.` },
        { status: 400 }
      )
    }

    // Check if book is overdue - allow renewal but note it
    const today = new Date()
    const dueDate = new Date(issuedBook.dueDate)
    const isOverdue = today > dueDate

    // Get new due date from request or default to 14 days from today
    const body = (await request.json()) as RenewBookRequest
    const newDueDate = body.newDueDate || new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()

    // Create renewal record
    const renewalRecord: RenewalRecord = {
      renewedAt: today.toISOString(),
      previousDueDate: issuedBook.dueDate,
      newDueDate: newDueDate,
      renewedBy: 'librarian', // In real app, get from auth context
    }

    // Update issued book
    const renewalHistory = issuedBook.renewalHistory || []
    issuedBooks[issuedBookIndex] = {
      ...issuedBook,
      dueDate: newDueDate,
      status: 'issued', // Reset to issued if was overdue
      renewalCount: renewalCount + 1,
      renewalHistory: [...renewalHistory, renewalRecord],
    }

    return HttpResponse.json({
      data: issuedBooks[issuedBookIndex],
      message: isOverdue
        ? 'Book renewed successfully. Note: Book was overdue, fines may still apply.'
        : 'Book renewed successfully.',
    })
  }),

  // ==================== FINES HANDLERS ====================

  // Get all fines with filters
  http.get('/api/library/fines', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...fines]

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (f) =>
          f.bookTitle.toLowerCase().includes(search) ||
          f.studentName.toLowerCase().includes(search)
      )
    }

    // Status filter
    if (status && status !== 'all') {
      filtered = filtered.filter((f) => f.status === status)
    }

    // Sort by createdAt descending
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Pagination
    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit
    const paginatedFines = filtered.slice(startIndex, startIndex + limit)

    return HttpResponse.json({
      data: paginatedFines,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    })
  }),

  // Update fine (mark as paid or waived)
  http.patch('/api/library/fines/:id', async ({ params, request }) => {
    await mockDelay('read')
    const fineIndex = fines.findIndex((f) => f.id === params.id)

    if (fineIndex === -1) {
      return HttpResponse.json({ error: 'Fine not found' }, { status: 404 })
    }

    const body = (await request.json()) as UpdateFineRequest
    const existingFine = fines[fineIndex]

    if (existingFine.status !== 'pending') {
      return HttpResponse.json(
        { error: 'Fine has already been processed' },
        { status: 400 }
      )
    }

    const updatedFine: Fine = {
      ...existingFine,
      status: body.status,
      ...(body.status === 'paid' && { paidAt: new Date().toISOString() }),
      ...(body.status === 'waived' && {
        waivedAt: new Date().toISOString(),
        waivedReason: body.waivedReason || 'No reason provided',
      }),
    }

    fines[fineIndex] = updatedFine

    return HttpResponse.json({ data: updatedFine })
  }),

  // Delete fine
  http.delete('/api/library/fines/:id', async ({ params }) => {
    await mockDelay('write')
    const fineIndex = fines.findIndex((f) => f.id === params.id)

    if (fineIndex === -1) {
      return HttpResponse.json({ error: 'Fine not found' }, { status: 404 })
    }

    fines.splice(fineIndex, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== STATS & UTILITY HANDLERS ====================

  // Get library statistics
  http.get('/api/library/stats', async () => {
    await mockDelay('read')
    const stats = getLibraryStats()
    return HttpResponse.json({ data: stats })
  }),

  // Get available students for dropdown
  http.get('/api/library/students', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''

    let students = getAvailableStudents()

    if (search) {
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.admissionNumber.toLowerCase().includes(search) ||
          s.rollNumber.toLowerCase().includes(search)
      )
    }

    // Limit to first 50 results for performance
    return HttpResponse.json({ data: students.slice(0, 50) })
  }),

  // ==================== RESERVATION HANDLERS ====================

  // Get all reservations
  http.get('/api/library/reservations', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '10')

    let filtered = [...reservations]

    if (search) {
      filtered = filtered.filter(
        (r) =>
          r.bookTitle.toLowerCase().includes(search) ||
          r.studentName.toLowerCase().includes(search)
      )
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((r) => r.status === status)
    }

    filtered.sort((a, b) => new Date(b.reservedAt).getTime() - new Date(a.reservedAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit

    return HttpResponse.json({
      data: filtered.slice(startIndex, startIndex + limit),
      meta: { page, limit, total, totalPages },
    })
  }),

  // Create reservation
  http.post('/api/library/reservations', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as CreateReservationRequest

    const book = books.find((b) => b.id === body.bookId)
    if (!book) {
      return HttpResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    const studentsList = getAvailableStudents()
    const student = studentsList.find((s) => s.id === body.studentId)
    if (!student) {
      return HttpResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Check if already reserved
    const alreadyReserved = reservations.some(
      (r) => r.bookId === body.bookId && r.studentId === body.studentId && r.status === 'active'
    )
    if (alreadyReserved) {
      return HttpResponse.json({ error: 'Student already has an active reservation for this book' }, { status: 400 })
    }

    // Calculate queue position
    const activeQueue = reservations.filter((r) => r.bookId === body.bookId && r.status === 'active')

    const now = new Date()
    const expiresAt = new Date(now)
    expiresAt.setDate(expiresAt.getDate() + 7)

    const newReservation: BookReservation = {
      id: generateId(),
      bookId: book.id,
      bookTitle: book.title,
      bookIsbn: book.isbn,
      studentId: student.id,
      studentName: student.name,
      studentClass: student.className,
      studentSection: student.section,
      reservedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'active',
      queuePosition: activeQueue.length + 1,
    }

    reservations.unshift(newReservation)
    return HttpResponse.json({ data: newReservation }, { status: 201 })
  }),

  // Cancel reservation
  http.patch('/api/library/reservations/:id/cancel', async ({ params }) => {
    await mockDelay('read')
    const idx = reservations.findIndex((r) => r.id === params.id)

    if (idx === -1) {
      return HttpResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    if (reservations[idx].status !== 'active') {
      return HttpResponse.json({ error: 'Can only cancel active reservations' }, { status: 400 })
    }

    reservations[idx] = {
      ...reservations[idx],
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    }

    return HttpResponse.json({ data: reservations[idx] })
  }),

  // ==================== READING HISTORY & RECOMMENDATIONS ====================

  // Get reading history (paginated)
  http.get('/api/library/reading-history', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const studentId = url.searchParams.get('studentId')
    const category = url.searchParams.get('category')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    let filtered = [...readingHistory]

    if (studentId) {
      filtered = filtered.filter((r) => r.studentId === studentId)
    }
    if (category && category !== 'all') {
      filtered = filtered.filter((r) => r.bookCategory === category)
    }

    filtered.sort((a, b) => new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit

    return HttpResponse.json({
      data: filtered.slice(startIndex, startIndex + limit),
      meta: { page, limit, total, totalPages },
    })
  }),

  // Get student reading report
  http.get('/api/library/reading-report/:studentId', async ({ params }) => {
    await mockDelay('read')
    const report = getStudentReadingReport(params.studentId as string)

    if (!report) {
      return HttpResponse.json({ error: 'No reading history found' }, { status: 404 })
    }

    return HttpResponse.json({ data: report })
  }),

  // Get book recommendations for student
  http.get('/api/library/recommendations/:studentId', async ({ params }) => {
    await mockDelay('read')
    const recommendations = getBookRecommendations(params.studentId as string)
    return HttpResponse.json({ data: recommendations })
  }),

  // ==================== DIGITAL LIBRARY HANDLERS ====================

  // Get digital books
  http.get('/api/library/digital', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const category = url.searchParams.get('category')
    const format = url.searchParams.get('format')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '12')

    let filtered = [...digitalBooks]

    if (search) {
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(search) ||
          b.author.toLowerCase().includes(search)
      )
    }
    if (category && category !== 'all') {
      filtered = filtered.filter((b) => b.category === category)
    }
    if (format && format !== 'all') {
      filtered = filtered.filter((b) => b.format === format)
    }

    filtered.sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit

    return HttpResponse.json({
      data: filtered.slice(startIndex, startIndex + limit),
      meta: { page, limit, total, totalPages },
    })
  }),

  // Record digital book access
  http.post('/api/library/digital/:id/access', async ({ params }) => {
    await mockDelay('read')
    const idx = digitalBooks.findIndex((b) => b.id === params.id)
    if (idx === -1) {
      return HttpResponse.json({ error: 'Digital book not found' }, { status: 404 })
    }
    digitalBooks[idx].totalAccesses++
    return HttpResponse.json({ data: digitalBooks[idx] })
  }),

  // ==================== OVERDUE NOTIFICATION HANDLERS ====================

  // Get overdue notifications
  http.get('/api/library/notifications', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const channel = url.searchParams.get('channel')
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    let filtered = [...overdueNotifications]

    if (channel && channel !== 'all') {
      filtered = filtered.filter((n) => n.channel === channel)
    }
    if (status && status !== 'all') {
      filtered = filtered.filter((n) => n.status === status)
    }

    filtered.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

    const total = filtered.length
    const totalPages = Math.ceil(total / limit)
    const startIndex = (page - 1) * limit

    return HttpResponse.json({
      data: filtered.slice(startIndex, startIndex + limit),
      meta: { page, limit, total, totalPages },
    })
  }),

  // Get notification config
  http.get('/api/library/notifications/config', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: notificationConfig })
  }),

  // Update notification config
  http.put('/api/library/notifications/config', async ({ request }) => {
    await mockDelay('read')
    const body = (await request.json()) as Partial<NotificationConfig>
    Object.assign(notificationConfig, body)
    return HttpResponse.json({ data: notificationConfig })
  }),

  // Send manual notification
  http.post('/api/library/notifications/send', async ({ request }) => {
    await mockDelay('heavy')
    const body = (await request.json()) as { issuedBookId: string; channel: string }

    const issuedBook = issuedBooks.find((ib) => ib.id === body.issuedBookId)
    if (!issuedBook) {
      return HttpResponse.json({ error: 'Issued book not found' }, { status: 404 })
    }

    const notification: OverdueNotification = {
      id: generateId(),
      studentId: issuedBook.studentId,
      studentName: issuedBook.studentName,
      studentClass: issuedBook.studentClass,
      parentName: 'Parent',
      parentPhone: '+91-9876543210',
      parentEmail: 'parent@example.com',
      bookTitle: issuedBook.bookTitle,
      dueDate: issuedBook.dueDate,
      overdueDays: Math.max(1, Math.floor((Date.now() - new Date(issuedBook.dueDate).getTime()) / (1000 * 60 * 60 * 24))),
      fineAmount: Math.max(1, Math.floor((Date.now() - new Date(issuedBook.dueDate).getTime()) / (1000 * 60 * 60 * 24))) * 5,
      channel: body.channel as OverdueNotification['channel'],
      status: 'sent',
      sentAt: new Date().toISOString(),
      message: `Overdue reminder for "${issuedBook.bookTitle}"`,
    }

    overdueNotifications.unshift(notification)
    return HttpResponse.json({ data: notification }, { status: 201 })
  }),

  // ==================== BARCODE/QR HANDLERS ====================

  // Generate barcode for a book
  http.post('/api/library/books/:id/generate-barcode', async ({ params }) => {
    await mockDelay('read')
    const book = books.find((b) => b.id === params.id)

    if (!book) {
      return HttpResponse.json({ error: 'Book not found' }, { status: 404 })
    }

    // Generate a barcode image URL (mock)
    const barcodeUrl = `https://barcodeapi.org/api/128/${book.isbn}`

    return HttpResponse.json({
      data: {
        bookId: book.id,
        isbn: book.isbn,
        title: book.title,
        barcodeUrl,
        format: 'CODE128',
        generatedAt: new Date().toISOString(),
      },
    })
  }),

  // Lookup book by ISBN (barcode scan simulation)
  http.get('/api/library/scan/:isbn', async ({ params }) => {
    await mockDelay('read')
    const isbn = params.isbn as string
    const book = books.find((b) => b.isbn === isbn)

    return HttpResponse.json({
      data: {
        isbn,
        book: book || null,
        found: !!book,
      },
    })
  }),
]
