import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, MessageSquare, Mail, CreditCard, MessageCircle, Fingerprint, Webhook, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { useToast } from '@/hooks/use-toast'
import { IntegrationCard } from '../components/IntegrationCard'
import { SMSConfigForm } from '../components/SMSConfigForm'
import { EmailConfigForm } from '../components/EmailConfigForm'
import { PaymentGatewayConfigForm } from '../components/PaymentGatewayConfigForm'
import { WhatsAppConfigForm } from '../components/WhatsAppConfigForm'
import { BiometricDeviceList } from '../components/BiometricDeviceList'
import { BiometricDeviceForm } from '../components/BiometricDeviceForm'
import { WebhookManager } from '../components/WebhookManager'
import { APIKeyManager } from '../components/APIKeyManager'
import {
  useIntegrations,
  useCreateIntegration,
  useUpdateIntegration,
  useDeleteIntegration,
  useTestIntegration,
  useBiometricDevices,
  useCreateBiometricDevice,
  useUpdateBiometricDevice,
  useDeleteBiometricDevice,
  useSyncBiometricDevice,
  useWebhooks,
  useCreateWebhook,
  useUpdateWebhook,
  useDeleteWebhook,
  useTestWebhook,
  useAPIKeys,
  useCreateAPIKey,
  useRevokeAPIKey,
} from '../hooks/useIntegrations'
import type { IntegrationConfig, BiometricDevice } from '../types/integrations.types'

type TabValue = 'sms' | 'email' | 'payment' | 'whatsapp' | 'biometric' | 'webhooks' | 'api-keys'

