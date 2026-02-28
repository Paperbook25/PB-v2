import { faker } from '@faker-js/faker'
import { students } from './students.data'
import type {
  Book,
  BookCategory,
  IssuedBook,
  Fine,
  BookReservation,
  ReadingRecord,
  DigitalBook,
  DigitalFormat,
  OverdueNotification,
  NotificationConfig,
  NotificationChannel,
  NotificationStatus,
  StudentReadingReport,
  BookRecommendation,
} from '@/features/library/types/library.types'

// ==================== CONSTANTS ====================

const BOOK_CATEGORIES: BookCategory[] = [
  'Fiction',
  'Non-Fiction',
  'Science',
  'Mathematics',
  'History',
  'Literature',
  'Reference',
  'Biography',
  'Technology',
  'Arts',
]

const PUBLISHERS = [
  'Penguin Random House',
  'HarperCollins',
  'Simon & Schuster',
  'Macmillan Publishers',
  'Hachette Book Group',
  'Oxford University Press',
  'Cambridge University Press',
  'Pearson Education',
  'McGraw-Hill Education',
  'Scholastic',
  'National Book Trust',
  'Rupa Publications',
  'Arihant Publications',
]

const SHELF_LOCATIONS = [
  'A1', 'A2', 'A3', 'A4', 'A5',
  'B1', 'B2', 'B3', 'B4', 'B5',
  'C1', 'C2', 'C3', 'C4', 'C5',
  'D1', 'D2', 'D3', 'D4', 'D5',
  'R1', 'R2', 'R3', // Reference section
]

// Book titles by category for realistic data
const BOOK_TITLES: Record<BookCategory, string[]> = {
  Fiction: [
    'The Great Gatsby', 'To Kill a Mockingbird', 'Pride and Prejudice',
    '1984', 'The Catcher in the Rye', 'Lord of the Flies',
    'Animal Farm', 'Brave New World', 'The Alchemist',
    'One Hundred Years of Solitude', 'The Kite Runner', 'Life of Pi',
  ],
  'Non-Fiction': [
    'Sapiens', 'Thinking Fast and Slow', 'The Power of Habit',
    'Atomic Habits', 'Deep Work', 'The Lean Startup',
    'Outliers', 'Freakonomics', 'The Tipping Point',
  ],
  Science: [
    'A Brief History of Time', 'The Selfish Gene', 'Cosmos',
    'The Origin of Species', 'Silent Spring', 'The Double Helix',
    'Principles of Physics', 'Chemistry: The Central Science',
    'Campbell Biology', 'Environmental Science',
  ],
  Mathematics: [
    'Introduction to Algorithms', 'Calculus Made Easy', 'The Joy of x',
    'How to Solve It', 'Principles of Mathematical Analysis',
    'Linear Algebra Done Right', 'Discrete Mathematics',
    'Statistics for Beginners', 'Probability Theory',
  ],
  History: [
    'Guns, Germs, and Steel', 'The Diary of a Young Girl',
    'A People\'s History of the United States', 'The History of India',
    'World War II: A Complete History', 'The Rise and Fall of the Roman Empire',
    'Ancient Civilizations', 'Modern Indian History',
  ],
  Literature: [
    'Hamlet', 'Romeo and Juliet', 'Macbeth', 'The Odyssey',
    'The Iliad', 'Divine Comedy', 'Paradise Lost',
    'Gitanjali', 'The Guide', 'Midnight\'s Children',
  ],
  Reference: [
    'Oxford English Dictionary', 'Encyclopedia Britannica',
    'World Atlas', 'Thesaurus', 'Grammar in Use',
    'Scientific Encyclopedia', 'Medical Dictionary',
  ],
  Biography: [
    'Steve Jobs', 'The Autobiography of Malcolm X',
    'Long Walk to Freedom', 'Wings of Fire',
    'My Experiments with Truth', 'Einstein: His Life and Universe',
    'Alexander Hamilton', 'The Diary of Anne Frank',
  ],
  Technology: [
    'Clean Code', 'The Pragmatic Programmer', 'Design Patterns',
    'Computer Networks', 'Operating System Concepts',
    'Database System Concepts', 'Artificial Intelligence: A Modern Approach',
    'Web Development with Node.js', 'Python for Data Science',
  ],
  Arts: [
    'The Story of Art', 'Ways of Seeing', 'Art Through the Ages',
    'Drawing on the Right Side of the Brain', 'Color and Light',
    'Music Theory for Beginners', 'The Elements of Graphic Design',
  ],
}

