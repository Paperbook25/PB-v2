import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../../lib/api'
import { format } from 'date-fns'
import {
  Globe, DollarSign, FileText, Users, Search, Plus, Trash2, Edit2,
  X, Check, AlertCircle, ExternalLink, Sparkles, Link2, TrendingUp,
} from 'lucide-react'

// ─── helpers ────────────────────────────────────────────────────────────────
function toSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

const TABS = [
  { key: 'pricing', label: 'Pricing', icon: DollarSign },
  { key: 'blog', label: 'Blog', icon: FileText },
  { key: 'contact', label: 'Contact & Social', icon: Globe },
  { key: 'about', label: 'About & Team', icon: Users },
  { key: 'seo', label: 'SEO', icon: Search },
] as const

type TabKey = (typeof TABS)[number]['key']

const BLOG_CATEGORIES = ['general', 'technology', 'finance', 'academics', 'operations', 'communication', 'industry', 'admissions'] as const
const BLOG_STATUSES = ['draft', 'published', 'archived'] as const

const statusColors: Record<string, string> = {
  draft: 'bg-yellow-100 text-yellow-700',
  published: 'bg-green-100 text-green-700',
  archived: 'bg-gray-100 text-gray-600',
}

// ─── Component ──────────────────────────────────────────────────────────────
export function WebsiteManagementPage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<TabKey>('pricing')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Website Management</h1>
        <p className="text-sm text-muted-foreground">Manage marketing website content, SEO, and blog posts</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pricing' && <PricingTab qc={qc} />}
      {tab === 'blog' && <BlogTab qc={qc} />}
      {tab === 'contact' && <ContactTab qc={qc} />}
      {tab === 'about' && <AboutTab qc={qc} />}
      {tab === 'seo' && <SeoTab qc={qc} />}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 1 — Pricing
