import { useState, useEffect } from 'react'
import { Save, Loader2, CalendarOff, Plus, Trash2, FileStack, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { apiGet, apiPut, apiPost, apiDelete } from '@/lib/api-client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDate } from '@/lib/utils'

interface LeavePolicy {
  id: string
  defaultEL: number
  defaultCL: number
  defaultSL: number
  defaultPL: number
  maxCarryForwardDays: number
  carryForwardExpiryMonths: number
  minNoticeDays: number
  maxConsecutiveDays: number
  sandwichLeaveEnabled: boolean
  probationLeaveFactor: number
}

interface CustomLeaveType {
  id: string
  name: string
  code: string
  isPaid: boolean
  maxDaysPerYear: number
  requiresApproval: boolean
  isActive: boolean
}

interface BlackoutDate {
  id: string
  startDate: string
  endDate: string
  reason: string
  appliesTo: string
}

function useLeavePolicy() {
  return useQuery({
    queryKey: ['settings', 'leave-policy'],
    queryFn: () => apiGet<{ data: LeavePolicy }>('/api/staff/leave-policies'),
  })
}

function useCustomLeaveTypes() {
  return useQuery({
    queryKey: ['settings', 'custom-leave-types'],
    queryFn: () => apiGet<{ data: CustomLeaveType[] }>('/api/staff/leave-types'),
  })
}

function useBlackoutDates() {
  return useQuery({
    queryKey: ['settings', 'blackout-dates'],
    queryFn: () => apiGet<{ data: BlackoutDate[] }>('/api/staff/blackout-dates'),
  })
}

export function LeavePolicySettings() {
  const { data: policyRes, isLoading } = useLeavePolicy()
  const { data: typesRes } = useCustomLeaveTypes()
  const { data: datesRes } = useBlackoutDates()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [form, setForm] = useState<Partial<LeavePolicy>>({})
  const [isDirty, setIsDirty] = useState(false)

  // New leave type form
  const [newType, setNewType] = useState({ name: '', code: '', maxDaysPerYear: 10 })
  // New blackout form
  const [newBlackout, setNewBlackout] = useState({ startDate: '', endDate: '', reason: '' })

  const policy = policyRes?.data
  const customTypes = typesRes?.data || []
  const blackoutDates = datesRes?.data || []

  useEffect(() => {
    if (policy) {
      setForm(policy)
      setIsDirty(false)
    }
  }, [policy])

  const update = (field: string, value: unknown) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const saveMutation = useMutation({
    mutationFn: (data: Partial<LeavePolicy>) => apiPut<{ data: LeavePolicy }>('/api/staff/leave-policies', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'leave-policy'] })
      toast({ title: 'Leave policy saved successfully' })
      setIsDirty(false)
    },
    onError: () => toast({ title: 'Failed to save', variant: 'destructive' }),
  })

  const addTypeMutation = useMutation({
    mutationFn: (data: typeof newType) => apiPost('/api/staff/leave-types', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'custom-leave-types'] })
      toast({ title: 'Leave type added' })
      setNewType({ name: '', code: '', maxDaysPerYear: 10 })
    },
    onError: () => toast({ title: 'Failed to add leave type', variant: 'destructive' }),
  })

  const deleteTypeMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/staff/leave-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'custom-leave-types'] })
      toast({ title: 'Leave type removed' })
    },
  })

  const addBlackoutMutation = useMutation({
    mutationFn: (data: typeof newBlackout) => apiPost('/api/staff/blackout-dates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'blackout-dates'] })
      toast({ title: 'Blackout date added' })
      setNewBlackout({ startDate: '', endDate: '', reason: '' })
    },
    onError: () => toast({ title: 'Failed to add blackout date', variant: 'destructive' }),
  })

  const deleteBlackoutMutation = useMutation({
    mutationFn: (id: string) => apiDelete(`/api/staff/blackout-dates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'blackout-dates'] })
      toast({ title: 'Blackout date removed' })
    },
  })

  const allocateMutation = useMutation({
    mutationFn: () => apiPost('/api/staff/allocate-annual-leave', {}),
    onSuccess: (data: any) => {
      toast({ title: `Leave allocated: ${data?.data?.balancesCreated || 0} created, ${data?.data?.balancesSkipped || 0} skipped` })
    },
    onError: () => toast({ title: 'Failed to allocate leave', variant: 'destructive' }),
  })

  const handleSave = () => {
    const { id, ...data } = form
    saveMutation.mutate(data)
  }

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-[300px] w-full" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Staff Leave Policy</h2>
          <p className="text-sm text-muted-foreground">Configure leave allocation, rules, custom types, and blackout dates</p>
        </div>
        <Button onClick={handleSave} disabled={!isDirty || saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {/* Default Allocation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileStack className="h-5 w-5" />
            Default Leave Allocation (per year)
          </CardTitle>
          <CardDescription>Set the number of leave days each staff member gets per academic year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>Earned Leave (EL)</Label>
              <Input type="number" min={0} max={60} value={form.defaultEL ?? 15} onChange={(e) => update('defaultEL', parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Casual Leave (CL)</Label>
              <Input type="number" min={0} max={60} value={form.defaultCL ?? 12} onChange={(e) => update('defaultCL', parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Sick Leave (SL)</Label>
              <Input type="number" min={0} max={60} value={form.defaultSL ?? 12} onChange={(e) => update('defaultSL', parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Privilege Leave (PL)</Label>
              <Input type="number" min={0} max={60} value={form.defaultPL ?? 7} onChange={(e) => update('defaultPL', parseInt(e.target.value) || 0)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leave Rules</CardTitle>
          <CardDescription>Configure carry-forward, consecutive days, and other policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Max Carry-Forward Days</Label>
              <Input type="number" min={0} max={30} value={form.maxCarryForwardDays ?? 5} onChange={(e) => update('maxCarryForwardDays', parseInt(e.target.value) || 0)} />
              <p className="text-xs text-muted-foreground">Unused leave that can carry to next year</p>
            </div>
            <div className="space-y-2">
              <Label>Carry-Forward Expiry (months)</Label>
              <Input type="number" min={0} max={12} value={form.carryForwardExpiryMonths ?? 3} onChange={(e) => update('carryForwardExpiryMonths', parseInt(e.target.value) || 0)} />
            </div>
            <div className="space-y-2">
              <Label>Min Notice Days</Label>
              <Input type="number" min={0} max={30} value={form.minNoticeDays ?? 1} onChange={(e) => update('minNoticeDays', parseInt(e.target.value) || 0)} />
              <p className="text-xs text-muted-foreground">Minimum days in advance to apply for leave</p>
            </div>
            <div className="space-y-2">
              <Label>Max Consecutive Days</Label>
              <Input type="number" min={1} max={90} value={form.maxConsecutiveDays ?? 15} onChange={(e) => update('maxConsecutiveDays', parseInt(e.target.value) || 1)} />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Sandwich Leave Rule</Label>
              <p className="text-xs text-muted-foreground">Count weekends/holidays between leave days as leave</p>
            </div>
            <Switch checked={form.sandwichLeaveEnabled ?? false} onCheckedChange={(v) => update('sandwichLeaveEnabled', v)} />
          </div>

          <div className="space-y-2">
            <Label>Probation Leave Factor</Label>
            <Input type="number" min={0} max={1} step={0.1} value={form.probationLeaveFactor ?? 0.5} onChange={(e) => update('probationLeaveFactor', parseFloat(e.target.value) || 0)} />
            <p className="text-xs text-muted-foreground">Multiply default allocation by this factor for staff on probation (0.5 = half)</p>
          </div>
        </CardContent>
      </Card>

      {/* Custom Leave Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom Leave Types</CardTitle>
          <CardDescription>Add school-specific leave types beyond the standard EL/CL/SL/PL</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {customTypes.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Max Days/Year</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customTypes.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell><Badge variant="outline">{t.code}</Badge></TableCell>
                    <TableCell>{t.maxDaysPerYear}</TableCell>
                    <TableCell>{t.isPaid ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteTypeMutation.mutate(t.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex gap-2 items-end">
            <div className="space-y-1 flex-1">
              <Label className="text-xs">Name</Label>
              <Input placeholder="Maternity Leave" value={newType.name} onChange={(e) => setNewType(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1 w-24">
              <Label className="text-xs">Code</Label>
              <Input placeholder="ML" value={newType.code} onChange={(e) => setNewType(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
            </div>
            <div className="space-y-1 w-24">
              <Label className="text-xs">Max Days</Label>
              <Input type="number" value={newType.maxDaysPerYear} onChange={(e) => setNewType(p => ({ ...p, maxDaysPerYear: parseInt(e.target.value) || 0 }))} />
            </div>
            <Button size="sm" disabled={!newType.name || !newType.code || addTypeMutation.isPending} onClick={() => addTypeMutation.mutate(newType)}>
              <Plus className="h-4 w-4 mr-1" />Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blackout Dates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarOff className="h-5 w-5" />
            Blackout Dates
          </CardTitle>
          <CardDescription>Date ranges when staff cannot take leave (exams, annual events, etc.)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {blackoutDates.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blackoutDates.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{formatDate(d.startDate)}</TableCell>
                    <TableCell>{formatDate(d.endDate)}</TableCell>
                    <TableCell>{d.reason}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => deleteBlackoutMutation.mutate(d.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex gap-2 items-end">
            <div className="space-y-1">
              <Label className="text-xs">Start Date</Label>
              <Input type="date" value={newBlackout.startDate} onChange={(e) => setNewBlackout(p => ({ ...p, startDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">End Date</Label>
              <Input type="date" value={newBlackout.endDate} onChange={(e) => setNewBlackout(p => ({ ...p, endDate: e.target.value }))} />
            </div>
            <div className="space-y-1 flex-1">
              <Label className="text-xs">Reason</Label>
              <Input placeholder="Annual exams" value={newBlackout.reason} onChange={(e) => setNewBlackout(p => ({ ...p, reason: e.target.value }))} />
            </div>
            <Button size="sm" disabled={!newBlackout.startDate || !newBlackout.endDate || !newBlackout.reason || addBlackoutMutation.isPending} onClick={() => addBlackoutMutation.mutate(newBlackout)}>
              <Plus className="h-4 w-4 mr-1" />Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Batch Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-5 w-5" />
            Batch Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Allocate Leave for Current Year</p>
              <p className="text-xs text-muted-foreground">Create leave balances for all active staff using the policy above. Existing balances are not overwritten.</p>
            </div>
            <Button variant="outline" onClick={() => allocateMutation.mutate()} disabled={allocateMutation.isPending}>
              {allocateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Allocate Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
