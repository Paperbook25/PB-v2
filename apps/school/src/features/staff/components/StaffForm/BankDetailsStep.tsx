import type { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CreditCard, Shield } from 'lucide-react'
import type { StaffFormData } from './types'

interface BankDetailsStepProps {
  form: UseFormReturn<StaffFormData>
}

export function BankDetailsStep({ form }: BankDetailsStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Bank Details
        </h3>
        <p className="text-sm text-muted-foreground">Enter bank account details for salary disbursement</p>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Bank details are securely stored and used only for salary processing. Please ensure all details are accurate.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="bankDetails.accountHolderName"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Account Holder Name *</FormLabel>
              <FormControl>
                <Input placeholder="Name as per bank records" {...field} />
              </FormControl>
              <FormDescription>Enter the name exactly as it appears on the bank account</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankDetails.accountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number *</FormLabel>
              <FormControl>
                <Input placeholder="Enter account number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankDetails.bankName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., State Bank of India" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bankDetails.ifscCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>IFSC Code *</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., SBIN0001234"
                  maxLength={11}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormDescription>11-character Indian Financial System Code</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