// ═════════════════════════════════════════════════════════════════════════════
function PricingTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const [dialog, setDialog] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(emptyPricingForm())
  const [slugEdited, setSlugEdited] = useState(false)
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])

  const plansQ = useQuery({ queryKey: ['website', 'plans'], queryFn: () => adminApi.getWebsitePricing() })
  const featuresQ = useQuery({ queryKey: ['website', 'available-features'], queryFn: () => adminApi.getAvailableFeatures() })

  const saveMut = useMutation({
    mutationFn: (data: any) => editing ? adminApi.updatePricingPlan(editing.id, data) : adminApi.createPricingPlan(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['website', 'plans'] }); closeDialog() },
  })
  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.deletePricingPlan(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website', 'plans'] }),
  })

  function emptyPricingForm() {
    return { name: '', slug: '', description: '', monthlyPrice: '', yearlyPrice: '', isCustom: false, maxStudents: '', badge: '', ctaText: 'Get Started', ctaLink: '/signup' }
  }
  function openCreate() { setEditing(null); setForm(emptyPricingForm()); setSelectedFeatures([]); setSlugEdited(false); setDialog(true) }
  function openEdit(p: any) {
    setEditing(p); setSlugEdited(true); setSelectedFeatures(p.features || [])
    setForm({ name: p.name, slug: p.slug, description: p.description || '', monthlyPrice: String(p.monthlyPrice ?? ''), yearlyPrice: String(p.yearlyPrice ?? ''), isCustom: p.isCustom || false, maxStudents: String(p.maxStudents ?? ''), badge: p.badge || '', ctaText: p.ctaText || 'Get Started', ctaLink: p.ctaLink || '/signup' })
    setDialog(true)
  }
  function closeDialog() { setDialog(false); setEditing(null) }
  function handleSave() {
    saveMut.mutate({ ...form, monthlyPrice: form.monthlyPrice ? Number(form.monthlyPrice) : null, yearlyPrice: form.yearlyPrice ? Number(form.yearlyPrice) : null, maxStudents: form.maxStudents ? Number(form.maxStudents) : null, features: selectedFeatures })
  }

  const plans: any[] = plansQ.data?.data || plansQ.data || []
  const featureGroups: Record<string, any[]> = {}
  const allFeatures: any[] = featuresQ.data?.data || featuresQ.data || []
  allFeatures.forEach((f: any) => { const cat = f.category || 'General'; if (!featureGroups[cat]) featureGroups[cat] = []; featureGroups[cat].push(f) })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Pricing Plans</h2>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Create Plan
        </button>
      </div>

      {plansQ.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((p: any) => (
          <div key={p.id} className="rounded-lg border bg-card p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{p.name}</h3>
                {p.badge && <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{p.badge}</span>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(p)} className="rounded p-1 hover:bg-muted"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                <button onClick={() => deleteMut.mutate(p.id)} className="rounded p-1 hover:bg-muted"><Trash2 className="h-4 w-4 text-red-500" /></button>
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground">
              {p.isCustom ? 'Custom' : `₹${p.monthlyPrice ?? 0}`}<span className="text-sm font-normal text-muted-foreground">/mo</span>
            </div>
            <p className="text-xs text-muted-foreground">Max students: {p.maxStudents || 'Unlimited'}</p>
            {p.features?.length > 0 && (
              <ul className="space-y-1 text-xs text-muted-foreground">
                {p.features.slice(0, 5).map((f: string) => <li key={f} className="flex items-center gap-1"><Check className="h-3 w-3 text-green-500" />{f}</li>)}
                {p.features.length > 5 && <li className="text-muted-foreground">+{p.features.length - 5} more</li>}
              </ul>
            )}
            <p className="text-xs text-muted-foreground">{p.ctaText || 'Get Started'}</p>
          </div>
        ))}
      </div>

      {/* Dialog */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeDialog}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit Plan' : 'Create Plan'}</h3>
              <button onClick={closeDialog} className="rounded p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v, slug: slugEdited ? f.slug : toSlug(v) }))} />
              <Field label="Slug" value={form.slug} onChange={(v) => { setSlugEdited(true); setForm((f) => ({ ...f, slug: v })) }} />
              <div className="sm:col-span-2"><Field label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} textarea /></div>
              <Field label="Monthly Price (₹)" value={form.monthlyPrice} onChange={(v) => setForm((f) => ({ ...f, monthlyPrice: v }))} type="number" />
              <Field label="Yearly Price (₹)" value={form.yearlyPrice} onChange={(v) => setForm((f) => ({ ...f, yearlyPrice: v }))} type="number" />
              <Field label="Max Students" value={form.maxStudents} onChange={(v) => setForm((f) => ({ ...f, maxStudents: v }))} type="number" placeholder="Empty = unlimited" />
              <Field label="Badge" value={form.badge} onChange={(v) => setForm((f) => ({ ...f, badge: v }))} placeholder="e.g. Most Popular" />
              <Field label="CTA Text" value={form.ctaText} onChange={(v) => setForm((f) => ({ ...f, ctaText: v }))} />
              <Field label="CTA Link" value={form.ctaLink} onChange={(v) => setForm((f) => ({ ...f, ctaLink: v }))} />
              <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
                <input type="checkbox" checked={form.isCustom} onChange={(e) => setForm((f) => ({ ...f, isCustom: e.target.checked }))} className="rounded" /> Custom pricing (hide price)
              </label>
            </div>

            {/* Feature picker */}
            <div className="mt-4 space-y-3">
              <h4 className="text-sm font-medium text-foreground">Features</h4>
              {Object.entries(featureGroups).map(([cat, feats]) => (
                <div key={cat}>
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{cat}</p>
                  <div className="flex flex-wrap gap-2">
                    {feats.map((f: any) => {
                      const key = f.slug || f.name
                      const sel = selectedFeatures.includes(key)
                      return (
                        <button key={key} onClick={() => setSelectedFeatures((prev) => sel ? prev.filter((x) => x !== key) : [...prev, key])}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${sel ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                        >{f.name}</button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={closeDialog} className="rounded-lg border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={handleSave} disabled={saveMut.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {saveMut.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 2 — Blog
// ═════════════════════════════════════════════════════════════════════════════
function BlogTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const [dialog, setDialog] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(emptyBlogForm())
  const [slugEdited, setSlugEdited] = useState(false)
  const [ideas, setIdeas] = useState<any[]>([])
  const [showIdeas, setShowIdeas] = useState(false)

  const postsQ = useQuery({ queryKey: ['website', 'blog'], queryFn: () => adminApi.listBlogPosts() })

  const saveMut = useMutation({
    mutationFn: (data: any) => editing ? adminApi.updateBlogPost(editing.id, data) : adminApi.createBlogPost(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['website', 'blog'] }); closeDialog() },
  })
  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteBlogPost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website', 'blog'] }),
  })
  const extractMut = useMutation({
    mutationFn: () => adminApi.extractKeywords(form.title, form.content),
    onSuccess: (data: any) => { const kw = data?.keywords || data?.data?.keywords || []; setForm((f) => ({ ...f, keywords: kw.join(', ') })) },
  })
  const ideasMut = useMutation({
    mutationFn: () => adminApi.getBlogIdeas(),
    onSuccess: (data: any) => { setIdeas(data?.ideas || data?.data || data || []); setShowIdeas(true) },
  })

  function emptyBlogForm() {
    return { title: '', slug: '', excerpt: '', content: '', category: 'general', tags: '', status: 'draft' as string, keywords: '', metaTitle: '', metaDescription: '', coverImageUrl: '' }
  }
  function openCreate() { setEditing(null); setForm(emptyBlogForm()); setSlugEdited(false); setDialog(true) }
  function openEdit(p: any) {
    setEditing(p); setSlugEdited(true)
    setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt || '', content: p.content || '', category: p.category || 'general', tags: (p.tags || []).join(', '), status: p.status || 'draft', keywords: (p.keywords || []).join(', '), metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '', coverImageUrl: p.coverImageUrl || '' })
    setDialog(true)
  }
  function closeDialog() { setDialog(false); setEditing(null); setShowIdeas(false) }
  function handleSave() {
    const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean), keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean) }
    saveMut.mutate(payload)
  }
  function pickIdea(idea: any) {
    setForm((f) => ({ ...f, title: idea.title || idea, slug: toSlug(idea.title || idea), keywords: (idea.keywords || []).join(', ') }))
    setShowIdeas(false)
  }

  const posts: any[] = postsQ.data?.data || postsQ.data || []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Blog Posts</h2>
        <div className="flex gap-2">
          <button onClick={() => ideasMut.mutate()} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
            <Sparkles className="h-4 w-4" /> {ideasMut.isPending ? 'Loading...' : 'Blog Ideas'}
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> New Post
          </button>
        </div>
      </div>

      {/* Ideas dropdown */}
      {showIdeas && ideas.length > 0 && (
        <div className="rounded-lg border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">AI-Suggested Topics</h4>
            <button onClick={() => setShowIdeas(false)} className="rounded p-1 hover:bg-muted"><X className="h-4 w-4" /></button>
          </div>
          {ideas.map((idea, i) => (
            <button key={i} onClick={() => { pickIdea(idea); openCreate() }}
              className="block w-full rounded-md border p-2 text-left text-sm text-foreground hover:bg-muted"
            >{typeof idea === 'string' ? idea : idea.title}</button>
          ))}
        </div>
      )}

      {postsQ.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

      <div className="overflow-x-auto rounded-lg border bg-card">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase text-muted-foreground">
            <th className="px-4 py-3">Title</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Views</th><th className="px-4 py-3">Published</th><th className="px-4 py-3 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {posts.map((p: any) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium text-foreground">{p.title}</td>
                <td className="px-4 py-3"><span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground capitalize">{p.category}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.views ?? 0}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.publishedAt ? format(new Date(p.publishedAt), 'MMM d, yyyy') : '—'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(p)} className="rounded p-1 hover:bg-muted"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                    <button onClick={() => deleteMut.mutate(p.id)} className="rounded p-1 hover:bg-muted"><Trash2 className="h-4 w-4 text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.length === 0 && !postsQ.isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No blog posts yet</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Blog Dialog */}
      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeDialog}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit Post' : 'New Post'}</h3>
              <button onClick={closeDialog} className="rounded p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v, slug: slugEdited ? f.slug : toSlug(v) }))} />
              <Field label="Slug" value={form.slug} onChange={(v) => { setSlugEdited(true); setForm((f) => ({ ...f, slug: v })) }} />
              <div className="sm:col-span-2"><Field label="Excerpt" value={form.excerpt} onChange={(v) => setForm((f) => ({ ...f, excerpt: v }))} textarea /></div>
              <div className="sm:col-span-2"><Field label="Content" value={form.content} onChange={(v) => setForm((f) => ({ ...f, content: v }))} textarea rows={8} /></div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground">
                  {BLOG_CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground">
                  {BLOG_STATUSES.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <Field label="Tags (comma-separated)" value={form.tags} onChange={(v) => setForm((f) => ({ ...f, tags: v }))} />
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Keywords</label>
                  <button onClick={() => extractMut.mutate()} disabled={extractMut.isPending} className="flex items-center gap-1 text-xs text-primary hover:underline">
                    <Sparkles className="h-3 w-3" /> {extractMut.isPending ? 'Extracting...' : 'Extract Keywords'}
                  </button>
                </div>
                <input value={form.keywords} onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value }))} className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground" />
              </div>
              <Field label="Meta Title" value={form.metaTitle} onChange={(v) => setForm((f) => ({ ...f, metaTitle: v }))} />
              <Field label="Meta Description" value={form.metaDescription} onChange={(v) => setForm((f) => ({ ...f, metaDescription: v }))} />
              <div className="sm:col-span-2"><Field label="Cover Image URL" value={form.coverImageUrl} onChange={(v) => setForm((f) => ({ ...f, coverImageUrl: v }))} /></div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={closeDialog} className="rounded-lg border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={handleSave} disabled={saveMut.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {saveMut.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 3 — Contact & Social
