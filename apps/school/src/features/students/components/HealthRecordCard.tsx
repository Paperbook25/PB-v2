import { useState, useEffect } from 'react'
import {
  Heart,
  Pencil,
  Plus,
  AlertTriangle,
  Pill,
  Phone,
  Eye,
  Ruler,
  Weight,
  Loader2,
  CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/utils'
import { useStudentHealth, useUpdateHealth } from '../hooks/useStudents'
import type { StudentHealthRecord } from '../types/student.types'

interface HealthRecordCardProps {
  studentId: string
}

const EMPTY_HEALTH_RECORD: StudentHealthRecord = {
  allergies: [],
  medicalConditions: [],
  medications: [],
  emergencyContact: {
    name: '',
    phone: '',
    relationship: '',
  },
  bloodGroup: '',
  height: '',
  weight: '',
  visionLeft: '',
  visionRight: '',
  lastCheckupDate: '',
  insuranceProvider: '',
  insurancePolicyNumber: '',
  notes: '',
}

function HealthRecordSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-md" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="grid grid-cols-3 gap-4 pt-2">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  )
}

function HealthEditForm({
  initial,
  onSubmit,
  isPending,
}: {
  initial: StudentHealthRecord
  onSubmit: (data: StudentHealthRecord) => void
  isPending: boolean
}) {
  const [form, setForm] = useState<StudentHealthRecord>(initial)
  const [allergiesInput, setAllergiesInput] = useState(
    initial.allergies.join(', ')
  )
  const [conditionsInput, setConditionsInput] = useState(
    initial.medicalConditions.join(', ')
  )
  const [medicationsInput, setMedicationsInput] = useState(
    initial.medications.join(', ')
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...form,
      allergies: allergiesInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      medicalConditions: conditionsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      medications: medicationsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="allergies">Allergies (comma-separated)</Label>
        <Input
          id="allergies"
          placeholder="e.g. Peanuts, Dust, Pollen"
          value={allergiesInput}
          onChange={(e) => setAllergiesInput(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="conditions">Medical Conditions (comma-separated)</Label>
        <Input
          id="conditions"
          placeholder="e.g. Asthma, Diabetes"
          value={conditionsInput}
          onChange={(e) => setConditionsInput(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="medications">Medications (comma-separated)</Label>
        <Input
          id="medications"
          placeholder="e.g. Inhaler, Insulin"
          value={medicationsInput}
          onChange={(e) => setMedicationsInput(e.target.value)}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label className="text-sm font-medium">Emergency Contact</Label>
        <div className="grid grid-cols-3 gap-3">
          <Input
            placeholder="Name"
            value={form.emergencyContact.name}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                emergencyContact: { ...f.emergencyContact, name: e.target.value },
              }))
            }
          />
          <Input
            placeholder="Phone"
            value={form.emergencyContact.phone}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                emergencyContact: {
                  ...f.emergencyContact,
                  phone: e.target.value,
                },
              }))
            }
          />
          <Input
            placeholder="Relationship"
            value={form.emergencyContact.relationship}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                emergencyContact: {
                  ...f.emergencyContact,
                  relationship: e.target.value,
                },
              }))
            }
          />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bloodGroup">Blood Group</Label>
          <Input
            id="bloodGroup"
            placeholder="e.g. O+"
            value={form.bloodGroup}
            onChange={(e) =>
              setForm((f) => ({ ...f, bloodGroup: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastCheckup">Last Checkup Date</Label>
          <Input
            id="lastCheckup"
            type="date"
            value={form.lastCheckupDate ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, lastCheckupDate: e.target.value }))
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            placeholder="e.g. 145"
            value={form.height ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, height: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            placeholder="e.g. 38"
            value={form.weight ?? ''}
            onChange={(e) =>
              setForm((f) => ({ ...f, weight: e.target.value }))
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="visionLeft">Vision (L / R)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="L"
              value={form.visionLeft ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, visionLeft: e.target.value }))
              }
            />
            <Input
              placeholder="R"
              value={form.visionRight ?? ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, visionRight: e.target.value }))
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional health notes..."
          value={form.notes ?? ''}
          onChange={(e) =>
            setForm((f) => ({ ...f, notes: e.target.value }))
          }
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Health Record'
          )}
        </Button>
      </div>
    </form>
  )
}

