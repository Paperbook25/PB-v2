import { useState } from 'react'
import { Plus, Trash2, Loader2, Edit, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  useDiscountRules,
  useCreateDiscountRule,
  useToggleDiscountRule,
  useDeleteDiscountRule,
  useAppliedDiscounts,
} from '../hooks/useFinance'
import {
  DISCOUNT_TYPE_LABELS,
  DISCOUNT_APPLICABILITY_LABELS,
  type DiscountType,
  type DiscountApplicability,
} from '../types/finance.types'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

export function DiscountRulesManager() {
  const { toast } = useToast()
  const { data: rulesResult, isLoading: rulesLoading } = useDiscountRules()
  const { data: appliedResult, isLoading: appliedLoading } = useAppliedDiscounts()
  const createRule = useCreateDiscountRule()
  const toggleRule = useToggleDiscountRule()
  const deleteRule = useDeleteDiscountRule()

  const [createOpen, setCreateOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'percentage' as DiscountType,
    value: 0,
    applicability: 'custom' as DiscountApplicability,
    description: '',
  })

  const rules = rulesResult?.data || []
  const applied = appliedResult?.data || []

  const activeRules = rules.filter(r => r.isActive).length
  const totalDiscountApplied = applied.reduce((s, a) => s + a.discountAmount, 0)

  const handleCreate = () => {
    if (!formData.name || !formData.value) {
      toast({ title: 'Error', description: 'Fill required fields', variant: 'destructive' })
      return
    }
    createRule.mutate(
      {
        ...formData,
        applicableFeeTypes: [],
        applicableClasses: [],
      },
      {
        onSuccess: () => {
          toast({ title: 'Created', description: 'Discount rule created.' })
          setCreateOpen(false)
          setFormData({ name: '', type: 'percentage', value: 0, applicability: 'custom', description: '' })
        },
        onError: () => toast({ title: 'Error', description: 'Failed to create rule', variant: 'destructive' }),
      }
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Discount & Scholarship Rules</h3>
          <p className="text-sm text-muted-foreground">Manage discount rules and view applied discounts</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{rules.length}</div>
            <p className="text-sm text-muted-foreground">Total Rules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{activeRules}</div>
            <p className="text-sm text-muted-foreground">Active Rules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalDiscountApplied)}</div>
            <p className="text-sm text-muted-foreground">Total Discount Applied</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Rules ({rules.length})</TabsTrigger>
          <TabsTrigger value="applied">Applied Discounts ({applied.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="space-y-4">
          {rulesLoading ? (
            <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : rules.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No discount rules yet.</CardContent></Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Applicability</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map(rule => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div>
                        <span className="font-medium">{rule.name}</span>
                        {rule.description && (
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{rule.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{DISCOUNT_TYPE_LABELS[rule.type]}</Badge>
                    </TableCell>
                    <TableCell>
                      {rule.type === 'percentage' ? `${rule.value}%` : formatCurrency(rule.value)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{DISCOUNT_APPLICABILITY_LABELS[rule.applicability]}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => toggleRule.mutate(rule.id)}>
                          {rule.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteRule.mutate(rule.id, {
                          onSuccess: () => toast({ title: 'Deleted', description: 'Rule deleted.' }),
                        })}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="applied">
          {appliedLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : applied.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No applied discounts.</CardContent></Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Rule</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead className="text-right">Original</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Final</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applied.map(d => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <span className="font-medium">{d.studentName}</span>
                      <span className="text-xs text-muted-foreground ml-1">{d.studentClass}</span>
                    </TableCell>
                    <TableCell>{d.discountRuleName}</TableCell>
                    <TableCell>{d.feeTypeName}</TableCell>
                    <TableCell className="text-right">{formatCurrency(d.originalAmount)}</TableCell>
                    <TableCell className="text-right text-green-600">-{formatCurrency(d.discountAmount)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(d.finalAmount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Discount Rule</DialogTitle>
            <DialogDescription>Add a new discount or scholarship rule.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rule Name</Label>
              <Input value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} placeholder="e.g., Sibling Discount" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={v => setFormData(d => ({ ...d, type: v as DiscountType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Value</Label>
                <Input type="number" value={formData.value} onChange={e => setFormData(d => ({ ...d, value: Number(e.target.value) }))} />
              </div>
            </div>
            <div>
              <Label>Applicability</Label>
              <Select value={formData.applicability} onValueChange={v => setFormData(d => ({ ...d, applicability: v as DiscountApplicability }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DISCOUNT_APPLICABILITY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} placeholder="Description of the discount rule" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createRule.isPending}>
              {createRule.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