// ═════════════════════════════════════════════════════════════════════════════
function ContactTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const [form, setForm] = useState({
    contactEmail: '', supportEmail: '', phone: '', address: '', businessHours: '',
    facebookUrl: '', linkedinUrl: '', instagramUrl: '', twitterUrl: '', youtubeUrl: '',
  })
  const [loaded, setLoaded] = useState(false)

  const configQ = useQuery({
    queryKey: ['website', 'config'],
    queryFn: () => adminApi.getWebsiteConfig(),
  })

  if (configQ.data && !loaded) {
    const d = configQ.data?.data || configQ.data || {}
    setForm({
      contactEmail: d.contactEmail || '', supportEmail: d.supportEmail || '', phone: d.phone || '',
      address: d.address || '', businessHours: d.businessHours || '',
      facebookUrl: d.facebookUrl || '', linkedinUrl: d.linkedinUrl || '', instagramUrl: d.instagramUrl || '',
      twitterUrl: d.twitterUrl || '', youtubeUrl: d.youtubeUrl || '',
    })
    setLoaded(true)
  }

  const saveMut = useMutation({
    mutationFn: (data: any) => adminApi.updateWebsiteConfig(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website', 'config'] }),
  })

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }))

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Contact Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact Email" value={form.contactEmail} onChange={set('contactEmail')} />
          <Field label="Support Email" value={form.supportEmail} onChange={set('supportEmail')} />
          <Field label="Phone" value={form.phone} onChange={set('phone')} />
          <Field label="Business Hours" value={form.businessHours} onChange={set('businessHours')} placeholder="e.g. Mon-Fri 9am-6pm" />
          <div className="sm:col-span-2"><Field label="Address" value={form.address} onChange={set('address')} textarea /></div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Social Links</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Facebook URL" value={form.facebookUrl} onChange={set('facebookUrl')} />
          <Field label="LinkedIn URL" value={form.linkedinUrl} onChange={set('linkedinUrl')} />
          <Field label="Instagram URL" value={form.instagramUrl} onChange={set('instagramUrl')} />
          <Field label="Twitter URL" value={form.twitterUrl} onChange={set('twitterUrl')} />
          <Field label="YouTube URL" value={form.youtubeUrl} onChange={set('youtubeUrl')} />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => saveMut.mutate(form)} disabled={saveMut.isPending} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {saveMut.isPending ? 'Saving...' : saveMut.isSuccess ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 4 — About & Team
// ═════════════════════════════════════════════════════════════════════════════
function AboutTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const [about, setAbout] = useState({ title: '', description: '', mission: '', vision: '' })
  const [aboutLoaded, setAboutLoaded] = useState(false)
  const [memberDialog, setMemberDialog] = useState(false)
  const [editingMember, setEditingMember] = useState<any>(null)
  const [memberForm, setMemberForm] = useState(emptyMemberForm())

  const aboutQ = useQuery({ queryKey: ['website', 'about'], queryFn: () => adminApi.getWebsiteAbout() })
  const teamQ = useQuery({ queryKey: ['website', 'team'], queryFn: () => adminApi.getTeamMembers() })

  if (aboutQ.data && !aboutLoaded) {
    const d = aboutQ.data?.data || aboutQ.data || {}
    setAbout({ title: d.title || '', description: d.description || '', mission: d.mission || '', vision: d.vision || '' })
    setAboutLoaded(true)
  }

  const saveAboutMut = useMutation({
    mutationFn: (data: any) => adminApi.updateWebsiteAbout(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website', 'about'] }),
  })
  const saveMemberMut = useMutation({
    mutationFn: (data: any) => editingMember ? adminApi.updateTeamMember(editingMember.id, data) : adminApi.createTeamMember(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['website', 'team'] }); closeMemberDialog() },
  })
  const deleteMemberMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteTeamMember(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website', 'team'] }),
  })

  function emptyMemberForm() { return { name: '', role: '', bio: '', photoUrl: '', linkedinUrl: '', twitterUrl: '', email: '' } }
  function openAddMember() { setEditingMember(null); setMemberForm(emptyMemberForm()); setMemberDialog(true) }
  function openEditMember(m: any) {
    setEditingMember(m)
    setMemberForm({ name: m.name || '', role: m.role || '', bio: m.bio || '', photoUrl: m.photoUrl || '', linkedinUrl: m.linkedinUrl || '', twitterUrl: m.twitterUrl || '', email: m.email || '' })
    setMemberDialog(true)
  }
  function closeMemberDialog() { setMemberDialog(false); setEditingMember(null) }

  const members: any[] = teamQ.data?.data || teamQ.data || []

  return (
    <div className="space-y-6">
      {/* About section */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="text-base font-semibold text-foreground">About Section</h3>
        <div className="grid gap-4">
          <Field label="Title" value={about.title} onChange={(v) => setAbout((a) => ({ ...a, title: v }))} />
          <Field label="Description" value={about.description} onChange={(v) => setAbout((a) => ({ ...a, description: v }))} textarea rows={4} />
          <Field label="Mission" value={about.mission} onChange={(v) => setAbout((a) => ({ ...a, mission: v }))} textarea />
          <Field label="Vision" value={about.vision} onChange={(v) => setAbout((a) => ({ ...a, vision: v }))} textarea />
        </div>
        <div className="flex justify-end">
          <button onClick={() => saveAboutMut.mutate(about)} disabled={saveAboutMut.isPending} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saveAboutMut.isPending ? 'Saving...' : 'Save About'}
          </button>
        </div>
      </div>

      {/* Team members */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Team Members</h3>
          <button onClick={openAddMember} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add Member
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m: any) => (
            <div key={m.id} className="rounded-lg border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {m.photoUrl ? <img src={m.photoUrl} alt={m.name} className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{m.name?.[0]}</div>}
                  <div>
                    <p className="font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.role}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEditMember(m)} className="rounded p-1 hover:bg-muted"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                  <button onClick={() => deleteMemberMut.mutate(m.id)} className="rounded p-1 hover:bg-muted"><Trash2 className="h-4 w-4 text-red-500" /></button>
                </div>
              </div>
              {m.linkedinUrl && <a href={m.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><ExternalLink className="h-3 w-3" />LinkedIn</a>}
            </div>
          ))}
        </div>
      </div>

      {/* Member dialog */}
      {memberDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeMemberDialog}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{editingMember ? 'Edit Member' : 'Add Member'}</h3>
              <button onClick={closeMemberDialog} className="rounded p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-4">
              <Field label="Name" value={memberForm.name} onChange={(v) => setMemberForm((f) => ({ ...f, name: v }))} />
              <Field label="Role" value={memberForm.role} onChange={(v) => setMemberForm((f) => ({ ...f, role: v }))} />
              <Field label="Bio" value={memberForm.bio} onChange={(v) => setMemberForm((f) => ({ ...f, bio: v }))} textarea />
              <Field label="Photo URL" value={memberForm.photoUrl} onChange={(v) => setMemberForm((f) => ({ ...f, photoUrl: v }))} />
              <Field label="LinkedIn URL" value={memberForm.linkedinUrl} onChange={(v) => setMemberForm((f) => ({ ...f, linkedinUrl: v }))} />
              <Field label="Twitter URL" value={memberForm.twitterUrl} onChange={(v) => setMemberForm((f) => ({ ...f, twitterUrl: v }))} />
              <Field label="Email" value={memberForm.email} onChange={(v) => setMemberForm((f) => ({ ...f, email: v }))} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={closeMemberDialog} className="rounded-lg border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={() => saveMemberMut.mutate(memberForm)} disabled={saveMemberMut.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {saveMemberMut.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 5 — SEO
