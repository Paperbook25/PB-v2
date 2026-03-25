import { useState, useCallback, useEffect } from 'react'
import {
  ArrowLeft,
  Save,
  ArrowUpFromLine,
  Eye,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'
import {
  useCreateBlogPost,
  useUpdateBlogPost,
  usePublishBlogPost,
  type BlogPost,
} from '../api/blog.api'

interface BlogPostEditorProps {
  post: BlogPost | null  // null = creating new
  onClose: () => void
}

export function BlogPostEditor({ post, onClose }: BlogPostEditorProps) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? '')
  const [body, setBody] = useState(post?.body ?? '')
  const [coverImage, setCoverImage] = useState(post?.coverImage ?? '')
  const [category, setCategory] = useState(post?.category ?? '')
  const [tagsStr, setTagsStr] = useState((post?.tags ?? []).join(', '))
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle ?? '')
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? '')
  const [seoOpen, setSeoOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const createMutation = useCreateBlogPost()
  const updateMutation = useUpdateBlogPost()
  const publishMutation = usePublishBlogPost()

  const isNew = !post

  // Auto-generate meta description from excerpt/body
  useEffect(() => {
    if (!metaDescription && (excerpt || body)) {
      const source = excerpt || body.replace(/<[^>]*>/g, '')
      setMetaDescription(source.slice(0, 155))
    }
  }, [excerpt, body]) // eslint-disable-line react-hooks/exhaustive-deps

  const parseTags = useCallback((): string[] => {
    return tagsStr
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
  }, [tagsStr])

  const handleSave = useCallback(async () => {
    if (!title.trim() || !body.trim()) return
    setSaving(true)

    try {
      if (isNew) {
        await createMutation.mutateAsync({
          title: title.trim(),
          body,
          excerpt: excerpt.trim() || undefined,
          coverImage: coverImage.trim() || undefined,
          category: category.trim() || undefined,
          tags: parseTags(),
        })
      } else {
        await updateMutation.mutateAsync({
          id: post.id,
          title: title.trim(),
          body,
          excerpt: excerpt.trim() || null,
          coverImage: coverImage.trim() || null,
          category: category.trim() || null,
          tags: parseTags(),
          metaTitle: metaTitle.trim() || null,
          metaDescription: metaDescription.trim() || null,
        })
      }
      onClose()
    } catch {
      // Error handled by mutation
    } finally {
      setSaving(false)
    }
  }, [title, body, excerpt, coverImage, category, parseTags, metaTitle, metaDescription, isNew, post, createMutation, updateMutation, onClose])

  const handlePublish = useCallback(async () => {
    if (!title.trim() || !body.trim()) return
    setSaving(true)

    try {
      if (isNew) {
        const result = await createMutation.mutateAsync({
          title: title.trim(),
          body,
          excerpt: excerpt.trim() || undefined,
          coverImage: coverImage.trim() || undefined,
          category: category.trim() || undefined,
          tags: parseTags(),
        })
        if (result?.data?.id) {
          await publishMutation.mutateAsync(result.data.id)
        }
      } else {
        await updateMutation.mutateAsync({
          id: post.id,
          title: title.trim(),
          body,
          excerpt: excerpt.trim() || null,
          coverImage: coverImage.trim() || null,
          category: category.trim() || null,
          tags: parseTags(),
          metaTitle: metaTitle.trim() || null,
          metaDescription: metaDescription.trim() || null,
        })
        await publishMutation.mutateAsync(post.id)
      }
      onClose()
    } catch {
      // Error handled by mutation
    } finally {
      setSaving(false)
    }
  }, [title, body, excerpt, coverImage, category, parseTags, metaTitle, metaDescription, isNew, post, createMutation, updateMutation, publishMutation, onClose])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to posts
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !body.trim()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            disabled={saving || !title.trim() || !body.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpFromLine className="h-4 w-4" />}
            Publish
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 border-0 border-b-2 border-gray-100 focus:border-blue-500 focus:outline-none focus:ring-0 pb-3 bg-transparent"
          />

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A short summary (shown in listings and search results)..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
              Content
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your blog post content here... (HTML supported)"
              rows={20}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Cover Image */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cover Image
            </label>
            {coverImage ? (
              <div className="relative rounded-lg overflow-hidden">
                <img src={coverImage} alt="Cover" className="w-full h-36 object-cover" />
                <button
                  onClick={() => setCoverImage('')}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition"
                >
                  <span className="sr-only">Remove</span>
                  &times;
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                <ImageIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">Paste image URL below</p>
              </div>
            )}
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Category */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Announcements, Events, Sports"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Tags */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tags
            </label>
            <input
              type="text"
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="tag1, tag2, tag3 (comma-separated)"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            {parseTags().length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {parseTags().map(tag => (
                  <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* SEO Section (collapsible) */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setSeoOpen(!seoOpen)}
              className="flex items-center justify-between w-full px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hover:bg-gray-50 transition"
            >
              SEO Settings
              {seoOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {seoOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Auto-generated on publish"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">{metaTitle.length}/200</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Meta Description</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Auto-generated from excerpt on publish"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">{metaDescription.length}/155 recommended</p>
                </div>
              </div>
            )}
          </div>

          {/* Post Info (for existing posts) */}
          {post && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Status</span>
                <StatusBadgeSmall status={post.status} />
              </div>
              <div className="flex justify-between">
                <span>Views</span>
                <span className="font-medium text-gray-700">{post.viewCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Created</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>
              {post.publishedAt && (
                <div className="flex justify-between">
                  <span>Published</span>
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadgeSmall({ status }: { status: string }) {
  if (status === 'published') {
    return <span className="font-medium text-green-600">Published</span>
  }
  return <span className="font-medium text-gray-500">Draft</span>
}
