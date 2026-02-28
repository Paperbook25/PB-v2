import { Palette, Sun, Moon, Monitor } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/hooks/use-toast'
import { useThemeConfig, useUpdateThemeConfig } from '../hooks/useSettings'
import { cn } from '@/lib/utils'
import type { ThemeConfig } from '../types/settings.types'

const THEME_MODES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

const PRESET_COLORS = [
  { name: 'Purple', primary: '#6d28d9', accent: '#7c3aed' },
  { name: 'Blue', primary: '#2563eb', accent: '#0891b2' },
  { name: 'Green', primary: '#16a34a', accent: '#0d9488' },
  { name: 'Orange', primary: '#ea580c', accent: '#f59e0b' },
  { name: 'Red', primary: '#dc2626', accent: '#e11d48' },
]

export function ThemeSettings() {
  const { toast } = useToast()
  const { data, isLoading } = useThemeConfig()
  const updateConfig = useUpdateThemeConfig()

  const handleUpdateConfig = (updates: Partial<ThemeConfig>) => {
    updateConfig.mutate(updates, {
      onSuccess: () => {
        toast({
          title: 'Theme Updated',
          description: 'Your theme preferences have been saved.',
        })
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update theme',
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
        <CardContent className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const config = data?.data

  if (!config) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Appearance
        </CardTitle>
        <CardDescription>Customize the look and feel of the application</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Mode */}
        <div className="space-y-3">
          <Label>Theme Mode</Label>
          <RadioGroup
            value={config.mode}
            onValueChange={(value: 'light' | 'dark' | 'system') =>
              handleUpdateConfig({ mode: value })
            }
            className="grid grid-cols-3 gap-4"
          >
            {THEME_MODES.map((mode) => {
              const Icon = mode.icon
              return (
                <div key={mode.value}>
                  <RadioGroupItem
                    value={mode.value}
                    id={mode.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={mode.value}
                    className={cn(
                      'flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer'
                    )}
                  >
                    <Icon className="mb-3 h-6 w-6" />
                    {mode.label}
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        </div>

        {/* Color Presets */}
        <div className="space-y-3">
          <Label>Color Scheme</Label>
          <div className="flex flex-wrap gap-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() =>
                  handleUpdateConfig({ primaryColor: color.primary, accentColor: color.accent })
                }
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md border-2 hover:border-primary transition-colors',
                  config.primaryColor === color.primary ? 'border-primary' : 'border-muted'
                )}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color.primary }}
                />
                <span className="text-sm">{color.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Colors */}
        <div className="space-y-3">
          <Label>Custom Colors</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primaryColor" className="text-sm text-muted-foreground">
                Primary Color
              </Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => handleUpdateConfig({ primaryColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={config.primaryColor}
                  onChange={(e) => handleUpdateConfig({ primaryColor: e.target.value })}
                  placeholder="#2563eb"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accentColor" className="text-sm text-muted-foreground">
                Accent Color
              </Label>
              <div className="flex gap-2">
                <Input
                  id="accentColor"
                  type="color"
                  value={config.accentColor}
                  onChange={(e) => handleUpdateConfig({ accentColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  value={config.accentColor}
                  onChange={(e) => handleUpdateConfig({ accentColor: e.target.value })}
                  placeholder="#0891b2"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-3">
          <Label>Preview</Label>
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: config.primaryColor }}
              />
              <span className="text-sm">Primary: {config.primaryColor}</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: config.accentColor }}
              />
              <span className="text-sm">Accent: {config.accentColor}</span>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 rounded-md text-white text-sm"
                style={{ backgroundColor: config.primaryColor }}
              >
                Primary Button
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-md text-white text-sm"
                style={{ backgroundColor: config.accentColor }}
              >
                Accent Button
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
