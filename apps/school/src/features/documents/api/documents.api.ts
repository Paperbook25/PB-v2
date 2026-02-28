import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/lib/api-client'
import type { PaginatedResponse } from '@/types/common.types'
import type {
  Document,
  DocumentVersion,
  DocumentActivity,
  DocumentStats,
  DocumentFilters,
  CreateFolderRequest,
  UpdateDocumentRequest,
} from '../types/documents.types'

const API_BASE = '/api/documents'

// ==================== STATS ====================

export async function fetchDocumentStats(): Promise<{ data: DocumentStats }> {
  return apiGet(`${API_BASE}/stats`)
}

// ==================== DOCUMENTS ====================

export async function fetchDocuments(
  filters: DocumentFilters = {}
): Promise<PaginatedResponse<Document>> {
  const params = new URLSearchParams()
  if (filters.search) params.set('search', filters.search)
  if (filters.parentId !== undefined) params.set('parentId', filters.parentId || 'null')
  if (filters.category) params.set('category', filters.category)
  if (filters.fileType) params.set('fileType', filters.fileType)
  if (filters.accessLevel) params.set('accessLevel', filters.accessLevel)
  if (filters.isArchived !== undefined) params.set('isArchived', String(filters.isArchived))
  if (filters.isStarred !== undefined) params.set('isStarred', String(filters.isStarred))
  if (filters.page) params.set('page', String(filters.page))
  if (filters.limit) params.set('limit', String(filters.limit))

  return apiGet(`${API_BASE}?${params}`)
}

export async function fetchDocument(id: string): Promise<{ data: Document }> {
  return apiGet(`${API_BASE}/${id}`)
}

export async function createFolder(data: CreateFolderRequest): Promise<{ data: Document }> {
  return apiPost(`${API_BASE}/folders`, data)
}

export async function uploadFile(data: {
  name: string
  parentId?: string
  category?: string
  description?: string
  accessLevel: string
  allowedRoles?: string[]
  tags?: string[]
  fileSize?: number
}): Promise<{ data: Document }> {
  return apiPost(`${API_BASE}/files`, data)
}

export async function updateDocument(
  id: string,
  data: UpdateDocumentRequest
): Promise<{ data: Document }> {
  return apiPut(`${API_BASE}/${id}`, data)
}

export async function deleteDocument(id: string): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/${id}`)
}

export async function moveDocument(
  id: string,
  targetFolderId?: string
): Promise<{ data: Document }> {
  return apiPatch(`${API_BASE}/${id}/move`, { targetFolderId })
}

export async function toggleStar(id: string): Promise<{ data: Document }> {
  return apiPatch(`${API_BASE}/${id}/star`)
}

export async function trackDownload(id: string): Promise<{ data: { url: string } }> {
  return apiPost(`${API_BASE}/${id}/download`)
}

// ==================== VERSIONS ====================

export async function fetchDocumentVersions(
  documentId: string
): Promise<{ data: DocumentVersion[] }> {
  return apiGet(`${API_BASE}/${documentId}/versions`)
}

export async function deleteDocumentVersion(
  documentId: string,
  versionId: string
): Promise<{ success: boolean }> {
  return apiDelete(`${API_BASE}/${documentId}/versions/${versionId}`)
}

// ==================== ACTIVITIES ====================

export async function fetchDocumentActivities(params: {
  documentId?: string
  limit?: number
}): Promise<{ data: DocumentActivity[] }> {
  const searchParams = new URLSearchParams()
  if (params.documentId) searchParams.set('documentId', params.documentId)
  if (params.limit) searchParams.set('limit', String(params.limit))

  return apiGet(`${API_BASE}/activities?${searchParams}`)
}

// ==================== BREADCRUMB ====================

export async function fetchBreadcrumb(
  documentId: string
): Promise<{ data: { id: string; name: string }[] }> {
  return apiGet(`${API_BASE}/${documentId}/breadcrumb`)
}
