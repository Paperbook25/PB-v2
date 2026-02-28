import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Copy, Key, Trash2, Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDate } from '@/lib/utils'
import type { APIKey, CreateAPIKeyRequest } from '../types/integrations.types'
import { API_PERMISSIONS } from '../types/integrations.types'

const apiKeySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
  expiresAt: z.string().optional(),
})

type APIKeyFormData = z.infer<typeof apiKeySchema>

interface APIKeyManagerProps {
  apiKeys: APIKey[]
  onCreate: (data: CreateAPIKeyRequest) => Promise<{ data: APIKey }>
  onRevoke: (id: string) => Promise<void>
  isCreating?: boolean
}

export function APIKeyManager({ apiKeys, onCreate, onRevoke, isCreating }: APIKeyManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [revokeId, setRevokeId] = useState<string | null>(null)
  const [newKey, setNewKey] = useState<APIKey | null>(null)
  const [showNewKey, setShowNewKey] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const form = useForm<APIKeyFormData>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      name: '',
      permissions: [],
      expiresAt: '',
    },
  })

  const handleSubmit = form.handleSubmit(async (data) => {
    const result = await onCreate({
      name: data.name,
      permissions: data.permissions,
      expiresAt: data.expiresAt || undefined,
    })
    setNewKey(result.data)
    setShowNewKey(true)
    setShowForm(false)
    form.reset()
  })

  const copyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const keyToRevoke = apiKeys.find((k) => k.id === revokeId)

  // Group permissions by category
  const permissionCategories = [
    { label: 'Students', permissions: API_PERMISSIONS.filter((p) => p.startsWith('students:')) },
    { label: 'Staff', permissions: API_PERMISSIONS.filter((p) => p.startsWith('staff:')) },
    { label: 'Attendance', permissions: API_PERMISSIONS.filter((p) => p.startsWith('attendance:')) },
    { label: 'Finance', permissions: API_PERMISSIONS.filter((p) => p.startsWith('finance:')) },
    { label: 'Exams', permissions: API_PERMISSIONS.filter((p) => p.startsWith('exams:')) },
    { label: 'Admissions', permissions: API_PERMISSIONS.filter((p) => p.startsWith('admissions:')) },
  ]

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">API Keys</h3>
            <p className="text-sm text-muted-foreground">
              Manage API keys for programmatic access
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Key
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No API keys generated. Click "Generate Key" to create your first API key.
                    </TableCell>
                  </TableRow>
                ) : (
                  apiKeys.map((apiKey) => (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">{apiKey.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {apiKey.keyPreview}
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyKey(apiKey.key, apiKey.id)}
                            disabled={!apiKey.isActive}
                          >
                            {copiedId === apiKey.id ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {apiKey.permissions.slice(0, 2).map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                          {apiKey.permissions.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{apiKey.permissions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={apiKey.isActive ? 'success' : 'secondary'}>
                          {apiKey.isActive ? 'Active' : 'Revoked'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {apiKey.lastUsedAt ? (
                          <span className="text-sm">{formatDate(apiKey.lastUsedAt)}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setRevokeId(apiKey.id)}
                          disabled={!apiKey.isActive}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Generate API Key</DialogTitle>
            <DialogDescription>
              Create a new API key for programmatic access to PaperBook.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mobile App Production" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name to identify this API key
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiresAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      Leave empty for a non-expiring key
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permissions</FormLabel>
                    <FormDescription>
                      Select the API endpoints this key can access
                    </FormDescription>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {permissionCategories.map((category) => (
                        <div key={category.label} className="space-y-2">
                          <p className="text-sm font-medium">{category.label}</p>
                          {category.permissions.map((perm) => (
                            <div key={perm} className="flex items-center space-x-2">
                              <Checkbox
                                id={perm}
                                checked={field.value.includes(perm)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...field.value, perm])
                                  } else {
                                    field.onChange(field.value.filter((p) => p !== perm))
                                  }
                                }}
                              />
                              <label
                                htmlFor={perm}
                                className="text-sm text-muted-foreground cursor-pointer"
                              >
                                {perm.split(':')[1]}
                              </label>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4 mr-2" />
                      Generate Key
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* New Key Display Dialog */}
      <Dialog open={showNewKey} onOpenChange={setShowNewKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Generated</DialogTitle>
            <DialogDescription>
              Copy your API key now. For security reasons, it won&apos;t be shown again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-sm break-all">{newKey?.key}</code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => newKey && copyKey(newKey.key, 'new')}
                >
                  {copiedId === 'new' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-800 border border-amber-200 dark:border-amber-700 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-100">
                Make sure to copy this key now. You won&apos;t be able to see it again!
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setShowNewKey(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Dialog */}
      <AlertDialog open={!!revokeId} onOpenChange={() => setRevokeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API Key</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to revoke &quot;{keyToRevoke?.name}&quot;? Any applications using this key will no longer be able to access the API.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (revokeId) {
                  onRevoke(revokeId)
                  setRevokeId(null)
                }
              }}
            >
              Revoke Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