export function HealthRecordCard({ studentId }: HealthRecordCardProps) {
  const [editOpen, setEditOpen] = useState(false)

  const { toast } = useToast()
  const { data: healthResponse, isLoading, isError } = useStudentHealth(studentId)
  const health = healthResponse?.data
  const updateMutation = useUpdateHealth()

  const hasRecord =
    health &&
    (health.allergies.length > 0 ||
      health.medicalConditions.length > 0 ||
      health.medications.length > 0 ||
      health.emergencyContact.name ||
      health.bloodGroup ||
      health.height ||
      health.weight)

  const handleSave = async (data: StudentHealthRecord) => {
    try {
      await updateMutation.mutateAsync({ id: studentId, data })
      toast({ title: 'Health record updated successfully' })
      setEditOpen(false)
    } catch {
      toast({
        title: 'Failed to update health record',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="h-5 w-5 text-red-500" />
          Health Record
        </CardTitle>
        {hasRecord ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <HealthRecordSkeleton />
        ) : isError ? (
          <div className="text-center py-8 text-destructive text-sm">
            Failed to load health records. Please try again.
          </div>
        ) : !hasRecord ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Heart className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No health record found</p>
            <p className="text-xs mt-1">
              Add health information for this student.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setEditOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Health Record
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Allergies */}
            {health.allergies.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                  Allergies
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {health.allergies.map((allergy) => (
                    <Badge
                      key={allergy}
                      variant="destructive"
                      className="text-xs"
                    >
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Conditions */}
            {health.medicalConditions.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Medical Conditions</p>
                <div className="flex flex-wrap gap-1.5">
                  {health.medicalConditions.map((condition) => (
                    <Badge
                      key={condition}
                      variant="warning"
                      className="text-xs"
                    >
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Medications */}
            {health.medications.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Pill className="h-3.5 w-3.5" />
                  Medications
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {health.medications.map((med) => (
                    <Badge key={med} variant="secondary" className="text-xs">
                      {med}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {health.emergencyContact.name && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Phone className="h-3.5 w-3.5" />
                    Emergency Contact
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      {health.emergencyContact.name} (
                      {health.emergencyContact.relationship})
                    </p>
                    <p>{health.emergencyContact.phone}</p>
                  </div>
                </div>
              </>
            )}

            {/* Vitals */}
            {(health.height || health.weight || health.visionLeft) && (
              <>
                <Separator />
                <div className="grid grid-cols-3 gap-3">
                  {health.height && (
                    <div className="flex items-center gap-2 rounded-lg border p-3">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Height</p>
                        <p className="text-sm font-medium">
                          {health.height} cm
                        </p>
                      </div>
                    </div>
                  )}
                  {health.weight && (
                    <div className="flex items-center gap-2 rounded-lg border p-3">
                      <Weight className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Weight</p>
                        <p className="text-sm font-medium">
                          {health.weight} kg
                        </p>
                      </div>
                    </div>
                  )}
                  {health.visionLeft && (
                    <div className="flex items-center gap-2 rounded-lg border p-3">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Vision</p>
                        <p className="text-sm font-medium">
                          L: {health.visionLeft} / R: {health.visionRight}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Last Checkup */}
            {health.lastCheckupDate && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-1">
                <CalendarDays className="h-3.5 w-3.5" />
                Last checkup: {formatDate(health.lastCheckupDate)}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {hasRecord ? 'Edit Health Record' : 'Add Health Record'}
            </DialogTitle>
            <DialogDescription>
              {hasRecord
                ? 'Update the student health information below.'
                : 'Fill in the student health information below.'}
            </DialogDescription>
          </DialogHeader>
          <HealthEditForm
            initial={health ?? EMPTY_HEALTH_RECORD}
            onSubmit={handleSave}
            isPending={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </Card>
  )
}
