import { useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSaveIndicator } from '@/components/ui/save-indicator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Form,
  FormControl,
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
import { useToast } from '@/hooks/use-toast'
import { useSchoolProfile, useUpdateSchoolProfile } from '../hooks/useSettings'

const INDIAN_STATES = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal', 'Kerala', 'Telangana', 'Andhra Pradesh', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Bihar']
const BOARDS = ['CBSE', 'ICSE', 'State', 'IB', 'Other'] as const

const schoolProfileSchema = z.object({
  name: z.string().min(2, 'School name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
  phone: z.string().min(10, 'Phone number is required'),
  email: z.string().email('Please enter a valid email'),
  website: z.string().optional(),
  principalName: z.string().min(2, 'Principal name is required'),
  establishedYear: z.number().min(1800).max(new Date().getFullYear()),
  affiliationNumber: z.string().optional(),
  affiliationBoard: z.enum(['CBSE', 'ICSE', 'State', 'IB', 'Other']).optional(),
})

type SchoolProfileFormData = z.infer<typeof schoolProfileSchema>

export function SchoolProfileForm() {
  const { toast } = useToast()
  const { data, isLoading } = useSchoolProfile()
  const updateProfile = useUpdateSchoolProfile()
  const { status: saveStatus, markUnsaved, markSaving, markSaved, markError, reset: resetSaveStatus, SaveIndicator } = useSaveIndicator()

  const form = useForm<SchoolProfileFormData>({
    resolver: zodResolver(schoolProfileSchema),
    defaultValues: {
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      email: '',
      website: '',
      principalName: '',
      establishedYear: new Date().getFullYear(),
      affiliationNumber: '',
      affiliationBoard: undefined,
    },
  })

  // Track form changes for save indicator
  const handleFieldChange = useCallback(() => {
    if (form.formState.isDirty) {
      markUnsaved()
    }
  }, [form.formState.isDirty, markUnsaved])

  useEffect(() => {
    const subscription = form.watch(() => {
      if (form.formState.isDirty) {
        markUnsaved()
      }
    })
    return () => subscription.unsubscribe()
  }, [form, markUnsaved])

  useEffect(() => {
    if (data?.data) {
      form.reset({
        name: data.data.name,
        address: data.data.address,
        city: data.data.city,
        state: data.data.state,
        pincode: data.data.pincode,
        phone: data.data.phone,
        email: data.data.email,
        website: data.data.website || '',
        principalName: data.data.principalName,
        establishedYear: data.data.establishedYear,
        affiliationNumber: data.data.affiliationNumber || '',
        affiliationBoard: data.data.affiliationBoard,
      })
      resetSaveStatus()
    }
  }, [data, form, resetSaveStatus])

  const onSubmit = (formData: SchoolProfileFormData) => {
    markSaving()
    updateProfile.mutate(formData, {
      onSuccess: () => {
        markSaved()
        toast({
          title: 'Profile Updated',
          description: 'School profile has been successfully updated.',
        })
      },
      onError: (error) => {
        markError(error instanceof Error ? error.message : 'Failed to save')
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update profile',
          variant: 'destructive',
        })
      },
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-60" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            School Profile
          </CardTitle>
          <SaveIndicator />
        </div>
        <CardDescription>Manage your school's basic information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>School Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INDIAN_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
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
                name="pincode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pincode</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="principalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Principal Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="establishedYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Established Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="affiliationBoard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affiliation Board</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select board" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BOARDS.map((board) => (
                          <SelectItem key={board} value={board}>
                            {board}
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
                name="affiliationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affiliation Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