const AUTHORS_BY_CATEGORY: Record<BookCategory, string[]> = {
  Fiction: [
    'F. Scott Fitzgerald', 'Harper Lee', 'Jane Austen', 'George Orwell',
    'J.D. Salinger', 'William Golding', 'Aldous Huxley', 'Paulo Coelho',
    'Gabriel García Márquez', 'Khaled Hosseini', 'Yann Martel',
  ],
  'Non-Fiction': [
    'Yuval Noah Harari', 'Daniel Kahneman', 'Charles Duhigg',
    'James Clear', 'Cal Newport', 'Eric Ries', 'Malcolm Gladwell',
  ],
  Science: [
    'Stephen Hawking', 'Richard Dawkins', 'Carl Sagan', 'Charles Darwin',
    'Rachel Carson', 'James Watson', 'Isaac Newton',
  ],
  Mathematics: [
    'Thomas H. Cormen', 'Silvanus P. Thompson', 'Steven Strogatz',
    'George Pólya', 'Walter Rudin', 'Sheldon Axler',
  ],
  History: [
    'Jared Diamond', 'Anne Frank', 'Howard Zinn', 'Romila Thapar',
    'William Shirer', 'Edward Gibbon',
  ],
  Literature: [
    'William Shakespeare', 'Homer', 'Dante Alighieri', 'John Milton',
    'Rabindranath Tagore', 'R.K. Narayan', 'Salman Rushdie',
  ],
  Reference: [
    'Various Authors', 'Editorial Board', 'Academic Press',
  ],
  Biography: [
    'Walter Isaacson', 'Alex Haley', 'Nelson Mandela',
    'A.P.J. Abdul Kalam', 'Mahatma Gandhi',
  ],
  Technology: [
    'Robert C. Martin', 'David Thomas', 'Erich Gamma',
    'Andrew S. Tanenbaum', 'Abraham Silberschatz', 'Stuart Russell',
  ],
  Arts: [
    'E.H. Gombrich', 'John Berger', 'Helen Gardner',
    'Betty Edwards', 'James Gurney',
  ],
}

// ==================== BOOK GENERATION ====================

function generateISBN(): string {
  return `978-${faker.string.numeric(1)}-${faker.string.numeric(4)}-${faker.string.numeric(4)}-${faker.string.numeric(1)}`
}

function createBook(index: number): Book {
  const category = BOOK_CATEGORIES[index % BOOK_CATEGORIES.length]
  const titles = BOOK_TITLES[category]
  const authors = AUTHORS_BY_CATEGORY[category]

  const title = titles[index % titles.length] || faker.commerce.productName()
  const author = authors[index % authors.length] || faker.person.fullName()

  const totalCopies = faker.number.int({ min: 2, max: 8 })
  const issuedCopies = faker.number.int({ min: 0, max: Math.min(totalCopies, 3) })

  return {
    id: faker.string.uuid(),
    isbn: generateISBN(),
    title,
    author,
    category,
    publisher: faker.helpers.arrayElement(PUBLISHERS),
    publicationYear: faker.number.int({ min: 1990, max: 2024 }),
    totalCopies,
    availableCopies: totalCopies - issuedCopies,
    description: faker.lorem.paragraph(3),
    coverUrl: `https://picsum.photos/seed/${faker.string.alphanumeric(8)}/200/300`,
    location: faker.helpers.arrayElement(SHELF_LOCATIONS),
    addedAt: faker.date.past({ years: 2 }).toISOString(),
  }
}

// Generate 85 books
export const books: Book[] = Array.from({ length: 85 }, (_, i) => createBook(i))

// ==================== ISSUED BOOKS GENERATION ====================

