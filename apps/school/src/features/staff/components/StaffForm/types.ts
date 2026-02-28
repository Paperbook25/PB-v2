import { z } from 'zod'

export const staffFormSchema = z.object({
  // Personal Info
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female'], { required_error: 'Please select a gender' }),
  photoUrl: z.string().optional(),

  // Address
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().length(6, 'Pincode must be 6 digits'),
  }),

  // Emergency Contact
  emergencyContact: z.object({
    name: z.string().min(2, 'Emergency contact name is required'),
    phone: z.string().min(10, 'Emergency contact phone is required'),
    relationship: z.string().min(2, 'Relationship is required'),
  }),

  // Professional Info
  department: z.string().min(1, 'Please select a department'),
  designation: z.string().min(1, 'Please select a designation'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  qualification: z.array(z.string()).min(1, 'At least one qualification is required'),
  specialization: z.string().min(2, 'Specialization is required'),
  salary: z.number().min(10000, 'Salary must be at least 10,000'),

  // Bank Details
  bankDetails: z.object({
    accountNumber: z.string().min(9, 'Account number must be at least 9 digits'),
    bankName: z.string().min(2, 'Bank name is required'),
    ifscCode: z.string().length(11, 'IFSC code must be 11 characters'),
    accountHolderName: z.string().min(2, 'Account holder name is required'),
  }),
})

export type StaffFormData = z.infer<typeof staffFormSchema>

export const FORM_STEPS = [
  { id: 'personal', title: 'Personal Info', description: 'Basic details' },
  { id: 'professional', title: 'Professional Info', description: 'Job details' },
  { id: 'bank', title: 'Bank Details', description: 'Payment info' },
  { id: 'review', title: 'Review', description: 'Confirm details' },
] as const

export type FormStepId = (typeof FORM_STEPS)[number]['id']

// Default values for the form
export const defaultFormValues: StaffFormData = {
  name: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'male',
  photoUrl: '',
  address: {
    street: '',
    city: '',
    state: '',
    pincode: '',
  },
  emergencyContact: {
    name: '',
    phone: '',
    relationship: '',
  },
  department: '',
  designation: '',
  joiningDate: '',
  qualification: [],
  specialization: '',
  salary: 30000,
  bankDetails: {
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    accountHolderName: '',
  },
}

// Fields to validate for each step
export const stepValidationFields: Record<
  FormStepId,
  (
    | keyof StaffFormData
    | `address.${keyof StaffFormData['address']}`
    | `emergencyContact.${keyof StaffFormData['emergencyContact']}`
    | `bankDetails.${keyof StaffFormData['bankDetails']}`
  )[]
> = {
  personal: [
    'name',
    'email',
    'phone',
    'dateOfBirth',
    'gender',
    'address.street',
    'address.city',
    'address.state',
    'address.pincode',
    'emergencyContact.name',
    'emergencyContact.phone',
    'emergencyContact.relationship',
  ],
  professional: ['department', 'designation', 'joiningDate', 'qualification', 'specialization', 'salary'],
  bank: [
    'bankDetails.accountNumber',
    'bankDetails.bankName',
    'bankDetails.ifscCode',
    'bankDetails.accountHolderName',
  ],
  review: [],
}
