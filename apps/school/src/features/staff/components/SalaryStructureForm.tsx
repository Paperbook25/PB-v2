import { useState, useEffect } from 'react'
import { Loader2, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import type { SalaryStructure } from '../types/staff.types'

interface SalaryStructureFormProps {
  initialData?: SalaryStructure
  onSubmit: (data: Partial<SalaryStructure>) => void
  isSubmitting?: boolean
}

export function SalaryStructureForm({ initialData, onSubmit, isSubmitting }: SalaryStructureFormProps) {
  const [basic, setBasic] = useState(initialData?.basic || 0)
  const [hra, setHra] = useState(initialData?.hra || 0)
  const [da, setDa] = useState(initialData?.da || 0)
  const [conveyance, setConveyance] = useState(initialData?.conveyance || 1600)
  const [specialAllowance, setSpecialAllowance] = useState(initialData?.specialAllowance || 0)
  const [pf, setPf] = useState(initialData?.pf || 0)
  const [professionalTax, setProfessionalTax] = useState(initialData?.professionalTax || 200)
  const [tds, setTds] = useState(initialData?.tds || 0)

  // Auto-calculate HRA, DA, PF when basic changes
  useEffect(() => {
    setHra(Math.round(basic * 0.4))
    setDa(Math.round(basic * 0.2))
    setPf(Math.round(basic * 0.12))
  }, [basic])

  // Calculate totals
  const grossSalary = basic + hra + da + conveyance + specialAllowance
  const totalDeductions = pf + professionalTax + tds
  const netSalary = grossSalary - totalDeductions

  const handleSubmit = () => {
    onSubmit({
      basic,
      hra,
      da,
      conveyance,
      specialAllowance,
      grossSalary,
      pf,
      professionalTax,
      tds,
      totalDeductions,
      netSalary,
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Earnings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-green-600">Earnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="basic">Basic Salary</Label>
              <Input
                id="basic"
                type="number"
                value={basic}
                onChange={(e) => setBasic(parseInt(e.target.value) || 0)}
                min={0}
              />
              <p className="text-xs text-muted-foreground">Base component of salary</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hra">HRA (House Rent Allowance)</Label>
              <Input
                id="hra"
                type="number"
                value={hra}
                onChange={(e) => setHra(parseInt(e.target.value) || 0)}
                min={0}
              />
              <p className="text-xs text-muted-foreground">Auto-calculated as 40% of basic</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="da">DA (Dearness Allowance)</Label>
              <Input
                id="da"
                type="number"
                value={da}
                onChange={(e) => setDa(parseInt(e.target.value) || 0)}
                min={0}
              />
              <p className="text-xs text-muted-foreground">Auto-calculated as 20% of basic</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="conveyance">Conveyance Allowance</Label>
              <Input
                id="conveyance"
                type="number"
                value={conveyance}
                onChange={(e) => setConveyance(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialAllowance">Special Allowance</Label>
              <Input
                id="specialAllowance"
                type="number"
                value={specialAllowance}
                onChange={(e) => setSpecialAllowance(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>

            <Separator />

            <div className="flex justify-between font-medium">
              <span>Gross Salary</span>
              <span className="text-green-600">{formatCurrency(grossSalary)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Deductions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-red-600">Deductions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pf">PF (Provident Fund)</Label>
              <Input
                id="pf"
                type="number"
                value={pf}
                onChange={(e) => setPf(parseInt(e.target.value) || 0)}
                min={0}
              />
              <p className="text-xs text-muted-foreground">Auto-calculated as 12% of basic</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="professionalTax">Professional Tax</Label>
              <Input
                id="professionalTax"
                type="number"
                value={professionalTax}
                onChange={(e) => setProfessionalTax(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tds">TDS (Tax Deducted at Source)</Label>
              <Input
                id="tds"
                type="number"
                value={tds}
                onChange={(e) => setTds(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>

            <Separator />

            <div className="flex justify-between font-medium">
              <span>Total Deductions</span>
              <span className="text-red-600">{formatCurrency(totalDeductions)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Net Salary Summary */}
      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Net Monthly Salary</p>
              <p className="text-3xl font-bold">{formatCurrency(netSalary)}</p>
            </div>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Calculator className="h-4 w-4 mr-2" />
                  Save Structure
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
