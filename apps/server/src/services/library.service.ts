import { prisma } from '../config/db.js'

// ==================== Books: List ====================

export async function listBooks(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    search?: string
    category?: string
    status?: string
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.category) where.category = query.category
  if (query.status) where.status = query.status
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { author: { contains: query.search, mode: 'insensitive' } },
      { isbn: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await prisma.$transaction([
    prisma.libraryBook.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.libraryBook.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Books: Get by ID ====================

export async function getBookById(schoolId: string, id: string) {
  const book = await prisma.libraryBook.findFirst({
    where: { id, organizationId: schoolId },
    include: { issues: { orderBy: { issueDate: 'desc' }, take: 10 } },
  })
  if (!book) throw new Error('Book not found')
  return book
}

// ==================== Books: Create ====================

export async function createBook(
  schoolId: string,
  input: {
    isbn?: string
    title: string
    author: string
    publisher?: string
    category?: string
    subject?: string
    language?: string
    totalCopies?: number
    shelfLocation?: string
    coverImage?: string
  }
) {
  const copies = input.totalCopies ?? 1
  return prisma.libraryBook.create({
    data: {
      organizationId: schoolId,
      isbn: input.isbn ?? null,
      title: input.title,
      author: input.author,
      publisher: input.publisher ?? null,
      category: input.category ?? 'general',
      subject: input.subject ?? null,
      language: input.language ?? 'English',
      totalCopies: copies,
      availableCopies: copies,
      shelfLocation: input.shelfLocation ?? null,
      coverImage: input.coverImage ?? null,
    },
  })
}

// ==================== Books: Update ====================

export async function updateBook(
  schoolId: string,
  id: string,
  input: Record<string, unknown>
) {
  const existing = await prisma.libraryBook.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Book not found')

  return prisma.libraryBook.update({ where: { id }, data: input })
}

// ==================== Books: Delete ====================

export async function deleteBook(schoolId: string, id: string) {
  const existing = await prisma.libraryBook.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Book not found')

  // Delete related issues first, then the book
  await prisma.$transaction([
    prisma.libraryIssue.deleteMany({ where: { bookId: id } }),
    prisma.libraryBook.delete({ where: { id } }),
  ])
  return { success: true }
}

// ==================== Issue Book ====================

export async function issueBook(
  schoolId: string,
  input: {
    bookId: string
    borrowerType: string
    borrowerId: string
    borrowerName: string
    dueDate: string
    issuedBy?: string
  }
) {
  const book = await prisma.libraryBook.findFirst({
    where: { id: input.bookId, organizationId: schoolId },
  })
  if (!book) throw new Error('Book not found')
  if (book.availableCopies <= 0) throw new Error('No copies available for issue')

  const [issue] = await prisma.$transaction([
    prisma.libraryIssue.create({
      data: {
        organizationId: schoolId,
        bookId: input.bookId,
        borrowerType: input.borrowerType,
        borrowerId: input.borrowerId,
        borrowerName: input.borrowerName,
        dueDate: new Date(input.dueDate),
        issuedBy: input.issuedBy ?? null,
      },
    }),
    prisma.libraryBook.update({
      where: { id: input.bookId },
      data: {
        availableCopies: { decrement: 1 },
        status: book.availableCopies === 1 ? 'all_issued' : 'available',
      },
    }),
  ])

  return issue
}

// ==================== Return Book ====================

export async function returnBook(schoolId: string, issueId: string) {
  const issue = await prisma.libraryIssue.findFirst({
    where: { id: issueId, organizationId: schoolId },
  })
  if (!issue) throw new Error('Issue record not found')
  if (issue.status === 'returned') throw new Error('Book already returned')

  const now = new Date()
  let fineAmount = 0
  // Calculate fine: Rs 1/day for overdue
  if (now > issue.dueDate) {
    const overdueDays = Math.ceil(
      (now.getTime() - issue.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    fineAmount = overdueDays * 1 // Rs 1 per day
  }

  const [updatedIssue] = await prisma.$transaction([
    prisma.libraryIssue.update({
      where: { id: issueId },
      data: {
        returnDate: now,
        status: 'returned',
        fineAmount: fineAmount > 0 ? fineAmount : null,
      },
    }),
    prisma.libraryBook.update({
      where: { id: issue.bookId },
      data: {
        availableCopies: { increment: 1 },
        status: 'available',
      },
    }),
  ])

  return updatedIssue
}

// ==================== Issues: List ====================

export async function listIssues(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    status?: string
    borrowerId?: string
    bookId?: string
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.status) where.status = query.status
  if (query.borrowerId) where.borrowerId = query.borrowerId
  if (query.bookId) where.bookId = query.bookId

  const [data, total] = await prisma.$transaction([
    prisma.libraryIssue.findMany({
      where,
      include: { book: { select: { title: true, author: true, isbn: true } } },
      orderBy: { issueDate: 'desc' },
      skip,
      take: limit,
    }),
    prisma.libraryIssue.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Overdue Books ====================

export async function getOverdueBooks(schoolId: string) {
  const now = new Date()
  return prisma.libraryIssue.findMany({
    where: {
      organizationId: schoolId,
      status: { in: ['issued', 'overdue'] },
      dueDate: { lt: now },
      returnDate: null,
    },
    include: { book: { select: { title: true, author: true } } },
    orderBy: { dueDate: 'asc' },
  })
}

// ==================== Library Stats ====================

export async function getLibraryStats(schoolId: string) {
  const now = new Date()

  const [totalBooks, totalCopies, issuedCount, overdueCount, memberCount] =
    await Promise.all([
      prisma.libraryBook.count({ where: { organizationId: schoolId } }),
      prisma.libraryBook.aggregate({
        where: { organizationId: schoolId },
        _sum: { totalCopies: true, availableCopies: true },
      }),
      prisma.libraryIssue.count({
        where: { organizationId: schoolId, status: 'issued' },
      }),
      prisma.libraryIssue.count({
        where: {
          organizationId: schoolId,
          status: { in: ['issued', 'overdue'] },
          dueDate: { lt: now },
          returnDate: null,
        },
      }),
      prisma.libraryIssue.groupBy({
        by: ['borrowerId'],
        where: { organizationId: schoolId },
      }),
    ])

  return {
    totalBooks,
    totalCopies: totalCopies._sum.totalCopies ?? 0,
    availableCopies: totalCopies._sum.availableCopies ?? 0,
    issuedCount,
    overdueCount,
    totalMembers: memberCount.length,
  }
}

// ==================== Fines: List ====================

export async function listFines(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    status?: string
    borrowerId?: string
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.status) where.status = query.status
  if (query.borrowerId) where.borrowerId = query.borrowerId

  const [data, total] = await prisma.$transaction([
    prisma.libraryFine.findMany({
      where,
      include: {
        issue: {
          select: {
            bookId: true,
            borrowerName: true,
            issueDate: true,
            dueDate: true,
            returnDate: true,
            book: { select: { title: true, author: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.libraryFine.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Fines: Update ====================

export async function updateFine(
  schoolId: string,
  id: string,
  input: {
    status?: string
    amount?: number
    notes?: string
  }
) {
  const existing = await prisma.libraryFine.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Fine not found')

  const updateData: Record<string, unknown> = {}
  if (input.amount !== undefined) updateData.amount = input.amount
  if (input.notes !== undefined) updateData.notes = input.notes
  if (input.status) {
    updateData.status = input.status
    if (input.status === 'paid') {
      updateData.paidAt = new Date()
    }
  }

  return prisma.libraryFine.update({ where: { id }, data: updateData })
}

// ==================== Fines: Delete ====================

export async function deleteFine(schoolId: string, id: string) {
  const existing = await prisma.libraryFine.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Fine not found')

  await prisma.libraryFine.delete({ where: { id } })
  return { success: true }
}

// ==================== Reservations: List ====================

export async function listReservations(
  schoolId: string,
  query: {
    page?: number
    limit?: number
    status?: string
    studentId?: string
    bookId?: string
  }
) {
  const page = query.page ?? 1
  const limit = query.limit ?? 20
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = { organizationId: schoolId }

  if (query.status) where.status = query.status
  if (query.studentId) where.studentId = query.studentId
  if (query.bookId) where.bookId = query.bookId

  const [data, total] = await prisma.$transaction([
    prisma.libraryReservation.findMany({
      where,
      include: {
        book: { select: { title: true, author: true, isbn: true, availableCopies: true } },
      },
      orderBy: { reservedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.libraryReservation.count({ where }),
  ])

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  }
}

// ==================== Reservations: Create ====================

export async function createReservation(
  schoolId: string,
  input: {
    bookId: string
    studentId: string
    studentName: string
  }
) {
  // Verify the book exists
  const book = await prisma.libraryBook.findFirst({
    where: { id: input.bookId, organizationId: schoolId },
  })
  if (!book) throw new Error('Book not found')

  // Check if the student already has an active reservation for this book
  const existingReservation = await prisma.libraryReservation.findFirst({
    where: {
      organizationId: schoolId,
      bookId: input.bookId,
      studentId: input.studentId,
      status: 'active',
    },
  })
  if (existingReservation) throw new Error('Student already has an active reservation for this book')

  // Reservation expires in 3 days
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 3)

  return prisma.libraryReservation.create({
    data: {
      organizationId: schoolId,
      bookId: input.bookId,
      studentId: input.studentId,
      studentName: input.studentName,
      expiresAt,
    },
    include: {
      book: { select: { title: true, author: true } },
    },
  })
}

// ==================== Reservations: Cancel ====================

export async function cancelReservation(schoolId: string, id: string) {
  const existing = await prisma.libraryReservation.findFirst({
    where: { id, organizationId: schoolId },
  })
  if (!existing) throw new Error('Reservation not found')
  if (existing.status !== 'active') throw new Error('Reservation is not active')

  return prisma.libraryReservation.update({
    where: { id },
    data: { status: 'cancelled', cancelledAt: new Date() },
  })
}

// ==================== Renew Book ====================

export async function renewBook(
  schoolId: string,
  issueId: string,
  input: { additionalDays?: number }
) {
  const issue = await prisma.libraryIssue.findFirst({
    where: { id: issueId, organizationId: schoolId },
  })
  if (!issue) throw new Error('Issue record not found')
  if (issue.status === 'returned') throw new Error('Cannot renew a returned book')
  if (issue.status === 'lost') throw new Error('Cannot renew a lost book')

  // Default renewal: extend by 14 days from current due date
  const days = input.additionalDays ?? 14
  const newDueDate = new Date(issue.dueDate)
  newDueDate.setDate(newDueDate.getDate() + days)

  return prisma.libraryIssue.update({
    where: { id: issueId },
    data: {
      dueDate: newDueDate,
      status: 'issued', // Reset to issued if it was overdue
    },
    include: {
      book: { select: { title: true, author: true } },
    },
  })
}

// ==================== Available Students ====================

const DEFAULT_BORROW_LIMIT = 3

export async function getAvailableStudents(
  schoolId: string,
  query: { search?: string; limit?: number }
) {
  const limit = query.limit ?? 50

  // Get all active students
  const studentWhere: Record<string, unknown> = {
    organizationId: schoolId,
    status: 'active',
  }
  if (query.search) {
    studentWhere.OR = [
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName: { contains: query.search, mode: 'insensitive' } },
      { admissionNumber: { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const students = await prisma.student.findMany({
    where: studentWhere,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      admissionNumber: true,
      classId: true,
      sectionId: true,
      class: { select: { name: true } },
      section: { select: { name: true } },
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    take: limit,
  })

  // Get count of currently issued books per student
  const issuedCounts = await prisma.libraryIssue.groupBy({
    by: ['borrowerId'],
    where: {
      organizationId: schoolId,
      status: { in: ['issued', 'overdue'] },
      borrowerId: { in: students.map((s) => s.id) },
    },
    _count: { id: true },
  })

  const issuedMap = new Map(issuedCounts.map((c) => [c.borrowerId, c._count.id]))

  return students
    .map((s) => ({
      ...s,
      currentlyIssued: issuedMap.get(s.id) ?? 0,
      borrowLimit: DEFAULT_BORROW_LIMIT,
      canBorrow: (issuedMap.get(s.id) ?? 0) < DEFAULT_BORROW_LIMIT,
    }))
    .filter((s) => s.canBorrow)
}