// ═════════════════════════════════════════════════════════════════════════════
function SeoTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const [seoForm, setSeoForm] = useState({ homeTitle: '', homeDescription: '', ogImageUrl: '', globalKeywords: '' })
  const [seoLoaded, setSeoLoaded] = useState(false)
  const [kwDialog, setKwDialog] = useState(false)
  const [kwForm, setKwForm] = useState({ keyword: '', volume: '', difficulty: '', linkedPage: '' })
  const [linkResults, setLinkResults] = useState<any[] | null>(null)

  const seoQ = useQuery({ queryKey: ['website', 'seo'], queryFn: () => adminApi.getWebsiteSeoSettings() })
  const scoreQ = useQuery({ queryKey: ['website', 'seo-score'], queryFn: () => adminApi.analyzeSeo() })
  const keywordsQ = useQuery({ queryKey: ['website', 'keywords'], queryFn: () => adminApi.getSeoKeywords() })

  if (seoQ.data && !seoLoaded) {
    const d = seoQ.data?.data || seoQ.data || {}
    setSeoForm({ homeTitle: d.homeTitle || '', homeDescription: d.homeDescription || '', ogImageUrl: d.ogImageUrl || '', globalKeywords: d.globalKeywords || '' })
    setSeoLoaded(true)
  }

  const saveSeoMut = useMutation({
    mutationFn: (data: any) => adminApi.updateWebsiteSeoSettings(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website', 'seo'] }),
  })
  const addKwMut = useMutation({
    mutationFn: (data: any) => adminApi.createSeoKeyword(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['website', 'keywords'] }); setKwDialog(false); setKwForm({ keyword: '', volume: '', difficulty: '', linkedPage: '' }) },
  })
  const deleteKwMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteSeoKeyword(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website', 'keywords'] }),
  })
  const linksMut = useMutation({
    mutationFn: () => adminApi.buildInternalLinks(),
    onSuccess: (data: any) => setLinkResults(data?.links || data?.data || data || []),
  })

  const score = scoreQ.data?.data || scoreQ.data || {}
  const seoScore = score.score ?? null
  const issues: any[] = score.issues || []
  const keywords: any[] = keywordsQ.data?.data || keywordsQ.data || []
  const scoreColor = seoScore === null ? 'text-muted-foreground' : seoScore > 70 ? 'text-green-600' : seoScore > 40 ? 'text-yellow-600' : 'text-red-600'
  const scoreBg = seoScore === null ? 'bg-muted' : seoScore > 70 ? 'bg-green-50' : seoScore > 40 ? 'bg-yellow-50' : 'bg-red-50'

  return (
    <div className="space-y-6">
      {/* SEO Score */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`rounded-lg border p-6 ${scoreBg}`}>
          <h3 className="text-sm font-medium text-muted-foreground">SEO Score</h3>
          <p className={`mt-2 text-4xl font-bold ${scoreColor}`}>{seoScore ?? '—'}<span className="text-lg font-normal text-muted-foreground">/100</span></p>
          {scoreQ.isLoading && <p className="mt-1 text-xs text-muted-foreground">Analyzing...</p>}
        </div>
        <div className="rounded-lg border bg-card p-6">
          <h3 className="mb-3 text-sm font-medium text-foreground">Issues ({issues.length})</h3>
          {issues.length === 0 && <p className="text-sm text-muted-foreground">No issues found</p>}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {issues.map((issue: any, i: number) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className={`mt-0.5 inline-block h-2 w-2 rounded-full flex-shrink-0 ${issue.severity === 'critical' ? 'bg-red-500' : issue.severity === 'high' ? 'bg-orange-500' : issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                <div>
                  <p className="text-foreground">{issue.message || issue.title}</p>
                  {issue.fix && <p className="text-xs text-muted-foreground">{issue.fix}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Tracked Keywords</h3>
          <button onClick={() => setKwDialog(true)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add Keyword
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase text-muted-foreground">
              <th className="px-4 py-3">Keyword</th><th className="px-4 py-3">Volume</th><th className="px-4 py-3">Difficulty</th><th className="px-4 py-3">Linked Page</th><th className="px-4 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody>
              {keywords.map((kw: any) => (
                <tr key={kw.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{kw.keyword}</td>
                  <td className="px-4 py-3 text-muted-foreground">{kw.volume ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{kw.difficulty ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{kw.linkedPage || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => deleteKwMut.mutate(kw.id)} className="rounded p-1 hover:bg-muted"><Trash2 className="h-4 w-4 text-red-500" /></button>
                  </td>
                </tr>
              ))}
              {keywords.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No keywords tracked</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Build Internal Links */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">Internal Link Builder</h3>
          <button onClick={() => linksMut.mutate()} disabled={linksMut.isPending} className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
            <Link2 className="h-4 w-4" /> {linksMut.isPending ? 'Building...' : 'Build Internal Links'}
          </button>
        </div>
        {linkResults && (
          <div className="rounded-lg border bg-card p-4 space-y-2">
            {linkResults.length === 0 && <p className="text-sm text-muted-foreground">No link suggestions found</p>}
            {linkResults.map((link: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">{link.from || link.source}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-primary">{link.to || link.target}</span>
                {link.anchor && <span className="text-xs text-muted-foreground">({link.anchor})</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEO Bot Automation */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">SEO Bot</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Automated blog writing, keyword discovery, and link building</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Active
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Auto Blog</p>
            <p className="text-sm font-semibold">Every Monday 10 AM</p>
            <button
              onClick={() => { if(confirm('Generate and publish a blog post now?')) adminApi.runSeoBot('blog').then(() => qc.invalidateQueries({ queryKey: ['admin', 'website'] })) }}
              className="mt-2 text-xs text-primary hover:underline"
            >Run now</button>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">SEO Audit</p>
            <p className="text-sm font-semibold">Every Wednesday 8 AM</p>
            <button
              onClick={() => adminApi.runSeoBot('audit').then((r: any) => alert(`Score: ${r.results?.audit?.score || 'N/A'}`))}
              className="mt-2 text-xs text-primary hover:underline"
            >Run now</button>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Keyword Discovery</p>
            <p className="text-sm font-semibold">Every Wednesday 8 AM</p>
            <button
              onClick={() => adminApi.runSeoBot('keywords').then((r: any) => alert(`Discovered: ${r.results?.keywords?.discovered || 0} keywords`))}
              className="mt-2 text-xs text-primary hover:underline"
            >Run now</button>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Auto-Link Posts</p>
            <p className="text-sm font-semibold">Every Wednesday 8 AM</p>
            <button
              onClick={() => adminApi.runSeoBot('links').then((r: any) => alert(`Injected: ${r.results?.links?.totalLinks || 0} links`))}
              className="mt-2 text-xs text-primary hover:underline"
            >Run now</button>
          </div>
        </div>
      </div>

      {/* Page SEO Settings */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Page SEO Settings</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Home Title" value={seoForm.homeTitle} onChange={(v) => setSeoForm((f) => ({ ...f, homeTitle: v }))} />
          <Field label="OG Image URL" value={seoForm.ogImageUrl} onChange={(v) => setSeoForm((f) => ({ ...f, ogImageUrl: v }))} />
          <div className="sm:col-span-2"><Field label="Home Description" value={seoForm.homeDescription} onChange={(v) => setSeoForm((f) => ({ ...f, homeDescription: v }))} textarea /></div>
          <div className="sm:col-span-2"><Field label="Global Keywords (comma-separated)" value={seoForm.globalKeywords} onChange={(v) => setSeoForm((f) => ({ ...f, globalKeywords: v }))} /></div>
        </div>
        <div className="flex justify-end">
          <button onClick={() => saveSeoMut.mutate(seoForm)} disabled={saveSeoMut.isPending} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saveSeoMut.isPending ? 'Saving...' : 'Save SEO Settings'}
          </button>
        </div>
      </div>

      {/* Add Keyword Dialog */}
      {kwDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setKwDialog(false)}>
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Add Keyword</h3>
              <button onClick={() => setKwDialog(false)} className="rounded p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-4">
              <Field label="Keyword" value={kwForm.keyword} onChange={(v) => setKwForm((f) => ({ ...f, keyword: v }))} />
              <Field label="Search Volume" value={kwForm.volume} onChange={(v) => setKwForm((f) => ({ ...f, volume: v }))} type="number" />
              <Field label="Difficulty (0-100)" value={kwForm.difficulty} onChange={(v) => setKwForm((f) => ({ ...f, difficulty: v }))} type="number" />
              <Field label="Linked Page URL" value={kwForm.linkedPage} onChange={(v) => setKwForm((f) => ({ ...f, linkedPage: v }))} />
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setKwDialog(false)} className="rounded-lg border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
              <button onClick={() => addKwMut.mutate({ ...kwForm, volume: kwForm.volume ? Number(kwForm.volume) : null, difficulty: kwForm.difficulty ? Number(kwForm.difficulty) : null })} disabled={addKwMut.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                {addKwMut.isPending ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// Shared Field component
// ═════════════════════════════════════════════════════════════════════════════
function Field({ label, value, onChange, textarea, type, placeholder, rows }: {
  label: string; value: string; onChange: (v: string) => void
  textarea?: boolean; type?: string; placeholder?: string; rows?: number
}) {
  const cls = 'w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows || 3} placeholder={placeholder} className={cls} />
      ) : (
        <input type={type || 'text'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
    </div>
  )
}
