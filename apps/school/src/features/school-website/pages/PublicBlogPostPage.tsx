import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, User, Tag, Copy, Check, Loader2 } from 'lucide-react'
import { useState, useCallback } from 'react'
import { usePublicBlogPost } from '../api/blog.api'
import { PublicLayout } from '../components/PublicLayout'

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function estimateReadTime(body: string): string {
  const words = body.replace(/<[^>]*>/g, '').split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}

function generateSeoKeywords(post: any): string[] {
  const keywords: string[] = []
  const title = post.title || ''
  const category = post.category || ''
  const tags = Array.isArray(post.tags) ? post.tags : []

  // Extract meaningful phrases from title
  const titleWords = title.split(/[\s—–\-|:,]+/).filter((w: string) => w.length > 3)

  // Combine with school context
  const schoolPhrases = [
    `${title.slice(0, 50)}`,
    category ? `${category} news school` : '',
    ...tags.map((t: string) => `${t} school`),
    ...tags,
    // Generate location + topic combos
    ...titleWords.slice(0, 3).map((w: string) => `${w} school near me`),
    category ? `best ${category.toLowerCase()} school` : '',
    `school ${category?.toLowerCase() || 'news'} updates`,
  ].filter(Boolean)

  // Deduplicate and limit
  const seen = new Set<string>()
  for (const phrase of schoolPhrases) {
    const clean = phrase.trim()
    if (clean && !seen.has(clean.toLowerCase())) {
      seen.add(clean.toLowerCase())
      keywords.push(clean)
    }
  }

  return keywords.slice(0, 8) // Max 8 keywords
}

export function PublicBlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, isError } = usePublicBlogPost(slug ?? '')
  const [copied, setCopied] = useState(false)

  const post = data?.data

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
        </div>
      </PublicLayout>
    )
  }

  if (isError || !post) {
    return (
      <PublicLayout>
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h1>
        <p className="text-gray-500 mb-6">This blog post may have been removed or is not yet published.</p>
        <Link
          to="/s/blog"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>
      </div>
      </PublicLayout>
    )
  }

  const tags = Array.isArray(post.tags) ? post.tags : []

  return (
    <PublicLayout>
    <article className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/s/blog"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to blog
      </Link>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="rounded-xl overflow-hidden mb-8">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-auto max-h-[400px] object-cover"
            onError={e => (e.currentTarget.style.display = 'none')}
          />
        </div>
      )}

      {/* Category */}
      {post.category && (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 mb-4">
          {post.category}
        </span>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
        {post.title}
      </h1>

      {/* Meta bar */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
        <span className="flex items-center gap-1.5">
          <User className="h-4 w-4" />
          {post.authorName}
        </span>
        {post.publishedAt && (
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {formatDate(post.publishedAt)}
          </span>
        )}
        <span className="text-gray-400">{estimateReadTime(post.body)}</span>
      </div>

      {/* Body */}
      <div
        className="prose prose-lg max-w-none mb-10"
        dangerouslySetInnerHTML={{ __html: post.body }}
      />

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-gray-400" />
            {tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Auto-generated SEO Keywords (NowFloats Boost style) */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-semibold">Related Search Keywords</p>
        <div className="flex flex-wrap gap-2">
          {generateSeoKeywords(post).map((kw, i) => (
            <span key={i} className="px-3 py-1.5 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition cursor-default">
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Share / Copy Link */}
      <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
        <span className="text-sm text-gray-500">Share this post:</span>
        <button
          onClick={handleCopyLink}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-green-600" />
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              Copy link
            </>
          )}
        </button>
      </div>
    </article>
    </PublicLayout>
  )
}
