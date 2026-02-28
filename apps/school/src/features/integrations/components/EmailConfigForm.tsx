import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EMAIL_PROVIDERS, EMAIL_PROVIDER_LABELS } from '../types/integrations.types'

const emailConfigSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  provider: z.enum(['sendgrid', 'aws_ses', 'mailgun', 'smtp'] as const),
  apiKey: z.string().min(1, 'API key is required'),
  fromEmail: z.string().email('Please enter a valid email'),
  fromName: z.string().min(1, 'From name is required'),
  replyTo: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  // SMTP specific fields
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpUser: z.string().optional(),
})

type EmailConfigFormData = z.infer<typeof emailConfigSchema>

interface EmailConfigFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<EmailConfigFormData>
  onSubmit: (data: EmailConfigFormData) => Promise<void>
  isSubmitting?: boolean
}

export function EmailConfigForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting,
}: EmailConfigFormProps) {
  const form = useForm<EmailConfigFormData>({
    resolver: zodResolver(emailConfigSchema),
    defaultValues: {
      name: initialData?.name || '',
      provider: initialData?.provider || 'sendgrid',
      apiKey: initialData?.apiKey || '',
      fromEmail: initialData?.fromEmail || '',
      fromName: initialData?.fromName || '',
      replyTo: initialData?.replyTo || '',
      smtpHost: initialData?.smtpHost || '',
      smtpPort: initialData?.smtpPort || 587,
      smtpUser: initialData?.smtpUser || '',
    },
  })

  const selectedProvider = form.watch('provider')
  const isSmtp = selectedProvider === 'smtp'

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data)
    form.reset()
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Configure'} Email Service</DialogTitle>
          <DialogDescription>
            Configure your email service provider for sending notifications.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Configuration Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Primary Email Service" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provider</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EMAIL_PROVIDERS.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {EMAIL_PROVIDER_LABELS[provider]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isSmtp ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="smtpHost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Host</FormLabel>
                        <FormControl>
                          <Input placeholder="smtp.example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="smtpPort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Port</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="587"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 587)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="smtpUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SMTP Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter SMTP username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : null}

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{isSmtp ? 'SMTP Password' : 'API Key'}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={`Enter ${isSmtp ? 'SMTP password' : 'API key'}`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Email</FormLabel>
                    <FormControl>
                      <Input placeholder="noreply@school.edu" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fromName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From Name</FormLabel>
                    <FormControl>
                      <Input placeholder="School Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="replyTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reply-To Email (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="admin@school.edu" {...field} />
                  </FormControl>
                  <FormDescription>
                    Replies to emails will be sent to this address
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
