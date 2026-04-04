const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://paperbook.app/api'

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || `Request failed: ${res.status}`)
  }

  return res.json()
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    apiFetch<any>('/public/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  // Dashboard
  getMe: () => apiFetch<any>('/me'),

  // Attendance
  getAttendance: (date?: string) => {
    const qs = date ? `?date=${date}` : ''
    return apiFetch<any>(`/attendance${qs}`)
  },
  markAttendance: (data: any) =>
    apiFetch<any>('/attendance', { method: 'POST', body: JSON.stringify(data) }),

  // Students
  getStudents: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return apiFetch<any>(`/students${qs}`)
  },

  // Finance
  getFeeStatus: () => apiFetch<any>('/finance/student-fee-status'),

  // Notifications
  getNotifications: () => apiFetch<any>('/notifications'),

  // Communication
  getAnnouncements: () => apiFetch<any>('/communication/announcements'),

  // Timetable
  getTimetable: () => apiFetch<any>('/timetable'),
}
