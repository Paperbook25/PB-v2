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
import { WHATSAPP_PROVIDERS, WHATSAPP_PROVIDER_LABELS } from '../types/integrations.types'

const whatsappConfigSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  provider: z.enum(['twilio', 'gupshup', 'interakt', 'wati'] as const),
  apiKey: z.string().min(1, 'API key is required'),
  accountSid: z.string().optional(),
  whatsappNumber: z.string().min(10, 'WhatsApp number is required'),
  templateApprovalRequired: z.boolean().default(true),
  webhookUrl: z.string().url().optional().or(z.literal('')),
})

type WhatsAppConfigFormData = z.infer<typeof whatsappConfigSchema>

interface WhatsAppConfigFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<WhatsAppConfigFormData>
  onSubmit: (data: WhatsAppConfigFormData) => Promise<void>
  isSubmitting?: boolean
}

export function WhatsAppConfigForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting,
}: WhatsAppConfigFormProps) {
  const form = useForm<WhatsAppConfigFormData>({
    resolver: zodResolver(whatsappConfigSchema),
    defaultValues: {
      name: initialData?.name || '',
      provider: initialData?.provider || 'twilio',
      apiKey: initialData?.apiKey || '',
      accountSid: initialData?.accountSid || '',
      whatsappNumber: initialData?.whatsappNumber || '',
      templateApprovalRequired: initialData?.templateApprovalRequired ?? true,
      webhookUrl: initialData?.webhookUrl || '',
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
          <DialogTitle>{initialData ? 'Edit' : 'Configure'} WhatsApp API</DialogTitle>
          <DialogDescription>
            Configure your WhatsApp Business API for sending notifications.
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
                    <Input placeholder="e.g., WhatsApp Business" {...field} />
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
                      {WHATSAPP_PROVIDERS.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {WHATSAPP_PROVIDER_LABELS[provider]}
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
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {selectedProvider === 'twilio' ? 'Auth Token' : 'API Key'}
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
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Business Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 9876543210" {...field} />
                  </FormControl>
                  <FormDescription>
                    The verified WhatsApp Business number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="webhookUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://your-domain.com/webhook" {...field} />
                  </FormControl>
                  <FormDescription>
                    URL to receive incoming message webhooks
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="templateApprovalRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Template Approval Required</FormLabel>
                    <FormDescription>
                      WhatsApp requires pre-approved templates for business messages
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