function createIssuedBook(book: Book, isOverdue: boolean = false): IssuedBook {
  const student = faker.helpers.arrayElement(students.filter(s => s.status === 'active'))

  let issueDate: Date
  let dueDate: Date
  let status: IssuedBook['status']

  if (isOverdue) {
    // Overdue: issued 20-40 days ago, due date already passed
    issueDate = faker.date.recent({ days: 40 })
    dueDate = new Date(issueDate)
    dueDate.setDate(dueDate.getDate() + 14)
    status = 'overdue'
  } else {
    // Current: issued within last 14 days
    issueDate = faker.date.recent({ days: 10 })
    dueDate = new Date(issueDate)
    dueDate.setDate(dueDate.getDate() + 14)
    status = 'issued'
  }

  // Randomly add renewal history for some books
  const hasBeenRenewed = faker.datatype.boolean({ probability: 0.2 })
  const renewalCount = hasBeenRenewed ? faker.number.int({ min: 1, max: 2 }) : 0
  const renewalHistory: IssuedBook['renewalHistory'] = []

  if (renewalCount > 0) {
    let prevDueDate = new Date(issueDate)
    prevDueDate.setDate(prevDueDate.getDate() + 14)

    for (let i = 0; i < renewalCount; i++) {
      const renewedAt = new Date(prevDueDate)
      renewedAt.setDate(renewedAt.getDate() - 2) // Renewed 2 days before due
      const newDueDate = new Date(prevDueDate)
      newDueDate.setDate(newDueDate.getDate() + 14)

      renewalHistory.push({
        renewedAt: renewedAt.toISOString(),
        previousDueDate: prevDueDate.toISOString(),
        newDueDate: newDueDate.toISOString(),
        renewedBy: 'librarian',
      })

      prevDueDate = newDueDate
    }

    // Update due date to final renewed date
    dueDate = new Date(renewalHistory[renewalHistory.length - 1].newDueDate)
  }

  return {
    id: faker.string.uuid(),
    bookId: book.id,
    bookTitle: book.title,
    bookIsbn: book.isbn,
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    studentSection: student.section,
    issueDate: issueDate.toISOString(),
    dueDate: dueDate.toISOString(),
    status,
    renewalCount,
    renewalHistory,
  }
}

// Select books that have been issued (those with availableCopies < totalCopies)
const booksWithIssued = books.filter(b => b.availableCopies < b.totalCopies)

// Create issued book records - mix of current and overdue
export const issuedBooks: IssuedBook[] = []

booksWithIssued.forEach((book, index) => {
  const copiesIssued = book.totalCopies - book.availableCopies
  for (let i = 0; i < copiesIssued; i++) {
    // Make roughly 30% overdue
    const isOverdue = faker.datatype.boolean({ probability: 0.3 })
    issuedBooks.push(createIssuedBook(book, isOverdue))
  }
})

// Ensure we have at least 25 issued books
while (issuedBooks.length < 25) {
  const randomBook = faker.helpers.arrayElement(books.filter(b => b.availableCopies > 0))
  if (randomBook) {
    randomBook.availableCopies--
    const isOverdue = faker.datatype.boolean({ probability: 0.3 })
    issuedBooks.push(createIssuedBook(randomBook, isOverdue))
  }
}

// ==================== FINES GENERATION ====================

const FINE_RATE = 5 // Rs 5 per day

function createFine(issuedBook: IssuedBook): Fine {
  const dueDate = new Date(issuedBook.dueDate)
  const today = new Date()
  const overdueDays = Math.max(0, Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))

  const status = faker.helpers.weightedArrayElement([
    { value: 'pending' as const, weight: 60 },
    { value: 'paid' as const, weight: 30 },
    { value: 'waived' as const, weight: 10 },
  ])

  const fine: Fine = {
    id: faker.string.uuid(),
    issuedBookId: issuedBook.id,
    bookId: issuedBook.bookId,
    bookTitle: issuedBook.bookTitle,
    studentId: issuedBook.studentId,
    studentName: issuedBook.studentName,
    studentClass: issuedBook.studentClass,
    studentSection: issuedBook.studentSection,
    overdueDays,
    amount: overdueDays * FINE_RATE,
    status,
    createdAt: issuedBook.dueDate,
  }

  if (status === 'paid') {
    fine.paidAt = faker.date.recent({ days: 7 }).toISOString()
  } else if (status === 'waived') {
    fine.waivedAt = faker.date.recent({ days: 7 }).toISOString()
    fine.waivedReason = faker.helpers.arrayElement([
      'First-time offender',
      'Medical emergency',
      'Family circumstances',
      'Book was damaged before issue',
    ])
  }

  return fine
}

// Create fines for overdue books
export const fines: Fine[] = issuedBooks
  .filter(ib => ib.status === 'overdue')
  .map(createFine)

