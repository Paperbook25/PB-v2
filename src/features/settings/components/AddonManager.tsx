import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Bus,
  Building2,
  Warehouse,
  FolderOpen,
  Trophy,
  Users,
  Award,
  MessageSquareWarning,
  UserCheck,
  Loader2,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { apiGet, apiPatch } from '@/lib/api-client'
import { useAddonStore, type AddonInfo } from '@/stores/useAddonStore'
import { toast } from '@/hooks/use-toast'

// ==================== TYPES ====================

interface AddonsResponse {
  addons: AddonInfo[]
}

interface ToggleResponse {
  slug: string
  enabled: boolean
}

// ==================== ICON MAP ====================

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Bus,
  Building2,
  Warehouse,
  FolderOpen,
  Trophy,
  Users,
  Award,
  MessageSquareWarning,
  UserCheck,
}

// ==================== CATEGORY LABELS ====================

const CATEGORY_LABELS: Record<string, string> = {
  academic: 'Academic',
  operations: 'Operations',
  communication: 'Communication',
  extras: 'Extras',
}

const CATEGORY_ORDER = ['academic', 'operations', 'communication', 'extras']

// ==================== QUERY KEYS ====================

const addonKeys = {
  all: ['addons'] as const,
  list: () => [...addonKeys.all, 'list'] as const,
}

// ==================== COMPONENT ====================

export function AddonManager() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: addonKeys.list(),
    queryFn: () => apiGet<AddonsResponse>('/api/addons'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ slug, enabled }: { slug: string; enabled: boolean }) =>
      apiPatch<ToggleResponse>(`/api/addons/${slug}`, { enabled }),
    onMutate: async ({ slug, enabled }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: addonKeys.list() })
      const previousData = queryClient.getQueryData<AddonsResponse>(addonKeys.list())

      queryClient.setQueryData<AddonsResponse>(addonKeys.list(), (old) => {
        if (!old) return old
        return {
          addons: old.addons.map((a) =>
            a.slug === slug
              ? { ...a, enabled, enabledAt: enabled ? new Date().toISOString() : null }
              : a
          ),
        }
      })

      return { previousData }
    },
    onSuccess: (_data, { slug, enabled }) => {
      // Update the addon store so AppLauncher reflects the change immediately
      const { addons, setAddons } = useAddonStore.getState()
      setAddons(addons.map((a) => (a.slug === slug ? { ...a, enabled } : a)))

      const addon = data?.addons.find((a) => a.slug === slug)
      const name = addon?.name || slug
      toast({
        title: enabled ? `${name} enabled` : `${name} disabled`,
        description: enabled
          ? `${name} is now available in your school modules.`
          : `${name} has been removed from active modules.`,
      })
    },
    onError: (_error, _variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(addonKeys.list(), context.previousData)
      }
      toast({
        title: 'Failed to update module',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: addonKeys.list() })
    },
  })

  const addons = data?.addons || []

  // Group addons by category in defined order
  const groupedAddons = CATEGORY_ORDER.reduce<Record<string, AddonInfo[]>>(
    (groups, category) => {
      const categoryAddons = addons
        .filter((a) => a.category === category)
        .sort((a, b) => a.sortOrder - b.sortOrder)
      if (categoryAddons.length > 0) {
        groups[category] = categoryAddons
      }
      return groups
    },
    {}
  )

  if (isLoading) {
    return <AddonManagerSkeleton />
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Modules & Add-ons</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enable or disable modules for your school. Changes take effect immediately.
        </p>
      </div>

      {/* Category groups */}
      <div className="space-y-6">
        {Object.entries(groupedAddons).map(([category, categoryAddons]) => (
          <div key={category}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              {CATEGORY_LABELS[category] || category}
            </h3>

            <div className="flex flex-col gap-3">
              {categoryAddons.map((addon) => {
                const IconComponent = addon.icon ? ICON_MAP[addon.icon] : null
                const isPending =
                  toggleMutation.isPending &&
                  toggleMutation.variables?.slug === addon.slug

                return (
                  <div
                    key={addon.id}
                    className={`flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg transition-opacity ${
                      !addon.enabled && !addon.isCore ? 'opacity-60' : ''
                    }`}
                  >
                    {/* Left side: icon + info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                        {IconComponent ? (
                          <IconComponent className="h-5 w-5" />
                        ) : (
                          <div className="h-5 w-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900">
                            {addon.name}
                          </p>
                          {addon.isCore && (
                            <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                              Core
                            </span>
                          )}
                        </div>
                        {addon.description && (
                          <p className="text-sm text-gray-500 mt-0.5 truncate">
                            {addon.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right side: toggle */}
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      {isPending && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      )}
                      <Switch
                        checked={addon.isCore ? true : addon.enabled}
                        disabled={addon.isCore || isPending}
                        onCheckedChange={(checked) => {
                          if (!addon.isCore) {
                            toggleMutation.mutate({
                              slug: addon.slug,
                              enabled: checked,
                            })
                          }
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== LOADING SKELETON ====================

function AddonManagerSkeleton() {
  return (
    <div>
      <div className="mb-6">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-80 bg-gray-100 rounded animate-pulse mt-2" />
      </div>

      {[1, 2, 3].map((group) => (
        <div key={group} className="mb-6">
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-3" />
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 animate-pulse" />
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-56 bg-gray-100 rounded animate-pulse mt-1.5" />
                  </div>
                </div>
                <div className="h-6 w-11 bg-gray-200 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
