import { z } from 'zod'

export const applicationFormSchema = z.object({
  // Personal Info
  studentName: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female'], { required_error: 'Please select a gender' }),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),

  // Address
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().length(6, 'Pincode must be 6 digits'),
  }),

  // Academic Info
  applyingForClass: z.string().min(1, 'Please select a class'),
  previousSchool: z.string().min(2, 'Previous school name is required'),
  previousClass: z.string().min(1, 'Previous class is required'),
  previousMarks: z.number().min(0).max(100, 'Marks must be between 0 and 100'),

  // Parent Info
  fatherName: z.string().min(2, "Father's name is required"),
  motherName: z.string().min(2, "Mother's name is required"),
  guardianPhone: z.string().min(10, 'Please enter a valid phone number'),
  guardianEmail: z.string().email('Please enter a valid email address'),
  guardianOccupation: z.string().min(2, 'Occupation is required'),
})

export type ApplicationFormData = z.infer<typeof applicationFormSchema>

export const FORM_STEPS = [
  { id: 'personal', title: 'Personal Info', description: 'Student details' },
  { id: 'academic', title: 'Academic Info', description: 'School details' },
  { id: 'parent', title: 'Parent Info', description: 'Guardian details' },
  { id: 'review', title: 'Review', description: 'Confirm details' },
] as const

export type FormStepId = (typeof FORM_STEPS)[number]['id']

// Default values for the form
export const defaultFormValues: ApplicationFormData = {
  studentName: '',
  dateOfBirth: '',
  gender: 'male',
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    pincode: '',
  },
  applyingForClass: '',
  previousSchool: '',
  previousClass: '',
  previousMarks: 0,
  fatherName: '',
  motherName: '',
  guardianPhone: '',
  guardianEmail: '',
  guardianOccupation: '',
}

// Fields to validate for each step
export const stepValidationFields: Record<FormStepId, (keyof ApplicationFormData | `address.${keyof ApplicationFormData['address']}`)[]> = {
  personal: ['studentName', 'dateOfBirth', 'gender', 'email', 'phone', 'address.street', 'address.city', 'address.state', 'address.pincode'],
  academic: ['applyingForClass', 'previousSchool', 'previousClass', 'previousMarks'],
  parent: ['fatherName', 'motherName', 'guardianPhone', 'guardianEmail', 'guardianOccupation'],
  review: [],
}
