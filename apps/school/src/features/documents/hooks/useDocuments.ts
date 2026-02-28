import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchDocumentStats,
  fetchDocuments,
  fetchDocument,
  createFolder,
  uploadFile,
  updateDocument,
  deleteDocument,
  moveDocument,
  toggleStar,
  trackDownload,
  fetchDocumentVersions,
  deleteDocumentVersion,
  fetchDocumentActivities,
  fetchBreadcrumb,
} from '../api/documents.api'
import type {
  DocumentFilters,
  CreateFolderRequest,
  UpdateDocumentRequest,
} from '../types/documents.types'

// ==================== QUERY KEYS ====================

export const documentsKeys = {
  all: ['documents'] as const,
  stats: () => [...documentsKeys.all, 'stats'] as const,
  lists: () => [...documentsKeys.all, 'list'] as const,
  list: (filters: DocumentFilters) => [...documentsKeys.lists(), filters] as const,
  details: () => [...documentsKeys.all, 'detail'] as const,
  detail: (id: string) => [...documentsKeys.details(), id] as const,
  versions: (id: string) => [...documentsKeys.all, 'versions', id] as const,
  activities: (params: { documentId?: string; limit?: number }) =>
    [...documentsKeys.all, 'activities', params] as const,
  breadcrumb: (id: string) => [...documentsKeys.all, 'breadcrumb', id] as const,
}

// ==================== STATS ====================

export function useDocumentStats() {
  return useQuery({
    queryKey: documentsKeys.stats(),
    queryFn: fetchDocumentStats,
  })
}

// ==================== DOCUMENTS ====================

export function useDocuments(filters: DocumentFilters = {}) {
  return useQuery({
    queryKey: documentsKeys.list(filters),
    queryFn: () => fetchDocuments(filters),
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: documentsKeys.detail(id),
    queryFn: () => fetchDocument(id),
    enabled: !!id,
  })
}

export function useCreateFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateFolderRequest) => createFolder(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentsKeys.lists() })
      qc.invalidateQueries({ queryKey: documentsKeys.stats() })
    },
  })
}

export function useUploadFile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof uploadFile>[0]) => uploadFile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentsKeys.lists() })
      qc.invalidateQueries({ queryKey: documentsKeys.stats() })
      qc.invalidateQueries({ queryKey: documentsKeys.activities({}) })
    },
  })
}

export function useUpdateDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentRequest }) =>
      updateDocument(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentsKeys.lists() })
      qc.invalidateQueries({ queryKey: documentsKeys.activities({}) })
    },
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentsKeys.lists() })
      qc.invalidateQueries({ queryKey: documentsKeys.stats() })
    },
  })
}

export function useMoveDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, targetFolderId }: { id: string; targetFolderId?: string }) =>
      moveDocument(id, targetFolderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentsKeys.lists() })
      qc.invalidateQueries({ queryKey: documentsKeys.activities({}) })
    },
  })
}

export function useToggleStar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => toggleStar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentsKeys.lists() })
    },
  })
}

export function useTrackDownload() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => trackDownload(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentsKeys.activities({}) })
    },
  })
}

// ==================== VERSIONS ====================

export function useDocumentVersions(documentId: string) {
  return useQuery({
    queryKey: documentsKeys.versions(documentId),
    queryFn: () => fetchDocumentVersions(documentId),
    enabled: !!documentId,
  })
}

export function useDeleteDocumentVersion() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ documentId, versionId }: { documentId: string; versionId: string }) =>
      deleteDocumentVersion(documentId, versionId),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: documentsKeys.versions(variables.documentId) })
    },
  })
}

// ==================== ACTIVITIES ====================

export function useDocumentActivities(params: { documentId?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: documentsKeys.activities(params),
    queryFn: () => fetchDocumentActivities(params),
  })
}

// ==================== BREADCRUMB ====================

export function useBreadcrumb(documentId: string) {
  return useQuery({
    queryKey: documentsKeys.breadcrumb(documentId),
    queryFn: () => fetchBreadcrumb(documentId),
    enabled: !!documentId,
  })
}
