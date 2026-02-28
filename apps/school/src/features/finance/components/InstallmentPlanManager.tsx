import { useState, useMemo } from 'react'
import { Plus, Trash2, Loader2, ChevronDown, ChevronUp, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useInstallmentPlans,
  useCreateInstallmentPlan,
  useToggleInstallmentPlan,
  useDeleteInstallmentPlan,
  useFeeStructures,
} from '../hooks/useFinance'
import { PAYMENT_STATUS_LABELS } from '../types/finance.types'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export function InstallmentPlanManager() {
  const { toast } = useToast()
  const { data: plansResult, isLoading } = useInstallmentPlans()
  const { data: structuresResult } = useFeeStructures()
  const createPlan = useCreateInstallmentPlan()
  const togglePlan = useToggleInstallmentPlan()
  const deletePlan = useDeleteInstallmentPlan()

  const [createOpen, setCreateOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    feeStructureId: '',
    name: '',
    numberOfInstallments: 3,
  })

  const plans = plansResult?.data || []
  const structures = structuresResult?.data || []

  const installmentDates = useMemo(() => {
    const dates: string[] = []
    const baseDate = new Date(2024, 3, 10) // April 10
    for (let i = 0; i < formData.numberOfInstallments; i++) {
      const date = new Date(baseDate)
      date.setMonth(date.getMonth() + i * Math.floor(12 / formData.numberOfInstallments))
      dates.push(date.toISOString().split('T')[0])
    }
    return dates
  }, [formData.numberOfInstallments])

  const handleCreate = () => {
    if (!formData.feeStructureId || !formData.name) {
      toast({ title: 'Validation Error', description: 'Please fill all fields', variant: 'destructive' })
      return
    }
    createPlan.mutate(
      { ...formData, installmentDates },
      {
        onSuccess: () => {
          toast({ title: 'Plan Created', description: 'Installment plan has been created.' })
          setCreateOpen(false)
          setFormData({ feeStructureId: '', name: '', numberOfInstallments: 3 })
        },
        onError: () => toast({ title: 'Error', description: 'Failed to create plan', variant: 'destructive' }),
      }
    )
  }

  const handleToggle = (id: string) => {
    togglePlan.mutate(id, {
      onSuccess: () => toast({ title: 'Updated', description: 'Plan status toggled.' }),
    })
  }

  const handleDelete = (id: string) => {
    deletePlan.mutate(id, {
      onSuccess: () => toast({ title: 'Deleted', description: 'Plan has been deleted.' }),
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Installment Plans</h3>
          <p className="text-sm text-muted-foreground">Manage fee installment/EMI plans</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No installment plans yet. Create one to get started.</p>
          </CardContent>
        </Card>
      ) : (
        plans.map(plan => {
          const totalPaid = plan.installments.reduce((s, inst) => s + inst.paidAmount, 0)
          const progress = plan.totalAmount > 0 ? Math.round((totalPaid / plan.totalAmount) * 100) : 0
          const expanded = expandedId === plan.id

          return (
            <Card key={plan.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{plan.name}</span>
                      <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.feeTypeName} &middot; {plan.numberOfInstallments} installments &middot; {formatCurrency(plan.totalAmount)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={progress} className="flex-1 h-2" />
                      <span className="text-xs text-muted-foreground">{progress}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => handleToggle(plan.id)}>
                      {plan.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(plan.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setExpandedId(expanded ? null : plan.id)}>
                      {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {expanded && (
                  <div className="mt-4 border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Due Date</th>
                          <th className="px-3 py-2 text-right">Amount</th>
                          <th className="px-3 py-2 text-right">Paid</th>
                          <th className="px-3 py-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plan.installments.map(inst => (
                          <tr key={inst.id} className="border-t">
                            <td className="px-3 py-2">{inst.installmentNumber}</td>
                            <td className="px-3 py-2">{inst.dueDate}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(inst.amount)}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(inst.paidAmount)}</td>
                            <td className="px-3 py-2">
                              <Badge variant={inst.status === 'paid' ? 'default' : inst.status === 'partial' ? 'outline' : 'secondary'}>
                                {PAYMENT_STATUS_LABELS[inst.status]}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Installment Plan</DialogTitle>
            <DialogDescription>Set up a new installment/EMI plan for a fee structure.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Fee Structure</Label>
              <Select value={formData.feeStructureId} onValueChange={v => setFormData(d => ({ ...d, feeStructureId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select fee structure" /></SelectTrigger>
                <SelectContent>
                  {structures.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.feeTypeName} - {formatCurrency(s.amount)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plan Name</Label>
              <Input value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} placeholder="e.g., Tuition Fee - 3 EMI" />
            </div>
            <div>
              <Label>Number of Installments</Label>
              <Select value={String(formData.numberOfInstallments)} onValueChange={v => setFormData(d => ({ ...d, numberOfInstallments: parseInt(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 6, 12].map(n => (
                    <SelectItem key={n} value={String(n)}>{n} installments</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Generated dates: {installmentDates.join(', ')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createPlan.isPending}>
              {createPlan.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
