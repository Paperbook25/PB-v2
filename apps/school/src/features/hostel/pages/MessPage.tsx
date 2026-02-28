import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Pencil, Utensils, Coffee, Sun, Moon } from 'lucide-react'
import { useMessMenu, useHostels, useUpdateMessMenu } from '../hooks/useHostel'
import { useToast } from '@/hooks/use-toast'
import { MEAL_TYPE_LABELS, type MealType } from '../types/hostel.types'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const MEAL_ICONS: Record<MealType, React.ReactNode> = {
  breakfast: <Coffee className="h-4 w-4" />,
  lunch: <Sun className="h-4 w-4" />,
  snacks: <Utensils className="h-4 w-4" />,
  dinner: <Moon className="h-4 w-4" />,
}

export function MessPage() {
  const [hostelFilter, setHostelFilter] = useState<string>('')
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    hostelId: string
    dayOfWeek: number
    mealType: MealType
    items: string[]
    specialDiet: string
  }>({
    open: false,
    hostelId: '',
    dayOfWeek: 0,
    mealType: 'breakfast',
    items: [],
    specialDiet: '',
  })

  const { data: menuResult, isLoading } = useMessMenu({
    hostelId: hostelFilter || undefined,
  })
  const { data: hostelsResult } = useHostels()
  const updateMenu = useUpdateMessMenu()
  const { toast } = useToast()

  const menus = menuResult?.data || []
  const hostels = hostelsResult?.data || []

  const getMenuForDayMeal = (hostelId: string, day: number, mealType: MealType) => {
    return menus.find(
      (m) => m.hostelId === hostelId && m.dayOfWeek === day && m.mealType === mealType
    )
  }

  const handleEdit = (hostelId: string, day: number, mealType: MealType) => {
    const menu = getMenuForDayMeal(hostelId, day, mealType)
    setEditDialog({
      open: true,
      hostelId,
      dayOfWeek: day,
      mealType,
      items: menu?.items || [],
      specialDiet: menu?.specialDiet || '',
    })
  }

  const handleSave = async () => {
    try {
      await updateMenu.mutateAsync({
        hostelId: editDialog.hostelId,
        dayOfWeek: editDialog.dayOfWeek,
        mealType: editDialog.mealType,
        items: editDialog.items,
        specialDiet: editDialog.specialDiet || undefined,
      })
      toast({ title: 'Menu updated successfully' })
      setEditDialog({ ...editDialog, open: false })
    } catch {
      toast({ title: 'Failed to update menu', variant: 'destructive' })
    }
  }

  const selectedHostel = hostelFilter || hostels[0]?.id

  return (
    <div>
      <PageHeader
        title="Mess Menu"
        description="Manage weekly mess menu for hostels"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Hostel', href: '/hostel' },
          { label: 'Mess Menu' },
        ]}
      />

      <div className="space-y-6">
        {/* Hostel Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Hostel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-sm">
              <Select value={hostelFilter} onValueChange={setHostelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Hostel" />
                </SelectTrigger>
                <SelectContent>
                  {hostels.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Menu */}
        {isLoading ? (
          <div className="text-center py-8">Loading menu...</div>
        ) : !selectedHostel ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Please select a hostel to view the menu
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-7">
            {DAYS.map((day, index) => (
              <Card key={day} className={index === new Date().getDay() ? 'ring-2 ring-primary' : ''}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{day}</CardTitle>
                  {index === new Date().getDay() && (
                    <Badge variant="secondary" className="w-fit text-xs">
                      Today
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {(['breakfast', 'lunch', 'snacks', 'dinner'] as MealType[]).map((mealType) => {
                    const menu = getMenuForDayMeal(selectedHostel, index, mealType)
                    return (
                      <div key={mealType} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                            {MEAL_ICONS[mealType]}
                            {MEAL_TYPE_LABELS[mealType]}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleEdit(selectedHostel, index, mealType)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </div>
                        <ul className="text-xs space-y-0.5">
                          {menu?.items.map((item, i) => (
                            <li key={i} className="text-muted-foreground">
                              {item}
                            </li>
                          )) || (
                            <li className="text-muted-foreground italic">Not set</li>
                          )}
                        </ul>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Menu</DialogTitle>
              <DialogDescription>
                {DAYS[editDialog.dayOfWeek]} - {MEAL_TYPE_LABELS[editDialog.mealType]}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label>Menu Items (one per line)</Label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={editDialog.items.join('\n')}
                  onChange={(e) =>
                    setEditDialog({
                      ...editDialog,
                      items: e.target.value.split('\n').filter((i) => i.trim()),
                    })
                  }
                  placeholder="Enter menu items, one per line"
                />
              </div>
              <div>
                <Label>Special Diet Notes</Label>
                <Input
                  value={editDialog.specialDiet}
                  onChange={(e) =>
                    setEditDialog({ ...editDialog, specialDiet: e.target.value })
                  }
                  placeholder="e.g., Jain food available on request"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialog({ ...editDialog, open: false })}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateMenu.isPending}>
                {updateMenu.isPending ? 'Saving...' : 'Save Menu'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