// Add some historical fines (from returned books)
const historicalFinesCount = faker.number.int({ min: 5, max: 10 })
for (let i = 0; i < historicalFinesCount; i++) {
  const randomBook = faker.helpers.arrayElement(books)
  const student = faker.helpers.arrayElement(students.filter(s => s.status === 'active'))
  const overdueDays = faker.number.int({ min: 1, max: 15 })

  fines.push({
    id: faker.string.uuid(),
    issuedBookId: faker.string.uuid(), // Historical, no longer in issuedBooks
    bookId: randomBook.id,
    bookTitle: randomBook.title,
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    studentSection: student.section,
    overdueDays,
    amount: overdueDays * FINE_RATE,
    status: faker.helpers.arrayElement(['paid', 'waived'] as const),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    paidAt: faker.date.past({ years: 1 }).toISOString(),
  })
}

// ==================== HELPER FUNCTIONS ====================

export function getLibraryStats() {
  const overdueBooks = issuedBooks.filter(ib => ib.status === 'overdue').length
  const pendingFines = fines.filter(f => f.status === 'pending')
  const uniqueStudentsWithBooks = new Set(issuedBooks.map(ib => ib.studentId)).size

  return {
    totalBooks: books.reduce((sum, b) => sum + b.totalCopies, 0),
    availableBooks: books.reduce((sum, b) => sum + b.availableCopies, 0),
    issuedBooks: issuedBooks.filter(ib => ib.status !== 'returned').length,
    overdueBooks,
    totalFines: fines.length,
    pendingFinesAmount: pendingFines.reduce((sum, f) => sum + f.amount, 0),
    totalStudentsWithBooks: uniqueStudentsWithBooks,
  }
}

export function getAvailableStudents() {
  return students
    .filter(s => s.status === 'active')
    .map(s => ({
      id: s.id,
      name: s.name,
      className: s.class,
      section: s.section,
      rollNumber: String(s.rollNumber),
      admissionNumber: s.admissionNumber,
    }))
}

// ==================== RESERVATIONS ====================

const unavailableBooks = books.filter(b => b.availableCopies === 0)
const activeStudents = students.filter(s => s.status === 'active')

export const reservations: BookReservation[] = []

// Create reservations for unavailable books
unavailableBooks.slice(0, 8).forEach((book, idx) => {
  const queueSize = faker.number.int({ min: 1, max: 3 })
  for (let q = 0; q < queueSize; q++) {
    const student = activeStudents[(idx * 3 + q) % activeStudents.length]
    const reservedAt = faker.date.recent({ days: 14 })
    const expiresAt = new Date(reservedAt)
    expiresAt.setDate(expiresAt.getDate() + 7)
    const status = faker.helpers.weightedArrayElement([
      { value: 'active' as const, weight: 60 },
      { value: 'fulfilled' as const, weight: 20 },
      { value: 'cancelled' as const, weight: 10 },
      { value: 'expired' as const, weight: 10 },
    ])
    reservations.push({
      id: faker.string.uuid(),
      bookId: book.id,
      bookTitle: book.title,
      bookIsbn: book.isbn,
      studentId: student.id,
      studentName: student.name,
      studentClass: student.class,
      studentSection: student.section,
      reservedAt: reservedAt.toISOString(),
      expiresAt: expiresAt.toISOString(),
      status,
      queuePosition: q + 1,
      fulfilledAt: status === 'fulfilled' ? faker.date.recent({ days: 3 }).toISOString() : undefined,
      cancelledAt: status === 'cancelled' ? faker.date.recent({ days: 5 }).toISOString() : undefined,
    })
  }
})

// Ensure at least 12 reservations
while (reservations.length < 12) {
  const book = faker.helpers.arrayElement(books)
  const student = faker.helpers.arrayElement(activeStudents)
  const reservedAt = faker.date.recent({ days: 21 })
  const expiresAt = new Date(reservedAt)
  expiresAt.setDate(expiresAt.getDate() + 7)
  reservations.push({
    id: faker.string.uuid(),
    bookId: book.id,
    bookTitle: book.title,
    bookIsbn: book.isbn,
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    studentSection: student.section,
    reservedAt: reservedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'active',
    queuePosition: 1,
  })
}

// ==================== READING HISTORY ====================

export const readingHistory: ReadingRecord[] = []

