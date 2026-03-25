import { useState, useCallback } from 'react'
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ArrowUpFromLine,
  ArrowDownToLine,
  Loader2,
} from 'lucide-react'
import {
  useBlogPosts,
  useBlogCategories,
  useDeleteBlogPost,
  usePublishBlogPost,
  useUnpublishBlogPost,
  type BlogPost,
} from '../api/blog.api'
import { BlogPostEditor } from './BlogPostEditor'

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        Published
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      Draft
    </span>
  )
}

export function BlogManager() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [creatingNew, setCreatingNew] = useState(false)
  const [actionMenuId, setActionMenuId] = useState<string | null>(null)

  const postsQuery = useBlogPosts({
    page,
    limit: 20,
    search: search || undefined,
    category: categoryFilter || undefined,
    status: statusFilter || undefined,
  })
  const categoriesQuery = useBlogCategories()
  const deleteMutation = useDeleteBlogPost()
  const publishMutation = usePublishBlogPost()
  const unpublishMutation = useUnpublishBlogPost()

  const posts = postsQuery.data?.data ?? []
  const pagination = postsQuery.data?.pagination
  const categories = categoriesQuery.data?.data ?? []

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) return
    await deleteMutation.mutateAsync(id)
    setActionMenuId(null)
  }, [deleteMutation])

  const handlePublish = useCallback(async (id: string) => {
    await publishMutation.mutateAsync(id)
    setActionMenuId(null)
  }, [publishMutation])

  const handleUnpublish = useCallback(async (id: string) => {
    await unpublishMutation.mutateAsync(id)
    setActionMenuId(null)
  }, [unpublishMutation])

  // Show editor when creating new or editing existing
  if (creatingNew || editingPost) {
    return (
      <BlogPostEditor
        post={editingPost}
        onClose={() => {
          setCreatingNew(false)
          setEditingPost(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <button
          onClick={() => setCreatingNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          New Post
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {postsQuery.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 text-gray-400 animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-sm">No blog posts found.</p>
            <button
              onClick={() => setCreatingNew(true)}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Create your first post
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Published</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditingPost(post)}
                      className="text-sm font-medium text-gray-900 hover:text-blue-600 transition text-left"
                    >
                      {post.title}
                    </button>
                    <p className="text-xs text-gray-400 mt-0.5">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    {post.category ? (
                      <span className="text-sm text-gray-600">{post.category}</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(post.publishedAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-right">
                    {post.viewCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setActionMenuId(actionMenuId === post.id ? null : post.id)}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition"
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>

                      {actionMenuId === post.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActionMenuId(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-44">
                            <button
                              onClick={() => { setEditingPost(post); setActionMenuId(null) }}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </button>
                            {post.status === 'draft' ? (
                              <button
                                onClick={() => handlePublish(post.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <ArrowUpFromLine className="h-3.5 w-3.5" />
                                Publish
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUnpublish(post.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <ArrowDownToLine className="h-3.5 w-3.5" />
                                Unpublish
                              </button>
                            )}
                            {post.status === 'published' && (
                              <a
                                href={`/s/blog/${post.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View Live
                              </a>
                            )}
                            <hr className="my-1 border-gray-100" />
                            <button
                              onClick={() => handleDelete(post.id)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(pagination.page - 1) * pagination.limit + 1}
              -{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
