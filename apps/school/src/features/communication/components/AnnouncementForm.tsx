import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Announcement, CreateAnnouncementRequest, AnnouncementPriority } from '../types/communication.types'
import { Role } from '@/types/common.types'

const TARGET_TYPES = ['all', 'role', 'class', 'section', 'individual'] as const

const announcementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  targetType: z.enum(TARGET_TYPES),
  targetRoles: z.array(z.string()).optional(),
  scheduledAt: z.string().optional(),
  expiresAt: z.string().optional(),
  acknowledgementRequired: z.boolean(),
})

type AnnouncementFormData = z.infer<typeof announcementSchema>

interface AnnouncementFormProps {
  announcement?: Announcement
  onSubmit: (data: CreateAnnouncementRequest) => void
  isLoading?: boolean
  onCancel?: () => void
}

const roles: { value: Role; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'principal', label: 'Principal' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'librarian', label: 'Librarian' },
  { value: 'transport_manager', label: 'Transport Manager' },
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
]

export function AnnouncementForm({
  announcement,
  onSubmit,
  isLoading,
  onCancel,
}: AnnouncementFormProps) {
  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: announcement?.title || '',
      content: announcement?.content || '',
      priority: announcement?.priority || 'normal',
      targetType: announcement?.target?.type || 'all',
      targetRoles: announcement?.target?.roles || [],
      scheduledAt: announcement?.scheduledAt
        ? new Date(announcement.scheduledAt).toISOString().slice(0, 16)
        : '',
      expiresAt: announcement?.expiresAt
        ? new Date(announcement.expiresAt).toISOString().slice(0, 16)
        : '',
      acknowledgementRequired: announcement?.acknowledgementRequired || false,
    },
  })

  const targetType = form.watch('targetType')

  function handleSubmit(data: AnnouncementFormData) {
    const request: CreateAnnouncementRequest = {
      title: data.title,
      content: data.content,
      priority: data.priority as AnnouncementPriority,
      target: {
        type: data.targetType,
        roles: data.targetType === 'role' ? (data.targetRoles as Role[]) : undefined,
      },
      scheduledAt: data.scheduledAt || undefined,
      expiresAt: data.expiresAt || undefined,
      acknowledgementRequired: data.acknowledgementRequired,
    }
    onSubmit(request)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter announcement title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter announcement content"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Audience</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="all">Everyone</SelectItem>
                    <SelectItem value="role">Specific Roles</SelectItem>
                    <SelectItem value="class">Specific Classes</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {targetType === 'role' && (
          <FormField
            control={form.control}
            name="targetRoles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Target Roles</FormLabel>
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <Button
                      key={role.value}
                      type="button"
                      variant={field.value?.includes(role.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const current = field.value || []
                        if (current.includes(role.value)) {
                          field.onChange(current.filter((r) => r !== role.value))
                        } else {
                          field.onChange([...current, role.value])
                        }
                      }}
                    >
                      {role.label}
                    </Button>
                  ))}
                </div>
                <FormDescription>
                  Select one or more roles to target
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="scheduledAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Schedule (Optional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>
                  Leave empty to save as draft
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiresAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expires (Optional)</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>
                  Leave empty for no expiration
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="acknowledgementRequired"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Require Acknowledgement</FormLabel>
                <FormDescription>
                  Recipients must acknowledge reading this announcement
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {announcement ? 'Update' : 'Create'} Announcement
          </Button>
        </div>
      </form>
    </Form>
  )
}
