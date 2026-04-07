import { useState } from 'react'
import { Check, X, Crown, Zap, Building2, Rocket, Users, GraduationCap, UserCheck, Lock, Unlock, Loader2, AlertTriangle, IndianRupee } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiPatch } from '@/lib/api-client'
import { useAddonStore } from '@/stores/useAddonStore'
import { toast } from '@/hooks/use-toast'
import { useCurrentPlan, useAvailablePlans, useUpgradePlan } from '../hooks/useSubscription'
import type { PlanConfig, SubscriptionInfo } from '../api/subscription.api'

const PLAN_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700 border-gray-300',
  starter: 'bg-blue-100 text-blue-700 border-blue-300',
  professional: 'bg-purple-100 text-purple-700 border-purple-300',
  enterprise: 'bg-amber-100 text-amber-700 border-amber-300',
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Building2 className="h-5 w-5" />,
  starter: <Zap className="h-5 w-5" />,
  professional: <Rocket className="h-5 w-5" />,
  enterprise: <Crown className="h-5 w-5" />,
}

const TIER_ORDER = ['free', 'starter', 'professional', 'enterprise']

const ALL_FEATURES_DISPLAY: { key: string; label: string }[] = [
  { key: 'basic_reports', label: 'Basic Reports' },
  { key: 'advanced_reports', label: 'Advanced Reports' },
  { key: 'email_notifications', label: 'Email Notifications' },
  { key: 'sms_notifications', label: 'SMS Notifications' },
  { key: 'custom_domain', label: 'Custom Domain' },
  { key: 'api_access', label: 'API Access' },
  { key: 'whatsapp_integration', label: 'WhatsApp Integration' },
  { key: 'ai_chatbot', label: 'AI Chatbot' },
  { key: 'email_campaigns', label: 'Email Campaigns' },
]

const ALL_MODULES_DISPLAY: { slug: string; label: string }[] = [
  { slug: 'school-website', label: 'School Website' },
  { slug: 'library', label: 'Library' },
  { slug: 'transport', label: 'Transport' },
  { slug: 'documents', label: 'Documents' },
  { slug: 'visitors', label: 'Visitors' },
  { slug: 'complaints', label: 'Complaints' },
  { slug: 'lms', label: 'LMS' },
  { slug: 'hostel', label: 'Hostel' },
  { slug: 'operations', label: 'Operations' },
  { slug: 'exams', label: 'Exams' },
  { slug: 'alumni', label: 'Alumni' },
  { slug: 'clubs', label: 'Clubs' },
  { slug: 'scholarships', label: 'Scholarships' },
  { slug: 'behavior', label: 'Behavior' },
]

function formatINR(amount: number): string {
  if (amount === 0) return 'Free'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function UsageBar({ label, icon, current, limit }: {
  label: string
  icon: React.ReactNode
  current: number
  limit: number
}) {
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 10 : Math.min((current / limit) * 100, 100)
  const isNearLimit = !isUnlimited && percentage >= 80
  const isAtLimit = !isUnlimited && percentage >= 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 font-medium">
          {icon}
          {label}
        </div>
        <span className={isAtLimit ? 'text-red-600 font-semibold' : isNearLimit ? 'text-amber-600' : 'text-muted-foreground'}>
          {current.toLocaleString()} / {isUnlimited ? 'Unlimited' : limit.toLocaleString()}
        </span>
      </div>
      <Progress
        value={percentage}
        className={`h-2 ${isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-amber-500' : ''}`}
      />
    </div>
  )
}

