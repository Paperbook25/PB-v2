import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Loader2 } from 'lucide-react'
import { adminApi } from '../../../lib/api'

const createSchoolSchema = z.object({
  name: z.string().min(2, 'School name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  adminEmail: z.string().email('Valid email is required'),
  adminName: z.string().min(2, 'Admin name must be at least 2 characters'),
  adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  planTier: z.enum(['free', 'starter', 'professional', 'enterprise']),
})

type CreateSchoolForm = z.infer<typeof createSchoolSchema>

interface CreateSchoolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSchoolDialog({ open, onOpenChange }: CreateSchoolDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateSchoolForm>({
    resolver: zodResolver(createSchoolSchema),
    defaultValues: {
      planTier: 'free',
    },
  })

  const nameValue = watch('name')

  const createMutation = useMutation({
    mutationFn: (data: CreateSchoolForm) => adminApi.createSchool(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'schools'] })
      reset()
      onOpenChange(false)
    },
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setValue('name', name)
    setValue('slug', generateSlug(name))
  }

  const onSubmit = (data: CreateSchoolForm) => {
    createMutation.mutate(data)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg rounded-xl border border-border bg-card shadow-xl animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-lg font-semibold text-foreground">Create New School</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 py-5">
            {createMutation.isError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {(createMutation.error as Error)?.message || 'Failed to create school'}
              </div>
            )}

            {/* School Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                School Name <span className="text-destructive">*</span>
              </label>
              <input
                {...register('name')}
                onChange={handleNameChange}
                placeholder="Springfield Elementary"
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Slug <span className="text-destructive">*</span>
              </label>
              <input
                {...register('slug')}
                placeholder="springfield-elementary"
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.slug && (
                <p className="mt-1 text-xs text-destructive">{errors.slug.message}</p>
              )}
            </div>

            {/* Admin Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Admin Name <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('adminName')}
                  placeholder="John Doe"
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {errors.adminName && (
                  <p className="mt-1 text-xs text-destructive">{errors.adminName.message}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Admin Email <span className="text-destructive">*</span>
                </label>
                <input
                  {...register('adminEmail')}
                  type="email"
                  placeholder="admin@school.com"
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
                {errors.adminEmail && (
                  <p className="mt-1 text-xs text-destructive">{errors.adminEmail.message}</p>
                )}
              </div>
            </div>

            {/* Admin Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Admin Password <span className="text-destructive">*</span>
              </label>
              <input
                {...register('adminPassword')}
                type="password"
                placeholder="Minimum 8 characters"
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.adminPassword && (
                <p className="mt-1 text-xs text-destructive">{errors.adminPassword.message}</p>
              )}
            </div>

            {/* Address fields */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Address</label>
                <input
                  {...register('address')}
                  placeholder="123 Main St"
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">City</label>
                <input
                  {...register('city')}
                  placeholder="Springfield"
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">State</label>
                <input
                  {...register('state')}
                  placeholder="IL"
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>

            {/* Phone & Plan */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Phone</label>
                <input
                  {...register('phone')}
                  placeholder="+1 (555) 000-0000"
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Plan Tier <span className="text-destructive">*</span>
                </label>
                <select
                  {...register('planTier')}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="h-9 rounded-lg border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 disabled:pointer-events-none"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create School'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
