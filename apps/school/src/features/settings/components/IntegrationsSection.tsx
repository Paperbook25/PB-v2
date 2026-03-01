import { MessageSquare, Mail, CreditCard, MessageCircle, Fingerprint, Webhook, Key } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  useIntegrations,
  useBiometricDevices,
  useWebhooks,
  useAPIKeys,
} from '@/features/integrations/hooks/useIntegrations'
import type { IntegrationsTab } from '../types/settings.types'

interface IntegrationsSectionProps {
  activeTab: IntegrationsTab
  onTabChange: (tab: IntegrationsTab) => void
}

export function IntegrationsSection({ activeTab }: IntegrationsSectionProps) {
  return (
    <>
      {activeTab === 'sms' && <SMSTab />}
      {activeTab === 'email' && <EmailTab />}
      {activeTab === 'payment' && <PaymentTab />}
      {activeTab === 'whatsapp' && <WhatsAppTab />}
      {activeTab === 'biometric' && <BiometricTab />}
      {activeTab === 'webhooks' && <WebhooksTab />}
      {activeTab === 'api-keys' && <APIKeysTab />}
    </>
  )
}

// SMS Tab
function SMSTab() {
  const { data: integrationsData, isLoading } = useIntegrations()
  const integrations = integrationsData?.data || []
  const smsIntegrations = integrations.filter((i) => i.type === 'sms_gateway')

  return (
    <IntegrationsList
      title="SMS Gateway"
      description="Configure SMS providers to send text messages to parents and staff"
      icon={MessageSquare}
      integrations={smsIntegrations}
      isLoading={isLoading}
      emptyMessage="No SMS gateway configured. Add one to send SMS notifications."
    />
  )
}

// Email Tab
function EmailTab() {
  const { data: integrationsData, isLoading } = useIntegrations()
  const integrations = integrationsData?.data || []
  const emailIntegrations = integrations.filter((i) => i.type === 'email_service')

  return (
    <IntegrationsList
      title="Email Service"
      description="Configure email providers to send email notifications"
      icon={Mail}
      integrations={emailIntegrations}
      isLoading={isLoading}
      emptyMessage="No email service configured. Add one to send email notifications."
    />
  )
}

// Payment Tab
function PaymentTab() {
  const { data: integrationsData, isLoading } = useIntegrations()
  const integrations = integrationsData?.data || []
  const paymentIntegrations = integrations.filter((i) => i.type === 'payment_gateway')

  return (
    <IntegrationsList
      title="Payment Gateway"
      description="Configure payment providers to accept online fee payments"
      icon={CreditCard}
      integrations={paymentIntegrations}
      isLoading={isLoading}
      emptyMessage="No payment gateway configured. Add one to accept online payments."
    />
  )
}

// WhatsApp Tab
function WhatsAppTab() {
  const { data: integrationsData, isLoading } = useIntegrations()
  const integrations = integrationsData?.data || []
  const whatsappIntegrations = integrations.filter((i) => i.type === 'whatsapp_api')

  return (
    <IntegrationsList
      title="WhatsApp API"
      description="Configure WhatsApp Business API to send WhatsApp messages"
      icon={MessageCircle}
      integrations={whatsappIntegrations}
      isLoading={isLoading}
      emptyMessage="No WhatsApp API configured. Add one to send WhatsApp notifications."
    />
  )
}

// Biometric Tab
function BiometricTab() {
  const { data: devicesData, isLoading } = useBiometricDevices()
  const devices = devicesData?.data || []

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (devices.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Fingerprint className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No biometric devices</h3>
          <p className="text-muted-foreground mb-4">Add biometric devices to track attendance automatically</p>
          <Button>Add Device</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Biometric Devices</h3>
        <Button>Add Device</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {devices.map((device) => (
          <Card key={device.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{device.name}</CardTitle>
                <Badge variant={device.status === 'online' ? 'default' : 'secondary'}>
                  {device.status}
                </Badge>
              </div>
              <CardDescription>{device.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Type: {device.deviceType}</p>
                <p>IP: {device.deviceIp}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Webhooks Tab
function WebhooksTab() {
  const { data: webhooksData, isLoading } = useWebhooks()
  const webhooks = webhooksData?.data || []

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (webhooks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Webhook className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No webhooks configured</h3>
          <p className="text-muted-foreground mb-4">Add webhooks to send events to external services</p>
          <Button>Add Webhook</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Webhooks</h3>
        <Button>Add Webhook</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{webhook.name}</CardTitle>
                <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                  {webhook.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardDescription className="truncate">{webhook.url}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Events: {webhook.events.join(', ')}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// API Keys Tab
function APIKeysTab() {
  const { data: apiKeysData, isLoading } = useAPIKeys()
  const apiKeys = apiKeysData?.data || []

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    )
  }

  if (apiKeys.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Key className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No API keys</h3>
          <p className="text-muted-foreground mb-4">Create API keys for external integrations</p>
          <Button>Create API Key</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">API Keys</h3>
        <Button>Create API Key</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {apiKeys.map((apiKey) => (
          <Card key={apiKey.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{apiKey.name}</CardTitle>
                <Badge variant={apiKey.isActive ? 'default' : 'destructive'}>
                  {apiKey.isActive ? 'Active' : 'Revoked'}
                </Badge>
              </div>
              <CardDescription>
                {apiKey.keyPreview}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>Permissions: {apiKey.permissions.join(', ')}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Shared Integration List Component
interface IntegrationsListProps {
  title: string
  description: string
  icon: typeof MessageSquare
  integrations: any[]
  isLoading: boolean
  emptyMessage: string
}

function IntegrationsList({ title, description, icon: Icon, integrations, isLoading, emptyMessage }: IntegrationsListProps) {
  if (isLoading) {
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
      <Card>
        <CardContent className="py-12 text-center">
          <Icon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{title}</h3>
          <p className="text-muted-foreground mb-4">{emptyMessage}</p>
          <Button>Add Configuration</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button>Add Configuration</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{integration.name}</CardTitle>
                <Badge variant={integration.isActive ? 'default' : 'secondary'}>
                  {integration.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardDescription>{integration.provider}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">Configure</Button>
                <Button variant="outline" size="sm">Test</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
