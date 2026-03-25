import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchCurrentPlan,
  fetchAvailablePlans,
  upgradePlan,
  fetchPlanLimits,
} from '../api/subscription.api'

export function useCurrentPlan() {
  return useQuery({
    queryKey: ['subscription', 'current'],
    queryFn: async () => {
      const res = await fetchCurrentPlan()
      return res.data
    },
  })
}

export function useAvailablePlans() {
  return useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: async () => {
      const res = await fetchAvailablePlans()
      return res.data
    },
  })
}

export function useUpgradePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (tier: string) => upgradePlan(tier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      queryClient.invalidateQueries({ queryKey: ['addons'] })
    },
  })
}

export function usePlanLimits(resource: 'students' | 'staff' | 'users') {
  return useQuery({
    queryKey: ['subscription', 'limits', resource],
    queryFn: async () => {
      const res = await fetchPlanLimits(resource)
      return res.data
    },
  })
}