export function IntegrationsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as TabValue) || 'sms'
  const { toast } = useToast()

  // State for forms
  const [showSMSForm, setShowSMSForm] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false)
  const [showDeviceForm, setShowDeviceForm] = useState(false)
  const [editingIntegration, setEditingIntegration] = useState<IntegrationConfig | null>(null)
  const [editingDevice, setEditingDevice] = useState<BiometricDevice | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [syncingDeviceId, setSyncingDeviceId] = useState<string | null>(null)

  // Queries
  const { data: integrationsData, isLoading: integrationsLoading } = useIntegrations()
  const { data: devicesData, isLoading: devicesLoading } = useBiometricDevices()
  const { data: webhooksData, isLoading: webhooksLoading } = useWebhooks()
  const { data: apiKeysData, isLoading: apiKeysLoading } = useAPIKeys()

  // Mutations
  const createIntegration = useCreateIntegration()
  const updateIntegration = useUpdateIntegration()
  const deleteIntegration = useDeleteIntegration()
  const testIntegration = useTestIntegration()
  const createDevice = useCreateBiometricDevice()
  const updateDevice = useUpdateBiometricDevice()
  const deleteDevice = useDeleteBiometricDevice()
  const syncDevice = useSyncBiometricDevice()
  const createWebhook = useCreateWebhook()
  const updateWebhookMutation = useUpdateWebhook()
  const deleteWebhookMutation = useDeleteWebhook()
  const testWebhookMutation = useTestWebhook()
  const createAPIKey = useCreateAPIKey()
  const revokeAPIKey = useRevokeAPIKey()

  const integrations = integrationsData?.data || []
  const devices = devicesData?.data || []
  const webhooks = webhooksData?.data || []
  const apiKeys = apiKeysData?.data || []

  // Filter integrations by type
  const smsIntegrations = integrations.filter((i) => i.type === 'sms_gateway')
  const emailIntegrations = integrations.filter((i) => i.type === 'email_service')
  const paymentIntegrations = integrations.filter((i) => i.type === 'payment_gateway')
  const whatsappIntegrations = integrations.filter((i) => i.type === 'whatsapp_api')

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value })
  }

  const handleTestIntegration = async (id: string) => {
    setTestingId(id)
    try {
      const result = await testIntegration.mutateAsync(id)
      toast({
        title: result.success ? 'Connection Successful' : 'Connection Failed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      })
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'An error occurred while testing the connection.',
        variant: 'destructive',
      })
    } finally {
      setTestingId(null)
    }
  }

  const handleDeleteIntegration = async (id: string) => {
    try {
      await deleteIntegration.mutateAsync(id)
      toast({
        title: 'Integration Deleted',
        description: 'The integration has been removed.',
      })
    } catch (error) {
      toast({
        title: 'Delete Failed',
        description: 'Failed to delete the integration.',
        variant: 'destructive',
      })
    }
  }

  const handleSyncDevice = async (id: string) => {
    setSyncingDeviceId(id)
    try {
      const result = await syncDevice.mutateAsync(id)
      toast({
        title: result.success ? 'Sync Successful' : 'Sync Failed',
        description: result.success
          ? `Synced ${result.recordsSynced} records (${result.newRecords} new, ${result.updatedRecords} updated)`
          : result.errors[0] || 'Failed to sync device',
        variant: result.success ? 'default' : 'destructive',
      })
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'An error occurred while syncing the device.',
        variant: 'destructive',
      })
    } finally {
      setSyncingDeviceId(null)
    }
  }

  const handleCreateIntegration = (type: string) => async (data: any) => {
    const payload = {
      type: type as any,
      name: data.name,
      provider: data.provider,
      credentials: {
        authKey: data.authKey,
        apiKey: data.apiKey,
        senderId: data.senderId,
        accountSid: data.accountSid,
        keyId: data.keyId,
        keySecret: data.keySecret,
        whatsappNumber: data.whatsappNumber,
      },
      settings: {
        defaultRoute: data.defaultRoute,
        enableDND: data.enableDND,
        fromEmail: data.fromEmail,
        fromName: data.fromName,
        replyTo: data.replyTo,
        currency: data.currency,
        autoCapture: data.autoCapture,
        sendReceipt: data.sendReceipt,
        templateApprovalRequired: data.templateApprovalRequired,
      },
    }

    try {
      await createIntegration.mutateAsync(payload)
      toast({
        title: 'Integration Created',
        description: 'The integration has been configured successfully.',
      })
    } catch (error) {
      toast({
        title: 'Creation Failed',
        description: 'Failed to create the integration.',
        variant: 'destructive',
      })
      throw error
    }
  }

  const renderIntegrationList = (
    integrations: IntegrationConfig[],
    emptyMessage: string,
    onAdd: () => void
  ) => {
    if (integrationsLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )
    }

    if (integrations.length === 0) {
      return (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">{emptyMessage}</p>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Configuration
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Configuration
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onEdit={() => {
                setEditingIntegration(integration)
                // Open appropriate form based on type
                switch (integration.type) {
                  case 'sms_gateway':
                    setShowSMSForm(true)
                    break
                  case 'email_service':
                    setShowEmailForm(true)
                    break
                  case 'payment_gateway':
                    setShowPaymentForm(true)
                    break
                  case 'whatsapp_api':
                    setShowWhatsAppForm(true)
                    break
                }
              }}
              onDelete={() => handleDeleteIntegration(integration.id)}
              onTest={() => handleTestIntegration(integration.id)}
              isTesting={testingId === integration.id}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Integrations"
        description="Configure external services and API integrations"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Integrations' },
        ]}
        moduleColor="integrations"
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="sms" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 hidden sm:block" />
            SMS
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 hidden sm:block" />
            Email
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 hidden sm:block" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 hidden sm:block" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="biometric" className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4 hidden sm:block" />
            Biometric
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="h-4 w-4 hidden sm:block" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4 hidden sm:block" />
            API Keys
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="sms" className="mt-0">
            {renderIntegrationList(
              smsIntegrations,
              'No SMS gateway configured. Add one to send SMS notifications.',
              () => setShowSMSForm(true)
            )}
          </TabsContent>

          <TabsContent value="email" className="mt-0">
            {renderIntegrationList(
              emailIntegrations,
              'No email service configured. Add one to send email notifications.',
              () => setShowEmailForm(true)
            )}
          </TabsContent>

          <TabsContent value="payment" className="mt-0">
            {renderIntegrationList(
              paymentIntegrations,
              'No payment gateway configured. Add one to accept online payments.',
              () => setShowPaymentForm(true)
            )}
          </TabsContent>

          <TabsContent value="whatsapp" className="mt-0">
            {renderIntegrationList(
              whatsappIntegrations,
              'No WhatsApp API configured. Add one to send WhatsApp notifications.',
              () => setShowWhatsAppForm(true)
            )}
          </TabsContent>

          <TabsContent value="biometric" className="mt-0">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={() => setShowDeviceForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Device
                </Button>
              </div>
              {devicesLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <BiometricDeviceList
                  devices={devices}
                  onEdit={(device) => {
                    setEditingDevice(device)
                    setShowDeviceForm(true)
                  }}
                  onDelete={async (id) => {
                    await deleteDevice.mutateAsync(id)
                    toast({
                      title: 'Device Deleted',
                      description: 'The biometric device has been removed.',
                    })
                  }}
                  onSync={handleSyncDevice}
                  syncingDeviceId={syncingDeviceId}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="webhooks" className="mt-0">
            {webhooksLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <WebhookManager
                webhooks={webhooks}
                onCreate={async (data) => {
                  await createWebhook.mutateAsync(data)
                  toast({
                    title: 'Webhook Created',
                    description: 'The webhook has been configured successfully.',
                  })
                }}
                onUpdate={async (id, data) => {
                  await updateWebhookMutation.mutateAsync({ id, data })
                  toast({
                    title: 'Webhook Updated',
                    description: 'The webhook has been updated.',
                  })
                }}
                onDelete={async (id) => {
                  await deleteWebhookMutation.mutateAsync(id)
                  toast({
                    title: 'Webhook Deleted',
                    description: 'The webhook has been removed.',
                  })
                }}
                onTest={async (id) => {
                  const result = await testWebhookMutation.mutateAsync(id)
                  toast({
                    title: result.success ? 'Test Successful' : 'Test Failed',
                    description: result.success
                      ? `Response received in ${result.responseTime}ms`
                      : 'The webhook endpoint did not respond correctly.',
                    variant: result.success ? 'default' : 'destructive',
                  })
                  return result
                }}
                isCreating={createWebhook.isPending}
                isUpdating={updateWebhookMutation.isPending}
              />
            )}
          </TabsContent>

          <TabsContent value="api-keys" className="mt-0">
            {apiKeysLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <APIKeyManager
                apiKeys={apiKeys}
                onCreate={async (data) => {
                  const result = await createAPIKey.mutateAsync(data)
                  toast({
                    title: 'API Key Generated',
                    description: 'Make sure to copy your key now - it won\'t be shown again.',
                  })
                  return result
                }}
                onRevoke={async (id) => {
                  await revokeAPIKey.mutateAsync(id)
                  toast({
                    title: 'API Key Revoked',
                    description: 'The API key has been deactivated.',
                  })
                }}
                isCreating={createAPIKey.isPending}
              />
            )}
          </TabsContent>
        </div>
      </Tabs>

      {/* Form Dialogs */}
      <SMSConfigForm
        open={showSMSForm}
        onOpenChange={(open) => {
          setShowSMSForm(open)
          if (!open) setEditingIntegration(null)
        }}
        initialData={
          editingIntegration?.type === 'sms_gateway'
            ? {
                name: editingIntegration.name,
                provider: editingIntegration.provider as any,
                authKey: '',
                senderId: editingIntegration.credentials.senderId || '',
                defaultRoute: (editingIntegration.settings?.defaultRoute as any) || 'transactional',
                enableDND: (editingIntegration.settings?.enableDND as boolean) ?? true,
              }
            : undefined
        }
        onSubmit={handleCreateIntegration('sms_gateway')}
        isSubmitting={createIntegration.isPending}
      />

      <EmailConfigForm
        open={showEmailForm}
        onOpenChange={(open) => {
          setShowEmailForm(open)
          if (!open) setEditingIntegration(null)
        }}
        initialData={
          editingIntegration?.type === 'email_service'
            ? {
                name: editingIntegration.name,
                provider: editingIntegration.provider as any,
                apiKey: '',
                fromEmail: (editingIntegration.settings?.fromEmail as string) || '',
                fromName: (editingIntegration.settings?.fromName as string) || '',
                replyTo: (editingIntegration.settings?.replyTo as string) || '',
              }
            : undefined
        }
        onSubmit={handleCreateIntegration('email_service')}
        isSubmitting={createIntegration.isPending}
      />

      <PaymentGatewayConfigForm
        open={showPaymentForm}
        onOpenChange={(open) => {
          setShowPaymentForm(open)
          if (!open) setEditingIntegration(null)
        }}
        initialData={
          editingIntegration?.type === 'payment_gateway'
            ? {
                name: editingIntegration.name,
                provider: editingIntegration.provider as any,
                keyId: '',
                keySecret: '',
                currency: (editingIntegration.settings?.currency as string) || 'INR',
                autoCapture: (editingIntegration.settings?.autoCapture as boolean) ?? true,
                sendReceipt: (editingIntegration.settings?.sendReceipt as boolean) ?? true,
              }
            : undefined
        }
        onSubmit={handleCreateIntegration('payment_gateway')}
        isSubmitting={createIntegration.isPending}
      />

      <WhatsAppConfigForm
        open={showWhatsAppForm}
        onOpenChange={(open) => {
          setShowWhatsAppForm(open)
          if (!open) setEditingIntegration(null)
        }}
        initialData={
          editingIntegration?.type === 'whatsapp_api'
            ? {
                name: editingIntegration.name,
                provider: editingIntegration.provider as any,
                apiKey: '',
                whatsappNumber: editingIntegration.credentials.whatsappNumber || '',
                templateApprovalRequired:
                  (editingIntegration.settings?.templateApprovalRequired as boolean) ?? true,
              }
            : undefined
        }
        onSubmit={handleCreateIntegration('whatsapp_api')}
        isSubmitting={createIntegration.isPending}
      />

      <BiometricDeviceForm
        open={showDeviceForm}
        onOpenChange={(open) => {
          setShowDeviceForm(open)
          if (!open) setEditingDevice(null)
        }}
        initialData={editingDevice}
        onSubmit={async (data) => {
          if (editingDevice) {
            await updateDevice.mutateAsync({ id: editingDevice.id, data })
            toast({
              title: 'Device Updated',
              description: 'The biometric device has been updated.',
            })
          } else {
            await createDevice.mutateAsync(data)
            toast({
              title: 'Device Added',
              description: 'The biometric device has been configured.',
            })
          }
        }}
        isSubmitting={createDevice.isPending || updateDevice.isPending}
      />
    </div>
  )
}
