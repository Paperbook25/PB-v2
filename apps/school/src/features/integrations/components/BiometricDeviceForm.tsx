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
import {
  BIOMETRIC_PROVIDERS,
  BIOMETRIC_PROVIDER_LABELS,
  DEVICE_TYPE_LABELS,
  type BiometricDevice,
} from '../types/integrations.types'

const biometricDeviceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  deviceSerial: z.string().min(1, 'Device serial is required'),
  deviceIp: z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, 'Please enter a valid IP address'),
  devicePort: z.number().min(1).max(65535),
  provider: z.enum(['zkteco', 'essl', 'biomax', 'generic'] as const),
  location: z.string().min(2, 'Location is required'),
  deviceType: z.enum(['fingerprint', 'face', 'card', 'multi'] as const),
})

type BiometricDeviceFormData = z.infer<typeof biometricDeviceSchema>

interface BiometricDeviceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: BiometricDevice | null
  onSubmit: (data: BiometricDeviceFormData) => Promise<void>
  isSubmitting?: boolean
}

export function BiometricDeviceForm({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting,
}: BiometricDeviceFormProps) {
  const form = useForm<BiometricDeviceFormData>({
    resolver: zodResolver(biometricDeviceSchema),
    defaultValues: {
      name: initialData?.name || '',
      deviceSerial: initialData?.deviceSerial || '',
      deviceIp: initialData?.deviceIp || '',
      devicePort: initialData?.devicePort || 4370,
      provider: initialData?.provider || 'zkteco',
      location: initialData?.location || '',
      deviceType: initialData?.deviceType || 'fingerprint',
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data)
    form.reset()
    onOpenChange(false)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit' : 'Add'} Biometric Device</DialogTitle>
          <DialogDescription>
            Configure the biometric device for attendance tracking.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Gate Fingerprint" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select manufacturer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BIOMETRIC_PROVIDERS.map((provider) => (
                          <SelectItem key={provider} value={provider}>
                            {BIOMETRIC_PROVIDER_LABELS[provider]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(['fingerprint', 'face', 'card', 'multi'] as const).map((type) => (
                          <SelectItem key={type} value={type}>
                            {DEVICE_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="deviceSerial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Serial Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ZKT-2024-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="deviceIp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP Address</FormLabel>
                    <FormControl>
                      <Input placeholder="192.168.1.100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="devicePort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Port</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="4370"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 4370)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Main Entrance, Staff Room" {...field} />
                  </FormControl>
                  <FormDescription>
                    Physical location where the device is installed
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
                  initialData ? 'Update Device' : 'Add Device'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
