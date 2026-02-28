import { useState } from 'react'
import { Save, Loader2, Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useOnlinePaymentConfig,
  useUpdateOnlinePaymentConfig,
  useOnlinePaymentOrders,
} from '../hooks/useFinance'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  created: 'outline',
  processing: 'secondary',
  completed: 'default',
  failed: 'destructive',
}

export function OnlinePaymentManager() {
  const { toast } = useToast()
  const { data: configResult, isLoading: configLoading } = useOnlinePaymentConfig()
  const updateConfig = useUpdateOnlinePaymentConfig()

  const [statusFilter, setStatusFilter] = useState('all')
  const { data: ordersResult, isLoading: ordersLoading } = useOnlinePaymentOrders({
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })

  const config = configResult?.data
  const orders = ordersResult?.data || []

  const [gateway, setGateway] = useState<string>(config?.gateway || 'razorpay')
  const [isEnabled, setIsEnabled] = useState(config?.isEnabled ?? false)
  const [testMode, setTestMode] = useState(config?.testMode ?? true)
  const [merchantId, setMerchantId] = useState(config?.merchantId || '')

  // Sync from server
  useState(() => {
    if (config) {
      setGateway(config.gateway)
      setIsEnabled(config.isEnabled)
      setTestMode(config.testMode)
      setMerchantId(config.merchantId || '')
    }
  })

  const handleSaveConfig = () => {
    updateConfig.mutate(
      { gateway: gateway as 'razorpay' | 'paytm' | 'stripe' | 'none', isEnabled, testMode, merchantId },
      {
        onSuccess: () => toast({ title: 'Saved', description: 'Payment config updated.' }),
        onError: () => toast({ title: 'Error', description: 'Failed to update config', variant: 'destructive' }),
      }
    )
  }

  const completedAmount = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.amount, 0)
  const pendingAmount = orders.filter(o => o.status === 'created' || o.status === 'processing').reduce((s, o) => s + o.amount, 0)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: 'Copied', description: 'Link copied to clipboard.' })
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Online Payment Portal</h3>
        <p className="text-sm text-muted-foreground">Configure payment gateway and manage online payment orders</p>
      </div>

      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="orders">Payment Orders ({orders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          {configLoading ? (
            <Skeleton className="h-60 w-full" />
          ) : (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <Label>Payment Gateway</Label>
                  <Select value={gateway} onValueChange={setGateway}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                      <SelectItem value="paytm">Paytm</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="none">None (Disabled)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Online Payments</Label>
                    <p className="text-sm text-muted-foreground">Allow parents to pay fees online</p>
                  </div>
                  <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Test Mode</Label>
                    <p className="text-sm text-muted-foreground">Use test/sandbox credentials</p>
                  </div>
                  <Switch checked={testMode} onCheckedChange={setTestMode} />
                </div>
                <div>
                  <Label>Merchant ID</Label>
                  <Input value={merchantId} onChange={e => setMerchantId(e.target.value)} placeholder="Enter merchant ID" />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveConfig} disabled={updateConfig.isPending}>
                    {updateConfig.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Config
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{orders.length}</div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(completedAmount)}</div>
                <p className="text-sm text-muted-foreground">Completed Amount</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
                <p className="text-sm text-muted-foreground">Pending Amount</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {ordersLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : orders.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No payment orders found.</CardContent></Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Link</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.orderId.slice(0, 16)}</TableCell>
                    <TableCell className="font-medium">{order.studentName}</TableCell>
                    <TableCell className="text-right">{formatCurrency(order.amount)}</TableCell>
                    <TableCell><Badge variant="outline">{order.gateway}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[order.status] || 'secondary'}>{order.status}</Badge>
                    </TableCell>
                    <TableCell>
                      {order.paymentLink ? (
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(order.paymentLink!)}>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      ) : order.transactionId ? (
                        <span className="font-mono text-xs">{order.transactionId.slice(0, 12)}</span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
