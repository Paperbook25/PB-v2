import type { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { DEPARTMENTS, DESIGNATIONS, QUALIFICATIONS } from '../../types/staff.types'
import type { StaffFormData } from './types'

interface ProfessionalInfoStepProps {
  form: UseFormReturn<StaffFormData>
}

export function ProfessionalInfoStep({ form }: ProfessionalInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Professional Information</h3>
        <p className="text-sm text-muted-foreground">Enter the staff member's employment details</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
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
          name="designation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Designation *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select designation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {DESIGNATIONS.map((designation) => (
                    <SelectItem key={designation} value={designation}>
                      {designation}
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
          name="joiningDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Joining Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specialization *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Physics, English Literature" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Salary (INR) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={10000}
                  placeholder="30000"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>Gross monthly salary in INR</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Qualifications */}
      <div className="border-t pt-6">
        <FormField
          control={form.control}
          name="qualification"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Qualifications *</FormLabel>
                <FormDescription>Select all applicable qualifications</FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {QUALIFICATIONS.map((qual) => (
                  <FormField
                    key={qual}
                    control={form.control}
                    name="qualification"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={qual}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(qual)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...field.value, qual])
                                  : field.onChange(field.value?.filter((value) => value !== qual))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">{qual}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}
