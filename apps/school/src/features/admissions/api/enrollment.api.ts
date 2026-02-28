import type { EnrollStudentRequest, EnrollStudentResponse } from '../types/enrollment.types'

const API_BASE = '/api'

export async function enrollStudent(data: EnrollStudentRequest): Promise<EnrollStudentResponse> {
  const response = await fetch(`${API_BASE}/students/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new Error('Failed to enroll student')
  }
  return response.json()
}

export async function getNextRollNumber(className: string, section: string): Promise<{ nextRollNumber: number }> {
  const response = await fetch(`${API_BASE}/students/next-roll-number?class=${encodeURIComponent(className)}&section=${encodeURIComponent(section)}`)
  if (!response.ok) {
    throw new Error('Failed to get next roll number')
  }
  return response.json()
}
