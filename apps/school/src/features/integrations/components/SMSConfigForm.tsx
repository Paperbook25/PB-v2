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
import { Switch } from '@/components/ui/switch'
import { SMS_PROVIDERS, SMS_PROVIDER_LABELS, type SMSProvider } from '../types/integrations.types'

const smsConfigSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  provider: z.enum(['twilio', 'msg91', 'textlocal', 'custom'] as const),
  authKey: z.string().min(1, 'Auth key is required'),
  senderId: z.string().min(1, 'Sender ID is required'),
  accountSid: z.string().optional(),
  defaultRoute: z.enum(['transactional', 'promotional']).default('transactional'),
  enableDND: z.boolean().default(true),
})

type SMSConfigFormData = z.infer<typeof smsConfigSchema>

interface SMSConfigFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<SMSConfigFormData>
  onSubmit: (data: SMSConfigFormData) => Promise<void>
  isSubmitting?: boolean
}

export function SMSConfigForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting,
}: SMSConfigFormProps) {
  const form = useForm<SMSConfigFormData>({
    resolver: zodResolver(smsConfigSchema),
    defaultValues: {
      name: initialData?.name || '',
      provider: initialData?.provider || 'msg91',
      authKey: initialData?.authKey || '',
      senderId: initialData?.senderId || '',
      accountSid: initialData?.accountSid || '',
      defaultRoute: initialData?.defaultRoute || 'transactional',
      enableDND: initialData?.enableDND ?? true,
    },
  })

  const selectedProvider = form.watch('provider')

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data)
    form.reset()
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Configure'} SMS Gateway</DialogTitle>
          <DialogDescription>
            Configure your SMS gateway provider for sending notifications.
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
                    <Input placeholder="e.g., Primary SMS Gateway" {...field} />
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
                      {SMS_PROVIDERS.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {SMS_PROVIDER_LABELS[provider]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProvider === 'twilio' && (
              <FormField
                control={form.control}
                name="accountSid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account SID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Twilio Account SID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="authKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {selectedProvider === 'twilio' ? 'Auth Token' : 'Auth Key'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={`Enter ${selectedProvider === 'twilio' ? 'Auth Token' : 'API Key'}`}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="senderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sender ID</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SCHOOL" maxLength={6} {...field} />
                  </FormControl>
                  <FormDescription>
                    6 character alphanumeric sender ID
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="defaultRoute"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Route</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="transactional">Transactional</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Transactional messages have higher delivery priority
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="enableDND"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Respect DND Registry</FormLabel>
                    <FormDescription>
                      Skip numbers registered in Do Not Disturb list
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
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
