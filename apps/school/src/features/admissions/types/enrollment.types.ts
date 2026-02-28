import type { Application } from './admission.types'
import type { Student } from '@/features/students/types/student.types'

export interface EnrollmentFormData {
  section: 'A' | 'B' | 'C' | 'D'
  rollNumber: number
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'
}

export interface EnrollStudentRequest {
  applicationId: string
  section: string
  rollNumber: number
  bloodGroup: string
}

export interface EnrollStudentResponse {
  student: Student
  application: Application
}

export const SECTIONS = ['A', 'B', 'C', 'D'] as const
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const
