import { useState } from 'react'
import { Search, Shield, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuditLogs } from '../hooks/useSettings'
import { AUDIT_ACTION_LABELS, AUDIT_MODULE_LABELS } from '../types/settings.types'
import type { AuditLogEntry, AuditAction, AuditModule } from '../types/settings.types'

export function AuditLogView() {
  const [moduleFilter, setModuleFilter] = useState<string>('')
  const [actionFilter, setActionFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)

  const { data: result, isLoading } = useAuditLogs({
    module: moduleFilter || undefined,
    action: actionFilter || undefined,
    search: search || undefined,
  })

  const logs = result?.data || []

  const actionVariant = (action: AuditAction): 'success' | 'destructive' | 'warning' | 'secondary' | 'outline' => {
    switch (action) {
      case 'create': return 'success'
      case 'delete': return 'destructive'
      case 'update': return 'warning'
      case 'login': return 'outline'
      case 'logout': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audit logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 sm:w-[250px]"
              />
            </div>
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="sm:w-[180px]">
                <SelectValue placeholder="All modules" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modules</SelectItem>
                {Object.entries(AUDIT_MODULE_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="sm:w-[180px]">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {Object.entries(AUDIT_ACTION_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading audit logs...</div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(log.timestamp).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{log.userName}</p>
                          <p className="text-xs text-muted-foreground capitalize">{log.userRole}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={actionVariant(log.action)}>
                          {AUDIT_ACTION_LABELS[log.action]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {AUDIT_MODULE_LABELS[log.module]}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-sm">{log.description}</TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{log.ipAddress}</TableCell>
                      <TableCell>
                        {log.changes && log.changes.length > 0 && (
                          <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)}>
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {logs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">No audit logs found</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">User</p>
                  <p className="font-medium">{selectedLog.userName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium">{new Date(selectedLog.timestamp).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Description</p>
                <p>{selectedLog.description}</p>
              </div>
              {selectedLog.changes && selectedLog.changes.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Changes</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Field</TableHead>
                        <TableHead>Old Value</TableHead>
                        <TableHead>New Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedLog.changes.map((change, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{change.field}</TableCell>
                          <TableCell className="text-destructive">{change.oldValue}</TableCell>
                          <TableCell className="text-green-600">{change.newValue}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
