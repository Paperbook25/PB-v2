export type Role = 'admin' | 'principal' | 'teacher' | 'accountant' | 'librarian' | 'transport_manager' | 'student' | 'parent'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  avatar?: string
  phone?: string
  // Student-specific fields
  studentId?: string
  class?: string
  section?: string
  rollNumber?: number
  // Parent-specific fields
  childIds?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface SelectOption {
  label: string
  value: string
}

export type Status = 'active' | 'inactive'

export interface Address {
  street: string
  city: string
  state: string
  pincode: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  createdBy: string
}

export interface Event {
  id: string
  title: string
  date: string
  type: 'holiday' | 'exam' | 'meeting' | 'event'
  description?: string
}

export interface Activity {
  id: string
  action: string
  description: string
  timestamp: string
  user: {
    name: string
    avatar?: string
  }
}
