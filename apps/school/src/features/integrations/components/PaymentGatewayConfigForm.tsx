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
import { PAYMENT_PROVIDERS, PAYMENT_PROVIDER_LABELS } from '../types/integrations.types'

const paymentConfigSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  provider: z.enum(['razorpay', 'payu', 'ccavenue', 'stripe'] as const),
  keyId: z.string().min(1, 'Key ID is required'),
  keySecret: z.string().min(1, 'Key Secret is required'),
  merchantId: z.string().optional(),
  currency: z.string().default('INR'),
  autoCapture: z.boolean().default(true),
  sendReceipt: z.boolean().default(true),
  webhookSecret: z.string().optional(),
})

type PaymentConfigFormData = z.infer<typeof paymentConfigSchema>

interface PaymentGatewayConfigFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<PaymentConfigFormData>
  onSubmit: (data: PaymentConfigFormData) => Promise<void>
  isSubmitting?: boolean
}

export function PaymentGatewayConfigForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting,
}: PaymentGatewayConfigFormProps) {
  const form = useForm<PaymentConfigFormData>({
    resolver: zodResolver(paymentConfigSchema),
    defaultValues: {
      name: initialData?.name || '',
      provider: initialData?.provider || 'razorpay',
      keyId: initialData?.keyId || '',
      keySecret: initialData?.keySecret || '',
      merchantId: initialData?.merchantId || '',
      currency: initialData?.currency || 'INR',
      autoCapture: initialData?.autoCapture ?? true,
      sendReceipt: initialData?.sendReceipt ?? true,
      webhookSecret: initialData?.webhookSecret || '',
    },
  })

  const selectedProvider = form.watch('provider')

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data)
    form.reset()
    onOpenChange(false)
  })

  const getKeyLabels = (provider: string) => {
    switch (provider) {
      case 'razorpay':
        return { keyId: 'Key ID', keySecret: 'Key Secret' }
      case 'stripe':
        return { keyId: 'Publishable Key', keySecret: 'Secret Key' }
      case 'payu':
        return { keyId: 'Merchant Key', keySecret: 'Merchant Salt' }
      case 'ccavenue':
        return { keyId: 'Access Code', keySecret: 'Working Key' }
      default:
        return { keyId: 'API Key', keySecret: 'API Secret' }
    }
  }

  const labels = getKeyLabels(selectedProvider)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Configure'} Payment Gateway</DialogTitle>
          <DialogDescription>
            Configure your payment gateway for online fee collection.
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
                    <Input placeholder="e.g., Primary Payment Gateway" {...field} />
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
                      {PAYMENT_PROVIDERS.map((provider) => (
                        <SelectItem key={provider} value={provider}>
                          {PAYMENT_PROVIDER_LABELS[provider]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(selectedProvider === 'payu' || selectedProvider === 'ccavenue') && (
              <FormField
                control={form.control}
                name="merchantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Merchant ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Merchant ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="keyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labels.keyId}</FormLabel>
                  <FormControl>
                    <Input placeholder={`Enter ${labels.keyId}`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="keySecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{labels.keySecret}</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder={`Enter ${labels.keySecret}`} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="webhookSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook Secret (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter webhook secret for verification"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Used to verify incoming webhook events from the payment gateway
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 border-t pt-4">
              <FormField
                control={form.control}
                name="autoCapture"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Auto Capture Payments</FormLabel>
                      <FormDescription>
                        Automatically capture payments after authorization
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sendReceipt"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Send Receipt to Payer</FormLabel>
                      <FormDescription>
                        Automatically send payment receipt via email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

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