// Generate historical reading records from returned books concept
const completedCategories = [...BOOK_CATEGORIES]
for (let i = 0; i < 60; i++) {
  const student = activeStudents[i % activeStudents.length]
  const book = books[i % books.length]
  const issueDate = faker.date.past({ years: 1 })
  const daysToRead = faker.number.int({ min: 3, max: 20 })
  const returnDate = new Date(issueDate)
  returnDate.setDate(returnDate.getDate() + daysToRead)

  readingHistory.push({
    id: faker.string.uuid(),
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    studentSection: student.section,
    bookId: book.id,
    bookTitle: book.title,
    bookAuthor: book.author,
    bookCategory: book.category,
    issueDate: issueDate.toISOString(),
    returnDate: returnDate.toISOString(),
    daysToRead,
    rating: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 5 }), { probability: 0.7 }),
  })
}

export function getStudentReadingReport(studentId: string): StudentReadingReport | null {
  const studentRecords = readingHistory.filter(r => r.studentId === studentId)
  if (studentRecords.length === 0) return null

  const student = studentRecords[0]
  const categoryMap = new Map<BookCategory, number>()
  studentRecords.forEach(r => {
    categoryMap.set(r.bookCategory, (categoryMap.get(r.bookCategory) || 0) + 1)
  })
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  const monthMap = new Map<string, number>()
  studentRecords.forEach(r => {
    const month = new Date(r.returnDate).toISOString().slice(0, 7)
    monthMap.set(month, (monthMap.get(month) || 0) + 1)
  })
  const monthlyBreakdown = Array.from(monthMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))

  const ratingsSum = studentRecords.filter(r => r.rating).reduce((s, r) => s + (r.rating || 0), 0)
  const ratingsCount = studentRecords.filter(r => r.rating).length

  return {
    studentId,
    studentName: student.studentName,
    studentClass: student.studentClass,
    studentSection: student.studentSection,
    totalBooksRead: studentRecords.length,
    averageDaysToRead: Math.round(studentRecords.reduce((s, r) => s + r.daysToRead, 0) / studentRecords.length),
    averageRating: ratingsCount > 0 ? Math.round((ratingsSum / ratingsCount) * 10) / 10 : 0,
    favoriteCategory: categoryBreakdown[0]?.category || 'Fiction',
    categoryBreakdown,
    monthlyBreakdown,
    recentBooks: studentRecords.sort((a, b) => b.returnDate.localeCompare(a.returnDate)).slice(0, 10),
  }
}

