import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Puzzle,
  Loader2,
  AlertCircle,
  Users,
  CheckCircle,
  Star,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Bus,
  Building2,
  Package,
  FolderOpen,
  Trophy,
  Shield,
  Globe,
  MessageCircle,
  Heart,
  Eye,
  Blocks,
  Warehouse,
  Award,
  MessageSquareWarning,
  UserCheck,
  Plus,
  Trash2,
  Edit2,
  X,
  type LucideIcon,
} from 'lucide-react'
import { adminApi } from '../../../lib/api'

const ICON_MAP: Record<string, LucideIcon> = {
  BookOpen, GraduationCap, ClipboardCheck, Bus, Building2, Package,
  FolderOpen, Trophy, Shield, Globe, MessageCircle, Heart, Eye,
  Users, Blocks, Warehouse, Puzzle, Star, Award, MessageSquareWarning,
  UserCheck,
}

interface Addon {
  id: string
  name: string
  slug: string
  description: string | null
  icon?: string | null
  category?: string | null
  isCore: boolean
  enabled?: boolean
  enabledAt?: string | null
  enabledBy?: string | null
  schoolCount?: number
  usageCount?: number
  availableTiers?: string[]
  isActive?: boolean
}

const tierColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700 border-gray-200',
  starter: 'bg-blue-50 text-blue-700 border-blue-200',
  professional: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  enterprise: 'bg-purple-50 text-purple-700 border-purple-200',
}

const allTiers = ['free', 'starter', 'professional', 'enterprise']

const CATEGORIES = ['academics', 'operations', 'communication', 'general'] as const

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

interface AddonFormData {
  name: string
  slug: string
  description: string
  icon: string
  category: string
  isCore: boolean
}

const emptyForm: AddonFormData = {
  name: '',
  slug: '',
  description: '',
  icon: '',
  category: 'general',
  isCore: false,
}

export function AddonsPage() {
  const queryClient = useQueryClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null)
  const [form, setForm] = useState<AddonFormData>(emptyForm)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const addonsQuery = useQuery({
    queryKey: ['admin', 'addons'],
    queryFn: adminApi.listAddons,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateAddon(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'addons'] }),
  })

  const createMutation = useMutation({
    mutationFn: (data: AddonFormData) => adminApi.createAddon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'addons'] })
      closeDialog()
    },
    onError: (err: any) => setFormError(err?.message || 'Failed to create addon'),
  })

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AddonFormData> }) => adminApi.updateAddon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'addons'] })
      closeDialog()
    },
    onError: (err: any) => setFormError(err?.message || 'Failed to update addon'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteAddon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'addons'] })
      setDeleteConfirmId(null)
    },
  })

  const openCreateDialog = () => {
    setEditingAddon(null)
    setForm(emptyForm)
    setSlugManuallyEdited(false)
    setFormError(null)
    setDialogOpen(true)
  }

  const openEditDialog = (addon: Addon) => {
    setEditingAddon(addon)
    setForm({
      name: addon.name,
      slug: addon.slug,
      description: addon.description || '',
      icon: addon.icon || '',
      category: addon.category || 'general',
      isCore: addon.isCore,
    })
    setSlugManuallyEdited(true)
    setFormError(null)
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingAddon(null)
    setForm(emptyForm)
    setFormError(null)
  }

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: slugManuallyEdited ? prev.slug : toSlug(name),
    }))
  }

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true)
    setForm((prev) => ({ ...prev, slug }))
  }

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setFormError('Name is required')
      return
    }
    if (!form.slug.trim()) {
      setFormError('Slug is required')
      return
    }
    setFormError(null)

    if (editingAddon) {
      editMutation.mutate({ id: editingAddon.id, data: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const isSaving = createMutation.isPending || editMutation.isPending

  const addons: Addon[] = addonsQuery.data || []

  const handleToggleTier = (addon: Addon, tier: string) => {
    const currentTiers = addon.availableTiers || []
    const newTiers = currentTiers.includes(tier)
      ? currentTiers.filter((t) => t !== tier)
      : [...currentTiers, tier]

    updateMutation.mutate({
      id: addon.id,
      data: { availableTiers: newTiers },
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Addons</h1>
          <p className="text-sm text-muted-foreground">
            Manage platform addons and their availability across plan tiers
          </p>
        </div>
        <button
          onClick={openCreateDialog}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create Addon
        </button>
      </div>

      {/* Content */}
      {addonsQuery.isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border bg-card">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading addons...</span>
          </div>
        </div>
      ) : addonsQuery.isError ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          Failed to load addons. Please try again.
        </div>
      ) : addons.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border bg-card">
          <Puzzle className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">No addons configured yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {addons.map((addon) => (
            <div
              key={addon.id}
              className="relative rounded-lg border bg-card p-5 transition-shadow hover:shadow-sm"
            >
              {/* Card Actions */}
              <div className="absolute right-3 top-3 flex items-center gap-1">
                <button
                  onClick={() => openEditDialog(addon)}
                  className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  title="Edit addon"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                {!addon.isCore && (
                  <button
                    onClick={() => setDeleteConfirmId(addon.id)}
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600"
                    title="Delete addon"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* Addon Header */}
              <div className="flex items-start gap-3 pr-14">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  {(() => {
                    const IconComponent = addon.icon ? ICON_MAP[addon.icon] : null
                    return IconComponent
                      ? <IconComponent className="h-5 w-5 text-primary" />
                      : <Puzzle className="h-5 w-5 text-primary" />
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{addon.name}</h3>
                    {addon.isActive && (
                      <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                    )}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {addon.description || 'No description available'}
                  </p>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    <span className="font-semibold text-foreground">{addon.usageCount ?? 0}</span> schools using
                  </span>
                </div>
                {addon.category && (
                  <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                    {addon.category}
                  </span>
                )}
              </div>

              {/* Tier Toggles */}
              <div className="mt-4 border-t border-border pt-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Available Tiers</p>
                <div className="flex flex-wrap gap-1.5">
                  {allTiers.map((tier) => {
                    const isEnabled = (addon.availableTiers || []).includes(tier)
                    return (
                      <button
                        key={tier}
                        onClick={() => handleToggleTier(addon, tier)}
                        disabled={updateMutation.isPending}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium capitalize transition-all ${
                          isEnabled
                            ? tierColors[tier] || 'bg-primary/10 text-primary border-primary/20'
                            : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted'
                        } disabled:opacity-60`}
                      >
                        {isEnabled && <Star className="mr-1 inline h-2.5 w-2.5" />}
                        {tier}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Addon Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeDialog}>
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                {editingAddon ? 'Edit Addon' : 'Create Addon'}
              </h2>
              <button onClick={closeDialog} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="mb-3 rounded-md bg-red-50 p-2.5 text-sm text-red-600">{formError}</div>
            )}

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Student Transport"
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Slug *</label>
                <input
                  value={form.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="student-transport"
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the addon..."
                  rows={3}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Icon</label>
                  <input
                    value={form.icon}
                    onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
                    placeholder="e.g. Bus or BookOpen"
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={form.isCore}
                  onChange={(e) => setForm((prev) => ({ ...prev, isCore: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-foreground">Core addon (cannot be deleted)</span>
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={closeDialog}
                className="rounded-lg border px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {editingAddon ? 'Save Changes' : 'Create Addon'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setDeleteConfirmId(null)}>
          <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-foreground">Delete Addon</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Are you sure you want to delete this addon? This action cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
