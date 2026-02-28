import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchIntegrations,
  fetchIntegration,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  testIntegration,
  fetchBiometricDevices,
  fetchBiometricDevice,
  createBiometricDevice,
  updateBiometricDevice,
  deleteBiometricDevice,
  syncBiometricDevice,
  fetchWebhooks,
  fetchWebhook,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  fetchAPIKeys,
  createAPIKey,
  revokeAPIKey,
} from '../api/integrations.api'
import type {
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  IntegrationFilters,
  CreateBiometricDeviceRequest,
  UpdateBiometricDeviceRequest,
  BiometricDeviceFilters,
  CreateWebhookRequest,
  UpdateWebhookRequest,
  CreateAPIKeyRequest,
} from '../types/integrations.types'

// ==================== QUERY KEYS ====================

export const integrationKeys = {
  all: ['integrations'] as const,

  // Integrations
  integrations: () => [...integrationKeys.all, 'configs'] as const,
  integrationsList: (filters: IntegrationFilters) =>
    [...integrationKeys.integrations(), filters] as const,
  integration: (id: string) =>
    [...integrationKeys.integrations(), id] as const,

  // Biometric Devices
  biometricDevices: () => [...integrationKeys.all, 'biometric'] as const,
  biometricDevicesList: (filters: BiometricDeviceFilters) =>
    [...integrationKeys.biometricDevices(), filters] as const,
  biometricDevice: (id: string) =>
    [...integrationKeys.biometricDevices(), id] as const,

  // Webhooks
  webhooks: () => [...integrationKeys.all, 'webhooks'] as const,
  webhook: (id: string) => [...integrationKeys.webhooks(), id] as const,

  // API Keys
  apiKeys: () => [...integrationKeys.all, 'api-keys'] as const,
}

// ==================== INTEGRATION HOOKS ====================

export function useIntegrations(filters: IntegrationFilters = {}) {
  return useQuery({
    queryKey: integrationKeys.integrationsList(filters),
    queryFn: () => fetchIntegrations(filters),
  })
}

export function useIntegration(id: string) {
  return useQuery({
    queryKey: integrationKeys.integration(id),
    queryFn: () => fetchIntegration(id),
    enabled: !!id,
  })
}

export function useCreateIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateIntegrationRequest) => createIntegration(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.integrations() })
    },
  })
}

export function useUpdateIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIntegrationRequest }) =>
      updateIntegration(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.integration(variables.id) })
      queryClient.invalidateQueries({ queryKey: integrationKeys.integrations() })
    },
  })
}

export function useDeleteIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteIntegration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.integrations() })
    },
  })
}

export function useTestIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => testIntegration(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.integration(id) })
      queryClient.invalidateQueries({ queryKey: integrationKeys.integrations() })
    },
  })
}

// ==================== BIOMETRIC DEVICE HOOKS ====================

export function useBiometricDevices(filters: BiometricDeviceFilters = {}) {
  return useQuery({
    queryKey: integrationKeys.biometricDevicesList(filters),
    queryFn: () => fetchBiometricDevices(filters),
  })
}

export function useBiometricDevice(id: string) {
  return useQuery({
    queryKey: integrationKeys.biometricDevice(id),
    queryFn: () => fetchBiometricDevice(id),
    enabled: !!id,
  })
}

export function useCreateBiometricDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBiometricDeviceRequest) => createBiometricDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.biometricDevices() })
    },
  })
}

export function useUpdateBiometricDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBiometricDeviceRequest }) =>
      updateBiometricDevice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.biometricDevice(variables.id) })
      queryClient.invalidateQueries({ queryKey: integrationKeys.biometricDevices() })
    },
  })
}

export function useDeleteBiometricDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteBiometricDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.biometricDevices() })
    },
  })
}

export function useSyncBiometricDevice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => syncBiometricDevice(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.biometricDevice(id) })
      queryClient.invalidateQueries({ queryKey: integrationKeys.biometricDevices() })
    },
  })
}

// ==================== WEBHOOK HOOKS ====================

export function useWebhooks() {
  return useQuery({
    queryKey: integrationKeys.webhooks(),
    queryFn: fetchWebhooks,
  })
}

export function useWebhook(id: string) {
  return useQuery({
    queryKey: integrationKeys.webhook(id),
    queryFn: () => fetchWebhook(id),
    enabled: !!id,
  })
}

export function useCreateWebhook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateWebhookRequest) => createWebhook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.webhooks() })
    },
  })
}

export function useUpdateWebhook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWebhookRequest }) =>
      updateWebhook(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.webhook(variables.id) })
      queryClient.invalidateQueries({ queryKey: integrationKeys.webhooks() })
    },
  })
}

export function useDeleteWebhook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteWebhook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.webhooks() })
    },
  })
}

export function useTestWebhook() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => testWebhook(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.webhook(id) })
      queryClient.invalidateQueries({ queryKey: integrationKeys.webhooks() })
    },
  })
}

// ==================== API KEY HOOKS ====================

export function useAPIKeys() {
  return useQuery({
    queryKey: integrationKeys.apiKeys(),
    queryFn: fetchAPIKeys,
  })
}

export function useCreateAPIKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAPIKeyRequest) => createAPIKey(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.apiKeys() })
    },
  })
}

export function useRevokeAPIKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => revokeAPIKey(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: integrationKeys.apiKeys() })
    },
  })
}