export function getBookRecommendations(studentId: string): BookRecommendation[] {
  const studentRecords = readingHistory.filter(r => r.studentId === studentId)
  const readBookIds = new Set(studentRecords.map(r => r.bookId))
  const categoryFreq = new Map<BookCategory, number>()
  studentRecords.forEach(r => {
    categoryFreq.set(r.bookCategory, (categoryFreq.get(r.bookCategory) || 0) + 1)
  })

  return books
    .filter(b => !readBookIds.has(b.id) && b.availableCopies > 0)
    .map(b => {
      const catScore = (categoryFreq.get(b.category) || 0) * 20
      const recencyScore = Math.min(30, (2025 - b.publicationYear) <= 5 ? 30 : 10)
      const matchScore = Math.min(100, catScore + recencyScore + faker.number.int({ min: 5, max: 25 }))
      const reasons = [
        `Popular in ${b.category}`,
        `Matches your reading preferences`,
        `Highly rated by other students`,
        `Recommended for ${b.category} readers`,
      ]
      return {
        bookId: b.id,
        bookTitle: b.title,
        bookAuthor: b.author,
        bookCategory: b.category,
        coverUrl: b.coverUrl,
        reason: faker.helpers.arrayElement(reasons),
        matchScore,
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 10)
}

// ==================== DIGITAL LIBRARY ====================

const DIGITAL_TITLES: { title: string; author: string; category: BookCategory; format: DigitalFormat }[] = [
  { title: 'NCERT Physics Class 12', author: 'NCERT', category: 'Science', format: 'pdf' },
  { title: 'NCERT Chemistry Class 12', author: 'NCERT', category: 'Science', format: 'pdf' },
  { title: 'NCERT Mathematics Class 12', author: 'NCERT', category: 'Mathematics', format: 'pdf' },
  { title: 'NCERT Biology Class 12', author: 'NCERT', category: 'Science', format: 'pdf' },
  { title: 'NCERT History Class 10', author: 'NCERT', category: 'History', format: 'pdf' },
  { title: 'The Great Gatsby (Audio)', author: 'F. Scott Fitzgerald', category: 'Fiction', format: 'audiobook' },
  { title: 'Sapiens (ePub)', author: 'Yuval Noah Harari', category: 'Non-Fiction', format: 'epub' },
  { title: 'A Brief History of Time (ePub)', author: 'Stephen Hawking', category: 'Science', format: 'epub' },
  { title: 'Wings of Fire (Audio)', author: 'A.P.J. Abdul Kalam', category: 'Biography', format: 'audiobook' },
  { title: 'Clean Code (PDF)', author: 'Robert C. Martin', category: 'Technology', format: 'pdf' },
  { title: 'The Alchemist (ePub)', author: 'Paulo Coelho', category: 'Fiction', format: 'epub' },
  { title: 'Atomic Habits (Audio)', author: 'James Clear', category: 'Non-Fiction', format: 'audiobook' },
  { title: 'NCERT English Class 10', author: 'NCERT', category: 'Literature', format: 'pdf' },
  { title: 'Introduction to Algorithms (PDF)', author: 'Thomas H. Cormen', category: 'Technology', format: 'pdf' },
  { title: 'Oxford Dictionary (PDF)', author: 'Oxford University Press', category: 'Reference', format: 'pdf' },
]

export const digitalBooks: DigitalBook[] = DIGITAL_TITLES.map((dt, i) => {
  const linkedBook = books.find(b => b.title === dt.title.replace(/ \(.*\)$/, ''))
  return {
    id: faker.string.uuid(),
    bookId: linkedBook?.id,
    title: dt.title,
    author: dt.author,
    category: dt.category,
    format: dt.format,
    fileSize: dt.format === 'audiobook'
      ? `${faker.number.int({ min: 50, max: 200 })} MB`
      : `${faker.number.float({ min: 0.5, max: 15, fractionDigits: 1 })} MB`,
    coverUrl: `https://picsum.photos/seed/digital-${i}/200/300`,
    description: faker.lorem.paragraph(2),
    totalAccesses: faker.number.int({ min: 10, max: 500 }),
    addedAt: faker.date.past({ years: 1 }).toISOString(),
    downloadUrl: `#download-${faker.string.alphanumeric(8)}`,
  }
})

// ==================== OVERDUE NOTIFICATIONS ====================

const overdueIssuedBooks = issuedBooks.filter(ib => ib.status === 'overdue')

export const overdueNotifications: OverdueNotification[] = overdueIssuedBooks.flatMap(ib => {
  const student = students.find(s => s.id === ib.studentId)
  const dueDate = new Date(ib.dueDate)
  const overdueDays = Math.max(1, Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24)))
  const channels: NotificationChannel[] = ['sms', 'email', 'whatsapp']

  return channels.slice(0, faker.number.int({ min: 1, max: 3 })).map(channel => ({
    id: faker.string.uuid(),
    studentId: ib.studentId,
    studentName: ib.studentName,
    studentClass: ib.studentClass,
    parentName: student ? `${faker.person.firstName()} ${student.name.split(' ').pop()}` : 'Parent',
    parentPhone: faker.phone.number({ style: 'national' }),
    parentEmail: faker.internet.email(),
    bookTitle: ib.bookTitle,
    dueDate: ib.dueDate,
    overdueDays,
    fineAmount: overdueDays * 5,
    channel,
    status: faker.helpers.weightedArrayElement([
      { value: 'delivered' as const, weight: 50 },
      { value: 'sent' as const, weight: 30 },
      { value: 'failed' as const, weight: 10 },
      { value: 'pending' as const, weight: 10 },
    ]),
    sentAt: faker.date.recent({ days: 7 }).toISOString(),
    message: `Dear Parent, ${ib.studentName}'s library book "${ib.bookTitle}" is overdue by ${overdueDays} days. Fine: Rs ${overdueDays * 5}. Please return it at the earliest.`,
  }))
})

export const notificationConfig: NotificationConfig = {
  autoSendEnabled: true,
  channels: ['sms', 'email'],
  sendAfterDays: 1,
  repeatEveryDays: 3,
  maxReminders: 5,
  messageTemplate: 'Dear Parent, {{studentName}}\'s library book "{{bookTitle}}" is overdue by {{overdueDays}} days. Fine: Rs {{fineAmount}}. Please return it at the earliest.',
}
