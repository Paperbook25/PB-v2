import { useState, useEffect } from 'react'
import { Save, Loader2, Mail, MessageSquare, Phone, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  useEscalationConfig,
  useUpdateEscalationConfig,
  useReminderLogs,
} from '../hooks/useFinance'
import { REMINDER_CHANNEL_LABELS, type ReminderChannel } from '../types/finance.types'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

const CHANNEL_ICONS: Record<ReminderChannel, typeof Mail> = {
  sms: MessageSquare,
  email: Mail,
  whatsapp: Phone,
}

export function EscalationConfigManager() {
  const { toast } = useToast()
  const { data: configResult, isLoading: configLoading } = useEscalationConfig()
  const updateConfig = useUpdateEscalationConfig()

  const [channelFilter, setChannelFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const { data: logsResult, isLoading: logsLoading } = useReminderLogs({
    channel: channelFilter !== 'all' ? channelFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
  })

  const config = configResult?.data
  const [enabled, setEnabled] = useState(false)
  const [rules, setRules] = useState(config?.rules || [])

  useEffect(() => {
    if (config) {
      setEnabled(config.enabled)
      setRules(config.rules)
    }
  }, [config])

  const logs = logsResult?.data || []

  const handleSave = () => {
    updateConfig.mutate(
      { enabled, rules: rules.map(({ id, ...r }) => r) },
      {
        onSuccess: () => toast({ title: 'Saved', description: 'Escalation config updated.' }),
        onError: () => toast({ title: 'Error', description: 'Failed to update config', variant: 'destructive' }),
      }
    )
  }

  const toggleRuleActive = (index: number) => {
    setRules(prev => prev.map((r, i) => i === index ? { ...r, isActive: !r.isActive } : r))
  }

  if (configLoading) {
    return <div className="space-y-4">{[1, 2].map(i => <Skeleton key={i} className="h-40 w-full" />)}</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Auto-Reminder Escalation</h3>
        <p className="text-sm text-muted-foreground">Configure automatic payment reminder escalation and view logs</p>
      </div>

      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="logs">Reminder Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label className="text-base font-medium">Enable Auto-Reminders</Label>
                  <p className="text-sm text-muted-foreground">Automatically send reminders based on escalation rules</p>
                </div>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>

              <div className="space-y-3">
                {rules.map((rule, idx) => {
                  const Icon = CHANNEL_ICONS[rule.channel]
                  return (
                    <div key={rule.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary">{idx + 1}</span>
                          </div>
                          <div>
                            <span className="font-medium">{rule.name}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Badge variant="outline" className="text-xs">
                                <Icon className="h-3 w-3 mr-1" />
                                {REMINDER_CHANNEL_LABELS[rule.channel]}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">{rule.daysAfterDue} days after due</Badge>
                              <Badge variant="secondary" className="text-xs">To: {rule.recipient}</Badge>
                            </div>
                          </div>
                        </div>
                        <Switch checked={rule.isActive} onCheckedChange={() => toggleRuleActive(idx)} />
                      </div>
                      <p className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2">{rule.messageTemplate}</p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 flex justify-end">
                <Button onClick={handleSave} disabled={updateConfig.isPending}>
                  {updateConfig.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Channel" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {logsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : logs.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">No reminder logs found.</CardContent></Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Days Overdue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <span className="font-medium">{log.studentName}</span>
                      <span className="text-xs text-muted-foreground ml-1">{log.studentClass}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{REMINDER_CHANNEL_LABELS[log.channel]}</Badge>
                    </TableCell>
                    <TableCell>Level {log.escalationLevel}</TableCell>
                    <TableCell className="text-right">{formatCurrency(log.amount)}</TableCell>
                    <TableCell>{log.daysOverdue} days</TableCell>
                    <TableCell>
                      <Badge variant={log.status === 'delivered' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}>
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(log.sentAt).toLocaleDateString()}</TableCell>
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
