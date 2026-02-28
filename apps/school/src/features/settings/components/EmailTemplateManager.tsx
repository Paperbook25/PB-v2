import { useState } from 'react'
import { Plus, Edit2, Trash2, Mail, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  useEmailTemplates,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
} from '../hooks/useSettings'
import { TEMPLATE_CATEGORY_LABELS } from '../types/settings.types'
import type { TemplateCategory, EmailTemplate } from '../types/settings.types'

export function EmailTemplateManager() {
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<EmailTemplate | null>(null)
  const [previewing, setPreviewing] = useState<EmailTemplate | null>(null)
  const { toast } = useToast()

  const { data: result, isLoading } = useEmailTemplates({
    category: categoryFilter || undefined,
  })
  const createMutation = useCreateEmailTemplate()
  const updateMutation = useUpdateEmailTemplate()
  const deleteMutation = useDeleteEmailTemplate()

  const templates = result?.data || []

  const [form, setForm] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'general' as TemplateCategory,
  })

  const handleCreate = () => {
    createMutation.mutate(form, {
      onSuccess: () => {
        toast({ title: 'Template created' })
        setShowCreate(false)
        setForm({ name: '', subject: '', body: '', category: 'general' })
      },
    })
  }

  const handleEdit = (template: EmailTemplate) => {
    setEditing(template)
    setForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: template.category,
    })
  }

  const handleUpdate = () => {
    if (!editing) return
    updateMutation.mutate(
      { id: editing.id, data: form },
      {
        onSuccess: () => {
          toast({ title: 'Template updated' })
          setEditing(null)
        },
      }
    )
  }

  const handleToggleActive = (template: EmailTemplate) => {
    updateMutation.mutate(
      { id: template.id, data: { isActive: !template.isActive } },
      { onSuccess: () => toast({ title: template.isActive ? 'Template deactivated' : 'Template activated' }) }
    )
  }

  const categoryVariant = (category: TemplateCategory): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (category) {
      case 'fee': return 'default'
      case 'attendance': return 'secondary'
      case 'exam': return 'default'
      default: return 'outline'
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground">Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:w-[200px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {Object.entries(TEMPLATE_CATEGORY_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => { setForm({ name: '', subject: '', body: '', category: 'general' }); setShowCreate(true) }} className="sm:ml-auto">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Template Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {template.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={template.isActive}
                    onCheckedChange={() => handleToggleActive(template)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Subject</p>
                  <p className="text-sm font-mono">{template.subject}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={categoryVariant(template.category)}>
                    {TEMPLATE_CATEGORY_LABELS[template.category]}
                  </Badge>
                  <Badge variant={template.isActive ? 'success' : 'secondary'}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.variables.slice(0, 5).map((v) => (
                      <Badge key={v} variant="outline" className="text-[10px] font-mono">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                    {template.variables.length > 5 && (
                      <span className="text-xs text-muted-foreground">+{template.variables.length - 5} more</span>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Last modified: {new Date(template.lastModified).toLocaleDateString('en-IN')}
                </p>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPreviewing(template)}>
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(template)}>
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(template.id, { onSuccess: () => toast({ title: 'Template deleted' }) })}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No templates found</div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewing} onOpenChange={() => setPreviewing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
          </DialogHeader>
          {previewing && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Subject:</p>
                <p className="font-medium">{previewing.subject}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Body:</p>
                <pre className="whitespace-pre-wrap text-sm font-sans">{previewing.body}</pre>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Available Variables:</p>
                <div className="flex flex-wrap gap-1">
                  {previewing.variables.map((v) => (
                    <Badge key={v} variant="outline" className="text-xs font-mono">{`{{${v}}}`}</Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreate || !!editing} onOpenChange={() => { setShowCreate(false); setEditing(null) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Template' : 'Create New Template'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Template Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Fee Reminder" />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as TemplateCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TEMPLATE_CATEGORY_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Subject Line</Label>
              <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder='e.g. Fee Payment Reminder - {{school_name}}' />
              <p className="text-xs text-muted-foreground mt-1">Use {'{{variable_name}}'} for dynamic values</p>
            </div>
            <div>
              <Label>Email Body</Label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className="min-h-[200px] font-mono text-sm"
                placeholder={'Dear {{parent_name}},\n\nYour message here...\n\nRegards,\n{{school_name}}'}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); setEditing(null) }}>Cancel</Button>
            <Button
              onClick={editing ? handleUpdate : handleCreate}
              disabled={!form.name || !form.subject || !form.body || createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
