import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../../../lib/api'
import { format } from 'date-fns'
import { toast } from '../../../hooks/use-toast'
import {
  Globe, DollarSign, FileText, Users, Search, Plus, Trash2, Edit2,
  X, Check, AlertCircle, ExternalLink, Sparkles, Link2, TrendingUp,
  Image, Share2, CheckCircle, XCircle, Download, Package, RotateCcw,
} from 'lucide-react'

// ─── helpers ────────────────────────────────────────────────────────────────
function toSlug(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

const TABS = [
  { key: 'pricing',      label: 'Pricing',         icon: DollarSign },
  { key: 'blog',         label: 'Blog',             icon: FileText },
  { key: 'contact',      label: 'Contact & Social', icon: Globe },
  { key: 'about',        label: 'About & Team',     icon: Users },
  { key: 'seo',          label: 'SEO',              icon: Search },
  { key: 'social',       label: 'Social',           icon: Share2 },
  { key: 'integrations', label: 'Integrations',     icon: Link2 },
  { key: 'products',     label: 'Products',         icon: Package },
  { key: 'addons',       label: 'Add-Ons',          icon: Plus },
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

      {tab === 'pricing'      && <PricingTab qc={qc} />}
      {tab === 'blog'         && <BlogTab qc={qc} />}
      {tab === 'contact'      && <ContactTab qc={qc} />}
      {tab === 'about'        && <AboutTab qc={qc} />}
      {tab === 'seo'          && <SeoTab qc={qc} />}
      {tab === 'social'       && <SocialTab qc={qc} />}
      {tab === 'integrations' && <IntegrationsTab qc={qc} />}
      {tab === 'products'     && <ProductsTab qc={qc} />}
      {tab === 'addons'       && <AddonsTab qc={qc} />}
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
    return { name: '', slug: '', description: '', monthlyPrice: '', yearlyPrice: '', isCustom: false, maxStudents: '', badge: '', ctaText: 'Get Started', ctaLink: '/signup', planTier: '' }
  }
  function openCreate() { setEditing(null); setForm(emptyPricingForm()); setSelectedFeatures([]); setSlugEdited(false); setDialog(true) }
  function openEdit(p: any) {
    setEditing(p); setSlugEdited(true); setSelectedFeatures(p.features || [])
    setForm({ name: p.name, slug: p.slug, description: p.description || '', monthlyPrice: String(p.monthlyPrice ?? ''), yearlyPrice: String(p.yearlyPrice ?? ''), isCustom: p.isCustom || false, maxStudents: String(p.maxStudents ?? ''), badge: p.badge || '', ctaText: p.ctaText || 'Get Started', ctaLink: p.ctaLink || '/signup', planTier: p.planTier || '' })
    setDialog(true)
  }
  function closeDialog() { setDialog(false); setEditing(null) }
  function handleSave() {
    saveMut.mutate({ ...form, monthlyPrice: form.monthlyPrice ? Number(form.monthlyPrice) : null, yearlyPrice: form.yearlyPrice ? Number(form.yearlyPrice) : null, maxStudents: form.maxStudents ? Number(form.maxStudents) : null, features: selectedFeatures, planTier: form.planTier || null })
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
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Max students: {p.maxStudents || 'Unlimited'}</span>
              {p.planTier && (
                <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-blue-700 font-medium capitalize">
                  Tier: {p.planTier}
                </span>
              )}
            </div>
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
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Maps to Plan Tier
                  <span className="ml-1 font-normal opacity-70">— syncs prices to school portal</span>
                </label>
                <select
                  value={form.planTier}
                  onChange={(e) => setForm((f) => ({ ...f, planTier: e.target.value }))}
                  className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">— None (marketing only) —</option>
                  <option value="free">Free</option>
                  <option value="starter">Starter</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
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
  const [socialPost, setSocialPost] = useState<any>(null)
  const [socialResults, setSocialResults] = useState<any>(null)

  const postsQ = useQuery({ queryKey: ['website', 'blog'], queryFn: () => adminApi.listBlogPosts() })

  const saveMut = useMutation({
    mutationFn: (data: any) => editing ? adminApi.updateBlogPost(editing.id, data) : adminApi.createBlogPost(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['website', 'blog'] }); closeDialog() },
    onError: (err: any) => { alert(err?.message || 'Failed to save blog post') },
  })
  const deleteMut = useMutation({
    mutationFn: (id: string) => adminApi.deleteBlogPost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website', 'blog'] }),
  })
  const extractMut = useMutation({
    mutationFn: () => adminApi.extractKeywords(form.title, form.content),
    onSuccess: (data: any) => { const kw = data?.keywords || data?.data?.keywords || []; setForm((f) => ({ ...f, keywords: kw.join(', ') })) },
  })
  const generateMut = useMutation({
    mutationFn: () => adminApi.generateBlogContent(form.title, form.keywords.split(',').map((k: string) => k.trim()).filter(Boolean)),
    onSuccess: (data: any) => {
      setForm((f) => ({
        ...f,
        slug: data.slug || f.slug,
        excerpt: data.excerpt || f.excerpt,
        content: data.content || f.content,
        keywords: (data.keywords || []).join(', '),
        tags: (data.tags || []).join(', '),
        metaTitle: data.metaTitle || f.metaTitle,
        metaDescription: data.metaDescription || f.metaDescription,
        category: data.category || f.category,
      }))
    },
  })
  const linkMut = useMutation({
    mutationFn: (id: string) => adminApi.injectInternalLinks(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website', 'blog'] }),
  })
  const ideasMut = useMutation({
    mutationFn: () => adminApi.getBlogIdeas(),
    onSuccess: (data: any) => { setIdeas(data?.ideas || data?.data || data || []); setShowIdeas(true) },
  })
  const genCoverMut = useMutation({
    mutationFn: (postId: string) => adminApi.generateBlogCover(postId),
    onSuccess: () => { toast({ title: 'Cover image generated' }); qc.invalidateQueries({ queryKey: ['website', 'blog'] }) },
    onError: () => toast({ title: 'Failed to generate cover image', variant: 'destructive' }),
  })
  const postSocialMut = useMutation({
    mutationFn: (postId: string) => adminApi.postBlogToSocial(postId),
    onSuccess: (data: any) => { setSocialResults(data?.results || data || {}); toast({ title: 'Posted to social platforms' }) },
    onError: () => toast({ title: 'Failed to post to social', variant: 'destructive' }),
  })

  function emptyBlogForm() {
    return { title: '', slug: '', excerpt: '', content: '', category: 'general', tags: '', status: 'draft' as string, keywords: '', metaTitle: '', metaDescription: '', coverImage: '' }
  }
  function openCreate() { setEditing(null); setForm(emptyBlogForm()); setSlugEdited(false); setDialog(true) }
  function openEdit(p: any) {
    setEditing(p); setSlugEdited(true)
    setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt || '', content: p.content || '', category: p.category || 'general', tags: (p.tags || []).join(', '), status: p.status || 'draft', keywords: (p.keywords || []).join(', '), metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '', coverImage: p.coverImage || '' })
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
                    {p.status === 'published' && (
                      <button onClick={() => linkMut.mutate(p.id)} disabled={linkMut.isPending} className="rounded p-1 hover:bg-muted" title="Auto-inject internal links">
                        <Link2 className="h-4 w-4 text-blue-500" />
                      </button>
                    )}
                    <button
                      onClick={() => genCoverMut.mutate(p.id)}
                      disabled={genCoverMut.isPending}
                      className="rounded p-1 hover:bg-muted"
                      title="Generate cover image"
                    >
                      <Image className="h-4 w-4 text-blue-500" />
                    </button>
                    {p.status === 'published' && (
                      <button
                        onClick={() => { setSocialPost(p); setSocialResults(null) }}
                        className="rounded p-1 hover:bg-muted"
                        title="Post to social"
                      >
                        <Share2 className="h-4 w-4 text-purple-500" />
                      </button>
                    )}
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

      {/* Post to Social Dialog */}
      {socialPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSocialPost(null)}>
          <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Post to Social</h3>
              <button onClick={() => setSocialPost(null)} className="rounded p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2 mb-4">
              <p className="font-medium text-foreground text-sm">{socialPost.title}</p>
              {socialPost.excerpt && <p className="text-xs text-muted-foreground">{socialPost.excerpt}</p>}
              {socialPost.coverImage && <img src={socialPost.coverImage} alt="cover" className="mt-2 h-24 w-full object-cover rounded-md" />}
            </div>
            {socialResults && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase">Results</p>
                {Object.entries(socialResults).map(([platform, result]: [string, any]) => (
                  <div key={platform} className="flex items-center gap-2 text-sm">
                    {result?.success ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="capitalize font-medium text-foreground">{platform}:</span>
                    <span className="text-muted-foreground">
                      {result?.success ? `Posted (ID: ${result.postId || 'ok'})` : `Failed: ${result?.error || 'Unknown error'}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button onClick={() => setSocialPost(null)} className="rounded-lg border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Cancel</button>
              <button
                onClick={() => postSocialMut.mutate(socialPost.id)}
                disabled={postSocialMut.isPending}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Share2 className="h-4 w-4" />
                {postSocialMut.isPending ? 'Posting...' : 'Post to All Connected Platforms'}
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div className="sm:col-span-2">
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Content</label>
                  <button
                    onClick={() => generateMut.mutate()}
                    disabled={generateMut.isPending || !form.title}
                    className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
                  >
                    <Sparkles className="h-3 w-3" /> {generateMut.isPending ? 'Generating...' : 'AI Generate Content'}
                  </button>
                </div>
                <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} rows={8} className="w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground" />
              </div>
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
              <div className="sm:col-span-2"><Field label="Cover Image URL" value={form.coverImage} onChange={(v) => setForm((f) => ({ ...f, coverImage: v }))} /></div>
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
  const [contact, setContact] = useState({
    contactEmail: '', supportEmail: '', phone: '', address: '', businessHours: '', mapLat: '', mapLng: '',
  })
  const [social, setSocial] = useState({
    facebookUrl: '', linkedinUrl: '', instagramUrl: '', twitterUrl: '', youtubeUrl: '',
  })
  const [loaded, setLoaded] = useState(false)

  const contactQ = useQuery({ queryKey: ['website', 'contact'], queryFn: () => adminApi.getWebsiteContact() })
  const socialQ  = useQuery({ queryKey: ['website', 'social'],  queryFn: () => adminApi.getWebsiteSocial()  })

  if (contactQ.data && socialQ.data && !loaded) {
    const c = contactQ.data?.data || contactQ.data || {}
    const s = socialQ.data?.data  || socialQ.data  || {}
    setContact({
      contactEmail: c.contactEmail || '', supportEmail: c.supportEmail || '',
      phone: c.phone || '', address: c.address || '', businessHours: c.businessHours || '',
      mapLat: c.mapLat || '', mapLng: c.mapLng || '',
    })
    setSocial({
      facebookUrl: s.facebookUrl || '', linkedinUrl: s.linkedinUrl || '',
      instagramUrl: s.instagramUrl || '', twitterUrl: s.twitterUrl || '', youtubeUrl: s.youtubeUrl || '',
    })
    setLoaded(true)
  }

  const contactMut = useMutation({
    mutationFn: (data: any) => adminApi.updateWebsiteContact(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website', 'contact'] }),
  })
  const socialMut = useMutation({
    mutationFn: (data: any) => adminApi.updateWebsiteSocial(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['website', 'social'] }),
  })

  const setC = (key: string) => (v: string) => setContact((f) => ({ ...f, [key]: v }))
  const setS = (key: string) => (v: string) => setSocial((f) => ({ ...f, [key]: v }))

  function handleSave() {
    contactMut.mutate(contact)
    socialMut.mutate(social)
  }

  const saving = contactMut.isPending || socialMut.isPending
  const saved  = contactMut.isSuccess && socialMut.isSuccess

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Contact Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contact Email" value={contact.contactEmail} onChange={setC('contactEmail')} />
          <Field label="Support Email" value={contact.supportEmail} onChange={setC('supportEmail')} />
          <Field label="Phone" value={contact.phone} onChange={setC('phone')} />
          <Field label="Business Hours" value={contact.businessHours} onChange={setC('businessHours')} placeholder="e.g. Mon-Sat 9am-6pm" />
          <div className="sm:col-span-2"><Field label="Address" value={contact.address} onChange={setC('address')} textarea /></div>
          <Field label="Map Latitude" value={contact.mapLat} onChange={setC('mapLat')} placeholder="e.g. 12.9716" />
          <Field label="Map Longitude" value={contact.mapLng} onChange={setC('mapLng')} placeholder="e.g. 77.5946" />
        </div>
        {contact.mapLat && contact.mapLng && (
          <p className="text-xs text-green-600">Map will appear on the Contact page at these coordinates.</p>
        )}
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Social Links</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Facebook URL"  value={social.facebookUrl}  onChange={setS('facebookUrl')}  />
          <Field label="LinkedIn URL"  value={social.linkedinUrl}  onChange={setS('linkedinUrl')}  />
          <Field label="Instagram URL" value={social.instagramUrl} onChange={setS('instagramUrl')} />
          <Field label="Twitter URL"   value={social.twitterUrl}   onChange={setS('twitterUrl')}   />
          <Field label="YouTube URL"   value={social.youtubeUrl}   onChange={setS('youtubeUrl')}   />
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
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
  const [kwSeed, setKwSeed] = useState('')
  const [kwSuggestions, setKwSuggestions] = useState<any[]>([])
  const [selectedKws, setSelectedKws] = useState<Set<number>>(new Set())
  const [showAuditDetails, setShowAuditDetails] = useState(false)
  const [auditResult, setAuditResult] = useState<any>(null)

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
  const generateKwMut = useMutation({
    mutationFn: () => adminApi.generateKeywords(kwSeed || undefined),
    onSuccess: (data: any) => { setKwSuggestions(data?.keywords || data?.data?.keywords || []); setSelectedKws(new Set()) },
    onError: () => toast({ title: 'Failed to generate keywords', variant: 'destructive' }),
  })
  const importKwsMut = useMutation({
    mutationFn: async () => {
      const toImport = kwSuggestions.filter((_, i) => selectedKws.has(i))
      for (const kw of toImport) {
        await adminApi.createSeoKeyword({ keyword: kw.keyword, volume: kw.estimatedVolume, difficulty: kw.difficulty })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['website', 'keywords'] })
      setSelectedKws(new Set())
      toast({ title: 'Keywords imported' })
    },
    onError: () => toast({ title: 'Failed to import keywords', variant: 'destructive' }),
  })
  const fullAuditMut = useMutation({
    mutationFn: () => adminApi.fullSeoAudit(),
    onSuccess: (data: any) => { setAuditResult(data?.data || data); setShowAuditDetails(true) },
    onError: () => toast({ title: 'Audit failed', variant: 'destructive' }),
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
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">SEO Score</h3>
            {seoScore !== null && (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                seoScore >= 90 ? 'bg-green-100 text-green-700' :
                seoScore >= 75 ? 'bg-blue-100 text-blue-700' :
                seoScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                seoScore >= 40 ? 'bg-orange-100 text-orange-700' :
                'bg-red-100 text-red-700'
              }`}>
                {seoScore >= 90 ? 'A' : seoScore >= 75 ? 'B' : seoScore >= 60 ? 'C' : seoScore >= 40 ? 'D' : 'F'}
              </span>
            )}
          </div>
          <p className={`text-4xl font-bold ${scoreColor}`}>{seoScore ?? '—'}<span className="text-lg font-normal text-muted-foreground">/100</span></p>
          {seoScore !== null && (
            <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  seoScore > 70 ? 'bg-green-500' : seoScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${seoScore}%` }}
              />
            </div>
          )}
          {scoreQ.isLoading && <p className="mt-1 text-xs text-muted-foreground">Analyzing...</p>}
          <button
            onClick={() => fullAuditMut.mutate()}
            disabled={fullAuditMut.isPending}
            className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-50"
          >
            <Sparkles className="h-3 w-3" />
            {fullAuditMut.isPending ? 'Running audit...' : 'Run Full Audit'}
          </button>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-foreground">Issues ({issues.length})</h3>
            {showAuditDetails && (
              <button onClick={() => setShowAuditDetails(false)} className="text-xs text-muted-foreground hover:underline">Hide details</button>
            )}
          </div>
          {issues.length === 0 && <p className="text-sm text-muted-foreground">No issues found</p>}
          {!showAuditDetails && (
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
          )}
        </div>
      </div>

      {/* Full Audit Details */}
      {showAuditDetails && auditResult && (() => {
        const auditIssues: any[] = auditResult.issues || issues
        const grouped = {
          critical: auditIssues.filter((i: any) => i.severity === 'critical'),
          high: auditIssues.filter((i: any) => i.severity === 'high'),
          medium: auditIssues.filter((i: any) => i.severity === 'medium'),
          low: auditIssues.filter((i: any) => i.severity === 'low'),
        }
        const severityConfig = {
          critical: { icon: '🔴', label: 'Critical', cls: 'bg-red-50 border-red-200 text-red-700' },
          high: { icon: '🟠', label: 'High', cls: 'bg-orange-50 border-orange-200 text-orange-700' },
          medium: { icon: '🟡', label: 'Medium', cls: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          low: { icon: '🔵', label: 'Low', cls: 'bg-blue-50 border-blue-200 text-blue-700' },
        }
        return (
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-base font-semibold text-foreground">Audit Details</h3>
            {(Object.entries(grouped) as [keyof typeof grouped, any[]][]).map(([sev, sevIssues]) => {
              if (sevIssues.length === 0) return null
              const cfg = severityConfig[sev]
              return (
                <div key={sev}>
                  <div className="flex items-center gap-2 mb-2">
                    <span>{cfg.icon}</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>{cfg.label} ({sevIssues.length})</span>
                  </div>
                  <div className="space-y-2 ml-6">
                    {sevIssues.map((issue: any, i: number) => (
                      <div key={i} className="rounded border bg-muted/30 p-3">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-foreground flex-1">{issue.message || issue.title}</p>
                          {issue.type && <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{issue.type}</span>}
                        </div>
                        {issue.fix && <p className="mt-1 text-xs text-muted-foreground">{issue.fix}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
            {auditResult.contentGapAnalysis?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Content Gaps</h4>
                <p className="text-xs text-muted-foreground mb-3">Keywords with no blog posts targeting them</p>
                <div className="space-y-2">
                  {auditResult.contentGapAnalysis.filter((g: any) => !g.hasBlogPost).map((gap: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded border bg-muted/30 p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{gap.keyword}</p>
                        {gap.suggestedTitle && <p className="text-xs text-muted-foreground">{gap.suggestedTitle}</p>}
                      </div>
                      <button
                        onClick={() => toast({ title: `Suggested: ${gap.suggestedTitle || gap.keyword}`, description: 'Switch to the Blog tab to create this post.' })}
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Plus className="h-3 w-3" /> Write Post
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      })()}

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

      {/* Keyword Planner */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <h3 className="text-base font-semibold text-foreground">Keyword Planner</h3>
        <div className="flex gap-2">
          <input
            value={kwSeed}
            onChange={(e) => setKwSeed(e.target.value)}
            placeholder="e.g. school fee management"
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            onClick={() => generateKwMut.mutate()}
            disabled={generateKwMut.isPending}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            {generateKwMut.isPending ? 'Generating...' : 'Generate Keywords'}
          </button>
        </div>
        {kwSuggestions.length > 0 && (
          <div className="space-y-3">
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase text-muted-foreground">
                  <th className="px-3 py-2 w-8">
                    <input
                      type="checkbox"
                      checked={selectedKws.size === kwSuggestions.length}
                      onChange={(e) => setSelectedKws(e.target.checked ? new Set(kwSuggestions.map((_, i) => i)) : new Set())}
                    />
                  </th>
                  <th className="px-3 py-2">Keyword</th>
                  <th className="px-3 py-2">Est. Volume</th>
                  <th className="px-3 py-2">Difficulty</th>
                  <th className="px-3 py-2">Intent</th>
                </tr></thead>
                <tbody>
                  {kwSuggestions.map((kw: any, i: number) => {
                    const diff = kw.difficulty ?? 0
                    const diffColor = diff <= 33 ? 'text-green-600 bg-green-50' : diff <= 66 ? 'text-yellow-700 bg-yellow-50' : 'text-red-600 bg-red-50'
                    return (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={selectedKws.has(i)}
                            onChange={(e) => {
                              const next = new Set(selectedKws)
                              e.target.checked ? next.add(i) : next.delete(i)
                              setSelectedKws(next)
                            }}
                          />
                        </td>
                        <td className="px-3 py-2 font-medium text-foreground">{kw.keyword}</td>
                        <td className="px-3 py-2 text-muted-foreground">{kw.estimatedVolume ?? '—'}</td>
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${diffColor}`}>{diff}</span>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground capitalize">{kw.intent || '—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => importKwsMut.mutate()}
                disabled={importKwsMut.isPending || selectedKws.size === 0}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                {importKwsMut.isPending ? 'Importing...' : `Import Selected (${selectedKws.size})`}
              </button>
            </div>
          </div>
        )}
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
// TAB 6 — Social
// ═════════════════════════════════════════════════════════════════════════════
const IMAGE_TYPES = {
  blog:      { label: 'Blog Cover',  dims: '1200×630',  ratio: 52.5,  saves: true,  desc: 'Branded editorial cover — saved to blog post' },
  linkedin:  { label: 'LinkedIn',    dims: '1200×627',  ratio: 52.25, saves: false, desc: 'Professional LinkedIn share card — preview & download' },
  twitter:   { label: 'Twitter / X', dims: '1200×675',  ratio: 56.25, saves: false, desc: 'Bold Twitter summary card — preview & download' },
  facebook:  { label: 'Facebook',    dims: '1200×628',  ratio: 52.33, saves: false, desc: 'Clean Facebook link preview — preview & download' },
  instagram: { label: 'Instagram',   dims: '1080×1080', ratio: 100,   saves: false, desc: 'Square Instagram post image — preview & download' },
} as const
type ImageType = keyof typeof IMAGE_TYPES

function SocialTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const [selectedPostId, setSelectedPostId] = useState('')
  const [postResults, setPostResults] = useState<any>(null)
  const [coverPostId, setCoverPostId] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [imageType, setImageType] = useState<ImageType>('blog')

  const postsQ = useQuery({ queryKey: ['website', 'blog'], queryFn: () => adminApi.listBlogPosts() })
  const connectionsQ = useQuery({ queryKey: ['social-connections'], queryFn: () => adminApi.getSocialConnections() })
  const historyQ = useQuery({ queryKey: ['social-history'], queryFn: () => adminApi.getSocialHistory() })

  const postToSocialMut = useMutation({
    mutationFn: () => adminApi.postBlogToSocial(selectedPostId),
    onSuccess: (data: any) => { setPostResults(data?.results || data || {}); toast({ title: 'Posted to social platforms' }) },
    onError: () => toast({ title: 'Failed to post to social', variant: 'destructive' }),
  })
  const genCoverMut = useMutation({
    mutationFn: () => adminApi.generateBlogCover(coverPostId, imageType),
    onSuccess: (data: any) => {
      const url = data?.coverImage || data?.image || data?.coverUrl || data?.url || ''
      setCoverUrl(url)
      if (imageType === 'blog') {
        toast({ title: 'Blog cover saved' })
        qc.invalidateQueries({ queryKey: ['website', 'blog'] })
      } else {
        toast({ title: `${IMAGE_TYPES[imageType].label} image generated` })
      }
    },
    onError: () => toast({ title: 'Failed to generate image', variant: 'destructive' }),
  })

  const posts: any[] = postsQ.data?.data || postsQ.data || []
  const publishedPosts = posts.filter((p: any) => p.status === 'published')
  const connections: any[] = connectionsQ.data?.connections || connectionsQ.data?.data || []
  const history: any[] = historyQ.data?.logs || historyQ.data?.data || []

  const PLATFORMS = [
    { key: 'linkedin', label: 'LinkedIn', color: 'bg-[#0077b5]/10 border-[#0077b5]/20', dot: 'bg-[#0077b5]', icon: 'in' },
    { key: 'facebook', label: 'Facebook', color: 'bg-[#1877f2]/10 border-[#1877f2]/20', dot: 'bg-[#1877f2]', icon: 'f' },
    { key: 'twitter', label: 'Twitter / X', color: 'bg-gray-100/50 border-gray-200', dot: 'bg-gray-800', icon: '𝕏' },
  ]

  return (
    <div className="space-y-6">
      {/* Connected Accounts */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Connected Accounts</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Connect your social accounts to auto-post blog articles</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {PLATFORMS.map(({ key, label, color, dot, icon }) => {
            const connected = connections.some((c: any) => c.provider === key && c.status === 'active')
            return (
              <div key={key} className={`rounded-xl border p-4 space-y-3 transition-colors ${connected ? color : 'border-border'}`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${connected ? color : 'bg-muted'} border`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">{label}</p>
                    <span className={`flex items-center gap-1.5 text-xs font-medium ${connected ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                      {connected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                </div>
                <a href="/integrations" className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> Configure in Integrations
                </a>
              </div>
            )
          })}
        </div>
        {connectionsQ.isLoading && <p className="text-sm text-muted-foreground">Loading connections...</p>}
      </div>

      {/* Manual Post Trigger */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Post to Social</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Publishes your blog post as a social media update with a branded image across all connected platforms</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Select Blog Post</label>
          <select
            value={selectedPostId}
            onChange={(e) => { setSelectedPostId(e.target.value); setPostResults(null) }}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">— Select a published post —</option>
            {publishedPosts.map((p: any) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>
        {selectedPostId && (() => {
          const post = publishedPosts.find((p: any) => p.id === selectedPostId)
          if (!post) return null
          return (
            <div className="rounded-xl border bg-muted/20 overflow-hidden">
              {post.coverImage ? (
                <div className="relative w-full overflow-hidden" style={{ paddingBottom: '28%' }}>
                  <img src={post.coverImage} alt="cover" className="absolute inset-0 h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-20 items-center justify-center bg-gradient-to-r from-violet-950 to-purple-900">
                  <p className="text-xs text-purple-300 opacity-60">No cover image — will be auto-generated on post</p>
                </div>
              )}
              <div className="p-3">
                <p className="font-semibold text-foreground text-sm line-clamp-1">{post.title}</p>
                {post.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.excerpt}</p>}
                {!post.coverImage && (
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                    <Image className="h-3 w-3" /> No cover image yet — generate one first in the Cover Generator below
                  </p>
                )}
              </div>
            </div>
          )
        })()}
        {postResults && (
          <div className="space-y-2 rounded-lg border p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Results</p>
            {Object.entries(postResults).map(([platform, result]: [string, any]) => (
              <div key={platform} className="flex items-center gap-2 text-sm">
                {result?.success ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                <span className="capitalize font-medium text-foreground">{platform}:</span>
                <span className="text-muted-foreground">
                  {result?.success ? `Posted (ID: ${result.postId || 'ok'})` : `Failed: ${result?.error || 'Unknown error'}`}
                </span>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end">
          <button
            onClick={() => postToSocialMut.mutate()}
            disabled={postToSocialMut.isPending || !selectedPostId}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <Share2 className="h-4 w-4" />
            {postToSocialMut.isPending ? 'Posting...' : 'Post to All Connected Platforms'}
          </button>
        </div>
      </div>

      {/* Post History */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">Post History</h3>
        <div className="overflow-x-auto rounded-lg border bg-card">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/50 text-left text-xs font-medium uppercase text-muted-foreground">
              <th className="px-4 py-3">Platform</th>
              <th className="px-4 py-3">Blog Post</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Post ID</th>
            </tr></thead>
            <tbody>
              {history.map((h: any, i: number) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 capitalize text-foreground">{h.platform}</td>
                  <td className="px-4 py-3 text-muted-foreground">{h.blogTitle || h.blogId || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${h.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {h.status === 'success' ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {h.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{h.createdAt ? format(new Date(h.createdAt), 'MMM d, yyyy') : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{h.postId || '—'}</td>
                </tr>
              ))}
              {history.length === 0 && !historyQ.isLoading && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No posts yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {historyQ.isLoading && <p className="text-sm text-muted-foreground">Loading history...</p>}
      </div>

      {/* Image Generator */}
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Image Generator</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {IMAGE_TYPES[imageType].desc}
          </p>
        </div>

        {/* Type selector pills */}
        <div className="flex flex-wrap gap-2">
          {(Object.entries(IMAGE_TYPES) as [ImageType, typeof IMAGE_TYPES[ImageType]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => { setImageType(key); setCoverUrl('') }}
              className={`flex flex-col items-center rounded-xl border px-3 py-2 text-xs transition-colors ${
                imageType === key
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span className="font-semibold">{cfg.label}</span>
              <span className={`text-[10px] mt-0.5 ${imageType === key ? 'opacity-80' : 'opacity-60'}`}>{cfg.dims}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Left: selector + meta + button */}
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Select Blog Post</label>
              <select
                value={coverPostId}
                onChange={(e) => { setCoverPostId(e.target.value); setCoverUrl('') }}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">— Select a post —</option>
                {posts.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
            {coverPostId && (() => {
              const post = posts.find((p: any) => p.id === coverPostId)
              if (!post) return null
              return (
                <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                  <p className="text-xs font-semibold text-foreground line-clamp-2">{post.title}</p>
                  {post.category && <span className="inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{post.category}</span>}
                  {post.excerpt && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{post.excerpt}</p>}
                </div>
              )
            })()}
            <button
              onClick={() => genCoverMut.mutate()}
              disabled={genCoverMut.isPending || !coverPostId}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <Image className="h-4 w-4" />
              {genCoverMut.isPending
                ? `Generating ${IMAGE_TYPES[imageType].label}...`
                : `Generate ${IMAGE_TYPES[imageType].label}`}
            </button>
          </div>

          {/* Right: aspect-ratio preview */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">
              Preview — {IMAGE_TYPES[imageType].dims}
            </p>
            {coverUrl ? (
              <div className="space-y-2">
                <div
                  className="relative w-full overflow-hidden rounded-lg border bg-muted/20"
                  style={{ paddingBottom: `${IMAGE_TYPES[imageType].ratio}%` }}
                >
                  <img src={coverUrl} alt="Generated" className="absolute inset-0 h-full w-full object-cover" />
                </div>
                {IMAGE_TYPES[imageType].saves ? (
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Cover saved to blog post successfully
                  </p>
                ) : (
                  <a
                    href={coverUrl}
                    download={`paperbook-${imageType}.png`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5"
                  >
                    <Download className="h-3.5 w-3.5" /> Download {IMAGE_TYPES[imageType].label} Image
                  </a>
                )}
                <a href={coverUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline">
                  <ExternalLink className="h-3 w-3" /> View full-size
                </a>
              </div>
            ) : (
              <div
                className="relative w-full overflow-hidden rounded-lg border border-dashed bg-muted/10"
                style={{ paddingBottom: `${IMAGE_TYPES[imageType].ratio}%` }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Image className="h-8 w-8 opacity-30" />
                  <p className="text-xs text-center px-4 opacity-60">
                    Select a post and click Generate
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// TAB 7 — Integrations
// ═════════════════════════════════════════════════════════════════════════════
const INTEGRATION_CATEGORIES = ['payment', 'communication', 'productivity', 'other'] as const
const CATEGORY_LABELS: Record<string, string> = { payment: 'Payment', communication: 'Communication', productivity: 'Productivity', other: 'Other' }
const CATEGORY_COLORS: Record<string, string> = { payment: 'bg-blue-100 text-blue-700', communication: 'bg-green-100 text-green-700', productivity: 'bg-purple-100 text-purple-700', other: 'bg-gray-100 text-gray-600' }

function emptyIntegrationForm() {
  return { slug: '', name: '', description: '', category: 'payment', iconBg: '#f0f4ff', iconColor: '#2563eb', logoUrl: '', isActive: true }
}

function IntegrationsTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const [dialog, setDialog]   = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm]       = useState(emptyIntegrationForm())
  const [slugEdited, setSlugEdited] = useState(false)

  const itemsQ = useQuery({ queryKey: ['website', 'integrations'], queryFn: () => adminApi.getMarketingIntegrations() })
  const saveMut = useMutation({
    mutationFn: (items: any[]) => adminApi.updateMarketingIntegrations(items),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['website', 'integrations'] }); closeDialog() },
  })

  const items: any[] = itemsQ.data?.data || itemsQ.data || []

  function openCreate() { setEditing(null); setForm(emptyIntegrationForm()); setSlugEdited(false); setDialog(true) }
  function openEdit(item: any) {
    setEditing(item); setSlugEdited(true)
    setForm({ slug: item.slug, name: item.name, description: item.description || '', category: item.category || 'other', iconBg: item.iconBg || '#f0f4ff', iconColor: item.iconColor || '#2563eb', logoUrl: item.logoUrl || '', isActive: item.isActive !== false })
    setDialog(true)
  }
  function closeDialog() { setDialog(false); setEditing(null) }
  function handleDelete(slug: string) { saveMut.mutate(items.filter((i) => i.slug !== slug)) }
  function handleSave() {
    const updated = editing
      ? items.map((i) => i.slug === editing.slug ? { ...i, ...form } : i)
      : [...items, form]
    saveMut.mutate(updated)
  }
  function handleReset() {
    if (!confirm('Reset integrations to default values? This will overwrite your changes.')) return
    saveMut.mutate([])  // empty array triggers re-seed on next read
  }
  const set = (key: string) => (v: any) => setForm((f) => ({ ...f, [key]: v }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Integrations Showcase</h2>
          <p className="text-sm text-muted-foreground">Integration cards displayed on the landing page</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
            <RotateCcw className="h-4 w-4" /> Reset to defaults
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add Integration
          </button>
        </div>
      </div>

      {itemsQ.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item: any) => (
          <div key={item.slug} className={`rounded-lg border bg-card p-5 space-y-3 ${!item.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold" style={{ background: item.iconBg, color: item.iconColor }}>
                  {item.name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{item.name}</p>
                  <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other}`}>
                    {CATEGORY_LABELS[item.category] || item.category}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(item)} className="rounded p-1 hover:bg-muted"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                <button onClick={() => handleDelete(item.slug)} className="rounded p-1 hover:bg-muted"><Trash2 className="h-4 w-4 text-red-500" /></button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
          </div>
        ))}
      </div>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeDialog}>
          <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit Integration' : 'Add Integration'}</h3>
              <button onClick={closeDialog} className="rounded p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v, slug: slugEdited ? f.slug : toSlug(v) }))} />
              <Field label="Slug" value={form.slug} onChange={(v) => { setSlugEdited(true); set('slug')(v) }} />
              <div className="sm:col-span-2"><Field label="Description" value={form.description} onChange={set('description')} textarea /></div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
                <select value={form.category} onChange={(e) => set('category')(e.target.value)} className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {INTEGRATION_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <Field label="Logo URL (optional)" value={form.logoUrl} onChange={set('logoUrl')} placeholder="https://..." />
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Icon Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.iconBg} onChange={(e) => set('iconBg')(e.target.value)} className="h-9 w-12 cursor-pointer rounded border" />
                    <span className="text-xs text-muted-foreground">{form.iconBg}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">Icon Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.iconColor} onChange={(e) => set('iconColor')(e.target.value)} className="h-9 w-12 cursor-pointer rounded border" />
                    <span className="text-xs text-muted-foreground">{form.iconColor}</span>
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive')(e.target.checked as any)} className="rounded" /> Active (visible on website)
              </label>
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
// TAB 8 — Products
// ═════════════════════════════════════════════════════════════════════════════
function emptyProductForm() {
  return { slug: '', name: '', description: '', icon: 'Package', href: '', color: '#6d28d9', badge: '', isActive: true }
}

function ProductsTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const [dialog, setDialog]   = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm]       = useState(emptyProductForm())
  const [slugEdited, setSlugEdited] = useState(false)

  const itemsQ = useQuery({ queryKey: ['website', 'products'], queryFn: () => adminApi.getMarketingProducts() })
  const saveMut = useMutation({
    mutationFn: (items: any[]) => adminApi.updateMarketingProducts(items),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['website', 'products'] }); closeDialog() },
  })

  const items: any[] = itemsQ.data?.data || itemsQ.data || []

  function openCreate() { setEditing(null); setForm(emptyProductForm()); setSlugEdited(false); setDialog(true) }
  function openEdit(item: any) {
    setEditing(item); setSlugEdited(true)
    setForm({ slug: item.slug, name: item.name, description: item.description || '', icon: item.icon || 'Package', href: item.href || '', color: item.color || '#6d28d9', badge: item.badge || '', isActive: item.isActive !== false })
    setDialog(true)
  }
  function closeDialog() { setDialog(false); setEditing(null) }
  function handleDelete(slug: string) { saveMut.mutate(items.filter((i) => i.slug !== slug)) }
  function handleSave() {
    const updated = editing
      ? items.map((i) => i.slug === editing.slug ? { ...i, ...form } : i)
      : [...items, form]
    saveMut.mutate(updated)
  }
  const set = (key: string) => (v: any) => setForm((f) => ({ ...f, [key]: v }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Product / Module Cards</h2>
          <p className="text-sm text-muted-foreground">Module showcase cards on the landing page</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {itemsQ.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item: any) => (
          <div key={item.slug} className={`rounded-lg border bg-card p-5 space-y-3 ${!item.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg text-white text-sm font-bold" style={{ background: item.color }}>
                  {item.name?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{item.name}</p>
                  {item.badge && <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5 font-medium">{item.badge}</span>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(item)} className="rounded p-1 hover:bg-muted"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                <button onClick={() => handleDelete(item.slug)} className="rounded p-1 hover:bg-muted"><Trash2 className="h-4 w-4 text-red-500" /></button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
            {item.href && <p className="text-xs text-primary">{item.href}</p>}
          </div>
        ))}
      </div>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeDialog}>
          <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={closeDialog} className="rounded p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v, slug: slugEdited ? f.slug : toSlug(v) }))} />
              <Field label="Slug" value={form.slug} onChange={(v) => { setSlugEdited(true); set('slug')(v) }} />
              <div className="sm:col-span-2"><Field label="Description" value={form.description} onChange={set('description')} textarea /></div>
              <Field label="Module Page Link" value={form.href} onChange={set('href')} placeholder="/modules/finance.html" />
              <Field label="Lucide Icon Name" value={form.icon} onChange={set('icon')} placeholder="e.g. IndianRupee" />
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Card Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.color} onChange={(e) => set('color')(e.target.value)} className="h-9 w-12 cursor-pointer rounded border" />
                  <span className="text-xs text-muted-foreground">{form.color}</span>
                </div>
              </div>
              <Field label="Badge (optional)" value={form.badge} onChange={set('badge')} placeholder="e.g. New" />
              <label className="flex items-center gap-2 text-sm text-foreground sm:col-span-2">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive')(e.target.checked as any)} className="rounded" /> Active (visible on website)
              </label>
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
// TAB 9 — Add-Ons
// ═════════════════════════════════════════════════════════════════════════════
const ADDON_CATEGORIES = [
  { key: 'communication',  label: 'Communication' },
  { key: 'hardware',       label: 'Hardware' },
  { key: 'academic',       label: 'Academic' },
  { key: 'operational',    label: 'Operational' },
  { key: 'hr-finance',     label: 'HR & Finance' },
  { key: 'customization',  label: 'Customization' },
  { key: 'support',        label: 'Support' },
  { key: 'scaling',        label: 'Scaling' },
] as const

function emptyAddonForm() {
  return { id: '', name: '', category: 'communication', price: '', priceNote: '/mo', description: '', badge: '', isPopular: false, isActive: true }
}

function AddonsTab({ qc }: { qc: ReturnType<typeof useQueryClient> }) {
  const [activeCategory, setActiveCategory] = useState('communication')
  const [dialog, setDialog]   = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm]       = useState(emptyAddonForm())

  const itemsQ = useQuery({ queryKey: ['website', 'addons'], queryFn: () => adminApi.getMarketingAddons() })
  const saveMut = useMutation({
    mutationFn: (items: any[]) => adminApi.updateMarketingAddons(items),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['website', 'addons'] }); closeDialog() },
  })

  const items: any[] = itemsQ.data?.data || itemsQ.data || []
  const categoryItems = items.filter((i) => i.category === activeCategory)
  // Determine which categories have items
  const populatedCategories = ADDON_CATEGORIES.filter((c) => items.some((i) => i.category === c.key))
  const allCategories = populatedCategories.length > 0 ? populatedCategories : ADDON_CATEGORIES

  function openCreate() {
    setEditing(null)
    setForm({ ...emptyAddonForm(), category: activeCategory, id: `addon-${Date.now()}` })
    setDialog(true)
  }
  function openEdit(item: any) {
    setEditing(item)
    setForm({ id: item.id, name: item.name, category: item.category, price: String(item.price ?? ''), priceNote: item.priceNote || '/mo', description: item.description || '', badge: item.badge || '', isPopular: item.isPopular || false, isActive: item.isActive !== false })
    setDialog(true)
  }
  function closeDialog() { setDialog(false); setEditing(null) }
  function handleDelete(id: string) { saveMut.mutate(items.filter((i) => i.id !== id)) }
  function handleSave() {
    const data = { ...form, price: form.price ? Number(form.price) : 0 }
    const updated = editing
      ? items.map((i) => i.id === editing.id ? { ...i, ...data } : i)
      : [...items, data]
    saveMut.mutate(updated)
  }
  const set = (key: string) => (v: any) => setForm((f) => ({ ...f, [key]: v }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Add-Ons Catalog</h2>
          <p className="text-sm text-muted-foreground">Manage the add-on pricing section on the landing page</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Add Item
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
        {allCategories.map((c) => {
          const count = items.filter((i) => i.category === c.key).length
          return (
            <button
              key={c.key}
              onClick={() => setActiveCategory(c.key)}
              className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${activeCategory === c.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {c.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${activeCategory === c.key ? 'bg-primary/10 text-primary' : 'bg-muted-foreground/10'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      {itemsQ.isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categoryItems.map((item: any) => (
          <div key={item.id} className={`rounded-lg border bg-card p-4 space-y-2 ${!item.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground text-sm">{item.name}</p>
                  {item.isPopular && <span className="text-[10px] rounded-full bg-orange-100 text-orange-700 px-1.5 py-0.5 font-semibold">Popular</span>}
                  {item.badge && <span className="text-[10px] rounded-full bg-blue-100 text-blue-700 px-1.5 py-0.5 font-semibold">{item.badge}</span>}
                </div>
                <p className="text-sm font-bold text-primary mt-0.5">
                  {item.price ? `₹${item.price.toLocaleString()}` : 'Free'}<span className="text-xs font-normal text-muted-foreground">{item.priceNote}</span>
                </p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(item)} className="rounded p-1 hover:bg-muted"><Edit2 className="h-4 w-4 text-muted-foreground" /></button>
                <button onClick={() => handleDelete(item.id)} className="rounded p-1 hover:bg-muted"><Trash2 className="h-4 w-4 text-red-500" /></button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
          </div>
        ))}
        {categoryItems.length === 0 && !itemsQ.isLoading && (
          <div className="col-span-3 rounded-lg border-2 border-dashed p-8 text-center text-sm text-muted-foreground">
            No add-ons in this category yet. Click "Add Item" to create one.
          </div>
        )}
      </div>

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={closeDialog}>
          <div className="w-full max-w-lg rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">{editing ? 'Edit Add-On' : 'Add Add-On'}</h3>
              <button onClick={closeDialog} className="rounded p-1 hover:bg-muted"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Field label="Name" value={form.name} onChange={set('name')} /></div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Category</label>
                <select value={form.category} onChange={(e) => set('category')(e.target.value)} className="h-9 w-full rounded-lg border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {ADDON_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <div className="flex-1"><Field label="Price (₹)" value={form.price} onChange={set('price')} type="number" placeholder="0 = free" /></div>
                <div className="w-24"><Field label="Per" value={form.priceNote} onChange={set('priceNote')} placeholder="/mo" /></div>
              </div>
              <div className="sm:col-span-2"><Field label="Description" value={form.description} onChange={set('description')} textarea /></div>
              <Field label="Badge (optional)" value={form.badge} onChange={set('badge')} placeholder="e.g. New" />
              <div className="flex flex-col gap-2 pt-2">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={form.isPopular} onChange={(e) => set('isPopular')(e.target.checked as any)} className="rounded" /> Mark as Popular
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive')(e.target.checked as any)} className="rounded" /> Active (visible)
                </label>
              </div>
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