function PlanComparisonTable({ plans, currentPlanId, onUpgrade, isUpgrading }: {
  plans: PlanConfig[]
  currentPlanId: string
  onUpgrade: (tier: string) => void
  isUpgrading: boolean
}) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Plan Comparison</CardTitle>
            <CardDescription>Choose the plan that fits your school</CardDescription>
          </div>
          <div className="flex items-center gap-2 rounded-lg border p-1">
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'annual' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              }`}
              onClick={() => setBillingCycle('annual')}
            >
              Annual
              <Badge variant="secondary" className="ml-1.5 text-xs">Save ~17%</Badge>
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground w-[200px]">Feature</th>
                {plans.map(plan => (
                  <th key={plan.id} className="text-center py-3 px-2 min-w-[140px]">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        {PLAN_ICONS[plan.id]}
                        <span className="font-semibold">{plan.name}</span>
                      </div>
                      <span className="text-lg font-bold">
                        {formatINR(billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {plan.price.monthly === 0 ? 'forever' : billingCycle === 'monthly' ? '/month' : '/year'}
                      </span>
                      {plan.id === currentPlanId ? (
                        <Badge variant="default" className="mt-1">Current Plan</Badge>
                      ) : TIER_ORDER.indexOf(plan.id) > TIER_ORDER.indexOf(currentPlanId) ? (
                        <Button
                          size="sm"
                          className="mt-1"
                          onClick={() => onUpgrade(plan.id)}
                          disabled={isUpgrading}
                        >
                          Upgrade
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground mt-1">-</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Limits */}
              <tr className="border-b bg-muted/30">
                <td colSpan={plans.length + 1} className="py-2 px-2 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Limits
                </td>
              </tr>
              <tr className="border-b">
                <td className="py-2 px-2">Max Students</td>
                {plans.map(plan => (
                  <td key={plan.id} className="text-center py-2 px-2">
                    {plan.maxStudents === -1 ? 'Unlimited' : plan.maxStudents.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2 px-2">Max Staff</td>
                {plans.map(plan => (
                  <td key={plan.id} className="text-center py-2 px-2">
                    {plan.maxStaff === -1 ? 'Unlimited' : plan.maxStaff.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2 px-2">Max Users</td>
                {plans.map(plan => (
                  <td key={plan.id} className="text-center py-2 px-2">
                    {plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers.toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Modules */}
              <tr className="border-b bg-muted/30">
                <td colSpan={plans.length + 1} className="py-2 px-2 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Modules
                </td>
              </tr>
              {ALL_MODULES_DISPLAY.map(mod => (
                <tr key={mod.slug} className="border-b">
                  <td className="py-2 px-2">{mod.label}</td>
                  {plans.map(plan => {
                    const included = plan.modules.includes('*') || plan.modules.includes(mod.slug)
                    return (
                      <td key={plan.id} className="text-center py-2 px-2">
                        {included ? (
                          <Check className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300 mx-auto" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}

              {/* Features */}
              <tr className="border-b bg-muted/30">
                <td colSpan={plans.length + 1} className="py-2 px-2 font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                  Features
                </td>
              </tr>
              {ALL_FEATURES_DISPLAY.map(feat => (
                <tr key={feat.key} className="border-b">
                  <td className="py-2 px-2">{feat.label}</td>
                  {plans.map(plan => {
                    const included = plan.features.includes('*') || plan.features.includes(feat.key)
                    return (
                      <td key={plan.id} className="text-center py-2 px-2">
                        {included ? (
                          <Check className="h-4 w-4 text-green-600 mx-auto" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300 mx-auto" />
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

function formatTrialDays(trialEndsAt: string | null | undefined): string {
  if (!trialEndsAt) return ''
  const days = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000)
  if (days <= 0) return 'Trial ended'
  return `Trial: ${days}d left`
}

function AddonBillingBadge({ addon }: { addon: import('@/stores/useAddonStore').AddonInfo }) {
  if (addon.includedInPlan) {
    return <span className="text-xs text-green-600 font-medium">Included</span>
  }
  if (addon.billingStatus === 'trial') {
    return (
      <span className="text-xs text-blue-600 font-medium">
        {formatTrialDays(addon.trialEndsAt)}
      </span>
    )
  }
  if (addon.billingStatus === 'active') {
    return (
      <span className="text-xs text-purple-600 font-medium flex items-center gap-0.5">
        <IndianRupee className="h-3 w-3" />
        {addon.effectiveMonthlyPrice?.toLocaleString('en-IN')}/mo
      </span>
    )
  }
  if (addon.effectiveMonthlyPrice) {
    return (
      <span className="text-xs text-muted-foreground flex items-center gap-0.5">
        <IndianRupee className="h-3 w-3" />
        {addon.effectiveMonthlyPrice.toLocaleString('en-IN')}/mo
      </span>
    )
  }
  return null
}

function ModuleAccessSection({ subscription, canEnablePaidAddons }: {
  subscription: SubscriptionInfo
  canEnablePaidAddons: boolean
}) {
  const queryClient = useQueryClient()
  const addonStore = useAddonStore()
  const [togglingSlug, setTogglingSlug] = useState<string | null>(null)
  const [confirmAddon, setConfirmAddon] = useState<import('@/stores/useAddonStore').AddonInfo | null>(null)

  const toggleMutation = useMutation({
    mutationFn: ({ slug, enabled }: { slug: string; enabled: boolean }) =>
      apiPatch<{ slug: string; enabled: boolean; billingStatus?: string; trialEndsAt?: string }>(`/api/addons/${slug}`, { enabled }),
    onSuccess: (data, { slug, enabled }) => {
      const { addons, setAddons } = useAddonStore.getState()
      setAddons(addons.map((a) => a.slug === slug ? {
        ...a,
        enabled,
        billingStatus: (data as any).billingStatus || a.billingStatus,
        trialEndsAt: (data as any).trialEndsAt || a.trialEndsAt,
      } : a))
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      queryClient.invalidateQueries({ queryKey: ['addons'] })
      const addonInfo = addonStore.addons.find(a => a.slug === slug)
      const label = addonInfo?.name || slug
      toast({
        title: enabled ? `${label} enabled` : `${label} disabled`,
        description: enabled && (data as any).billingStatus === 'trial'
          ? `${label} is now active. 30-day free trial started.`
          : enabled
            ? `${label} is now available.`
            : `${label} has been disabled.`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update module',
        description: error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    },
    onSettled: () => {
      setTogglingSlug(null)
    },
  })

  const handleToggle = (addon: import('@/stores/useAddonStore').AddonInfo, checked: boolean) => {
    // If enabling a paid addon (not in plan, has price), show confirmation dialog
    if (checked && !addon.includedInPlan && addon.effectiveMonthlyPrice) {
      setConfirmAddon(addon)
      return
    }
    setTogglingSlug(addon.slug)
    toggleMutation.mutate({ slug: addon.slug, enabled: checked })
  }

  // Get addons from the store — these have billing info from the API
  const addons: import('@/stores/useAddonStore').AddonInfo[] = addonStore.addons.length > 0
    ? addonStore.addons
    : ALL_MODULES_DISPLAY.map(m => ({
        id: m.slug, slug: m.slug, name: m.label, description: null, icon: null,
        category: 'general', isCore: false, sortOrder: 0, enabled: false,
        includedInPlan: false,
      }))

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Module Access</CardTitle>
          <CardDescription>
            Toggle modules on or off. Modules included in your plan are free.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canEnablePaidAddons && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-200">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Switch to a semi-annual or annual plan to unlock individual paid add-ons.
              </span>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {addons.map(addon => {
              const enabled = addon.enabled
              const isPending = togglingSlug === addon.slug
              const isToggleable = addon.includedInPlan || canEnablePaidAddons || enabled

              return (
                <div
                  key={addon.slug}
                  className={`flex flex-col gap-1.5 rounded-lg border p-3 text-sm transition-colors ${
                    enabled
                      ? 'border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800'
                      : 'border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-700'
                  } ${!isToggleable ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    {enabled ? (
                      <Unlock className="h-4 w-4 text-green-600 shrink-0" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400 shrink-0" />
                    )}
                    <span className={`flex-1 font-medium ${enabled ? '' : 'text-muted-foreground'}`}>
                      {addon.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {isPending && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
                      <Switch
                        checked={enabled}
                        disabled={isPending || !isToggleable}
                        onCheckedChange={(checked) => handleToggle(addon, checked)}
                      />
                    </div>
                  </div>
                  <AddonBillingBadge addon={addon} />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation dialog for paid addons */}
      <AlertDialog open={!!confirmAddon} onOpenChange={(open) => !open && setConfirmAddon(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable {confirmAddon?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This add-on costs{' '}
              <strong>
                ₹{confirmAddon?.effectiveMonthlyPrice?.toLocaleString('en-IN')}/month
              </strong>{' '}
              after a <strong>30-day free trial</strong>. You can disable it anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAddon) {
                  setTogglingSlug(confirmAddon.slug)
                  toggleMutation.mutate({ slug: confirmAddon.slug, enabled: true })
                  setConfirmAddon(null)
                }
              }}
            >
              Start 30-Day Free Trial
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function SubscriptionSection() {
  const { data: subscription, isLoading: loadingCurrent } = useCurrentPlan()
  const { data: plans, isLoading: loadingPlans } = useAvailablePlans()
  const upgradeMutation = useUpgradePlan()

  if (loadingCurrent || loadingPlans) {
    return (
      <div className="space-y-4">
        <div className="h-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-96 rounded-lg bg-muted animate-pulse" />
      </div>
    )
  }

  if (!subscription || !plans) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Unable to load subscription information. Please try again.
        </CardContent>
      </Card>
    )
  }

  const currentPlanId = subscription.plan.id
  const planColorClass = PLAN_COLORS[currentPlanId] || PLAN_COLORS.free

  const handleUpgrade = (tier: string) => {
    if (confirm(`Are you sure you want to change your plan to ${tier}? Modules included in the new plan will be auto-enabled.`)) {
      upgradeMutation.mutate(tier)
    }
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Subscription
                <Badge className={`${planColorClass} border`}>
                  <span className="flex items-center gap-1">
                    {PLAN_ICONS[currentPlanId]}
                    {subscription.plan.name}
                  </span>
                </Badge>
              </CardTitle>
              <CardDescription>
                Manage your school's subscription plan and resource usage
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatINR(subscription.plan.price.monthly)}</div>
              {subscription.plan.price.monthly > 0 && (
                <div className="text-xs text-muted-foreground">per month</div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsageBar
            label="Students"
            icon={<GraduationCap className="h-4 w-4" />}
            current={subscription.usage.students.current}
            limit={subscription.usage.students.limit}
          />
          <UsageBar
            label="Staff"
            icon={<UserCheck className="h-4 w-4" />}
            current={subscription.usage.staff.current}
            limit={subscription.usage.staff.limit}
          />
          <UsageBar
            label="Users"
            icon={<Users className="h-4 w-4" />}
            current={subscription.usage.users.current}
            limit={subscription.usage.users.limit}
          />
        </CardContent>
      </Card>

      {/* Module Status with Toggles */}
      <ModuleAccessSection
        subscription={subscription}
        canEnablePaidAddons={subscription.canEnablePaidAddons ?? true}
      />

      {/* Addon Charges Summary */}
      {subscription.addonCharges?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Estimated Monthly Charges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>{subscription.plan.name} Plan</span>
              <span>{formatINR(subscription.plan.price.monthly)}</span>
            </div>
            {subscription.addonCharges.map((charge) => (
              <div key={charge.slug} className="flex justify-between">
                <span className="flex items-center gap-1.5">
                  {charge.name} Add-on
                  {charge.billingStatus === 'trial' && (
                    <Badge variant="secondary" className="text-xs">Trial</Badge>
                  )}
                </span>
                <span className={charge.billingStatus === 'trial' ? 'text-muted-foreground line-through' : ''}>
                  {formatINR(charge.monthlyPrice)}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Estimated Total</span>
              <span>{formatINR(subscription.plan.price.monthly + (subscription.totalAddonCharges || 0))}</span>
            </div>
            <p className="text-xs text-muted-foreground">* Trial add-ons are free for 30 days. Amounts shown are after trial ends.</p>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Plan Comparison */}
      <PlanComparisonTable
        plans={plans}
        currentPlanId={currentPlanId}
        onUpgrade={handleUpgrade}
        isUpgrading={upgradeMutation.isPending}
      />

      {upgradeMutation.isSuccess && upgradeMutation.data?.data && (
        <Card className="border-green-300 bg-green-50 dark:bg-green-950/20">
          <CardContent className="py-4">
            <p className="text-sm text-green-700 dark:text-green-300 font-medium">
              Plan upgraded to {upgradeMutation.data.data.plan.name} successfully!
              {upgradeMutation.data.data.autoEnabledModules.length > 0 && (
                <span>
                  {' '}Auto-enabled modules: {upgradeMutation.data.data.autoEnabledModules.join(', ')}.
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {upgradeMutation.isError && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950/20">
          <CardContent className="py-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              {upgradeMutation.error?.message || 'Failed to upgrade plan. Please try again.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
