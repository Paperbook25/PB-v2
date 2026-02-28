import { http, HttpResponse } from 'msw'
import { mockDelay } from '../utils/delay-config'
import { faker } from '@faker-js/faker'
import {
  documents,
  documentVersions,
  documentActivities,
  getDocumentStats,
} from '../data/documents.data'
import type {
  Document,
  Folder,
  File,
} from '@/features/documents/types/documents.types'

export const documentsHandlers = [
  // ==================== STATS ====================
  http.get('/api/documents/stats', async () => {
    await mockDelay('read')
    return HttpResponse.json({ data: getDocumentStats() })
  }),

  // ==================== LIST DOCUMENTS ====================
  http.get('/api/documents', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase()
    const parentId = url.searchParams.get('parentId')
    const category = url.searchParams.get('category')
    const fileType = url.searchParams.get('fileType')
    const accessLevel = url.searchParams.get('accessLevel')
    const isArchived = url.searchParams.get('isArchived')
    const isStarred = url.searchParams.get('isStarred')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    let filtered = [...documents]

    // Filter by parent (null = root level)
    if (parentId === 'null' || parentId === '') {
      filtered = filtered.filter((d) => !d.parentId)
    } else if (parentId) {
      filtered = filtered.filter((d) => d.parentId === parentId)
    }

    if (search) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(search) ||
          d.description?.toLowerCase().includes(search) ||
          d.tags?.some((t) => t.toLowerCase().includes(search))
      )
    }

    if (category) {
      filtered = filtered.filter((d) => d.category === category)
    }

    if (fileType) {
      filtered = filtered.filter((d) => d.type === 'file' && (d as File).fileType === fileType)
    }

    if (accessLevel) {
      filtered = filtered.filter((d) => d.accessLevel === accessLevel)
    }

    if (isArchived !== null) {
      filtered = filtered.filter((d) => d.isArchived === (isArchived === 'true'))
    }

    if (isStarred === 'true') {
      filtered = filtered.filter((d) => d.isStarred)
    }

    // Sort: folders first, then by name
    filtered.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return a.name.localeCompare(b.name)
    })

    const total = filtered.length
    const start = (page - 1) * limit
    const paginated = filtered.slice(start, start + limit)

    return HttpResponse.json({
      data: paginated,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  }),

  // ==================== GET DOCUMENT ====================
  http.get('/api/documents/:id', async ({ params }) => {
    await mockDelay('read')
    const doc = documents.find((d) => d.id === params.id)
    if (!doc) {
      return HttpResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    return HttpResponse.json({ data: doc })
  }),

  // ==================== CREATE FOLDER ====================
  http.post('/api/documents/folders', async ({ request }) => {
    await mockDelay('write')
    const body = (await request.json()) as Record<string, unknown>

    const parentDoc = body.parentId
      ? documents.find((d) => d.id === body.parentId)
      : null

    const newFolder: Folder = {
      id: faker.string.uuid(),
      name: body.name as string,
      type: 'folder',
      category: body.category as Folder['category'],
      description: body.description as string,
      parentId: body.parentId as string,
      path: parentDoc ? `${parentDoc.path}/${body.name}` : `/${body.name}`,
      accessLevel: body.accessLevel as Folder['accessLevel'],
      allowedRoles: body.allowedRoles as string[],
      tags: body.tags as string[],
      childCount: 0,
      totalSize: 0,
      createdBy: 'current-user',
      createdByName: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    documents.push(newFolder)
    return HttpResponse.json({ data: newFolder }, { status: 201 })
  }),

  // ==================== UPLOAD FILE ====================
  http.post('/api/documents/files', async ({ request }) => {
    await mockDelay('heavy')
    const body = (await request.json()) as Record<string, unknown>

    const parentDoc = body.parentId
      ? documents.find((d) => d.id === body.parentId)
      : null

    const fileType = (body.name as string).split('.').pop()?.toLowerCase() || 'other'

    const newFile: File = {
      id: faker.string.uuid(),
      name: body.name as string,
      type: 'file',
      category: body.category as File['category'],
      description: body.description as string,
      fileType: fileType as File['fileType'],
      fileSize: body.fileSize as number || faker.number.int({ min: 10240, max: 5242880 }),
      fileUrl: `https://storage.example.com/documents/${faker.string.alphanumeric(20)}`,
      parentId: body.parentId as string,
      path: parentDoc ? `${parentDoc.path}/${body.name}` : `/${body.name}`,
      accessLevel: body.accessLevel as File['accessLevel'],
      allowedRoles: body.allowedRoles as string[],
      tags: body.tags as string[],
      version: 1,
      downloadCount: 0,
      createdBy: 'current-user',
      createdByName: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    documents.push(newFile)

    // Add activity
    documentActivities.unshift({
      id: faker.string.uuid(),
      documentId: newFile.id,
      documentName: newFile.name,
      action: 'created',
      userId: 'current-user',
      userName: 'Current User',
      timestamp: new Date().toISOString(),
    })

    return HttpResponse.json({ data: newFile }, { status: 201 })
  }),

  // ==================== UPDATE DOCUMENT ====================
  http.put('/api/documents/:id', async ({ params, request }) => {
    await mockDelay('read')
    const index = documents.findIndex((d) => d.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const body = (await request.json()) as Partial<Document>
    documents[index] = { ...documents[index], ...body, updatedAt: new Date().toISOString() }

    // Add activity
    documentActivities.unshift({
      id: faker.string.uuid(),
      documentId: documents[index].id,
      documentName: documents[index].name,
      action: 'updated',
      userId: 'current-user',
      userName: 'Current User',
      timestamp: new Date().toISOString(),
    })

    return HttpResponse.json({ data: documents[index] })
  }),

  // ==================== DELETE DOCUMENT ====================
  http.delete('/api/documents/:id', async ({ params }) => {
    await mockDelay('read')
    const index = documents.findIndex((d) => d.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // If folder, delete all children recursively
    if (documents[index].type === 'folder') {
      const toDelete = new Set<string>([params.id as string])
      let changed = true
      while (changed) {
        changed = false
        documents.forEach((d) => {
          if (d.parentId && toDelete.has(d.parentId) && !toDelete.has(d.id)) {
            toDelete.add(d.id)
            changed = true
          }
        })
      }

      // Remove all marked for deletion
      for (let i = documents.length - 1; i >= 0; i--) {
        if (toDelete.has(documents[i].id)) {
          documents.splice(i, 1)
        }
      }
    } else {
      documents.splice(index, 1)
    }

    return HttpResponse.json({ success: true })
  }),

  // ==================== MOVE DOCUMENT ====================
  http.patch('/api/documents/:id/move', async ({ params, request }) => {
    await mockDelay('read')
    const index = documents.findIndex((d) => d.id === params.id)
    if (index === -1) {
      return HttpResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const body = (await request.json()) as { targetFolderId?: string }
    const targetFolder = body.targetFolderId
      ? documents.find((d) => d.id === body.targetFolderId)
      : null

    documents[index].parentId = body.targetFolderId
    documents[index].path = targetFolder
      ? `${targetFolder.path}/${documents[index].name}`
      : `/${documents[index].name}`
    documents[index].updatedAt = new Date().toISOString()

    // Add activity
    documentActivities.unshift({
      id: faker.string.uuid(),
      documentId: documents[index].id,
      documentName: documents[index].name,
      action: 'moved',
      userId: 'current-user',
      userName: 'Current User',
      timestamp: new Date().toISOString(),
      details: `Moved to ${targetFolder?.name || 'Root'}`,
    })

    return HttpResponse.json({ data: documents[index] })
  }),

  // ==================== STAR/UNSTAR ====================
  http.patch('/api/documents/:id/star', async ({ params }) => {
    await mockDelay('read')
    const doc = documents.find((d) => d.id === params.id)
    if (!doc) {
      return HttpResponse.json({ error: 'Document not found' }, { status: 404 })
    }
    doc.isStarred = !doc.isStarred
    doc.updatedAt = new Date().toISOString()
    return HttpResponse.json({ data: doc })
  }),

  // ==================== DOWNLOAD (Track) ====================
  http.post('/api/documents/:id/download', async ({ params }) => {
    await mockDelay('read')
    const doc = documents.find((d) => d.id === params.id) as File
    if (!doc || doc.type !== 'file') {
      return HttpResponse.json({ error: 'File not found' }, { status: 404 })
    }

    doc.downloadCount = (doc.downloadCount || 0) + 1
    doc.lastAccessedAt = new Date().toISOString()

    // Add activity
    documentActivities.unshift({
      id: faker.string.uuid(),
      documentId: doc.id,
      documentName: doc.name,
      action: 'downloaded',
      userId: 'current-user',
      userName: 'Current User',
      timestamp: new Date().toISOString(),
    })

    return HttpResponse.json({ data: { url: doc.fileUrl } })
  }),

  // ==================== VERSIONS ====================
  http.get('/api/documents/:id/versions', async ({ params }) => {
    await mockDelay('read')
    const versions = documentVersions.filter((v) => v.documentId === params.id)
    return HttpResponse.json({ data: versions })
  }),

  // Delete document version
  http.delete('/api/documents/:documentId/versions/:versionId', async ({ params }) => {
    await mockDelay('write')
    const index = documentVersions.findIndex(
      (v) => v.documentId === params.documentId && v.id === params.versionId
    )
    if (index === -1) {
      return HttpResponse.json({ error: 'Version not found' }, { status: 404 })
    }
    documentVersions.splice(index, 1)
    return HttpResponse.json({ success: true })
  }),

  // ==================== ACTIVITIES ====================
  http.get('/api/documents/activities', async ({ request }) => {
    await mockDelay('read')
    const url = new URL(request.url)
    const documentId = url.searchParams.get('documentId')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    let filtered = [...documentActivities]
    if (documentId) {
      filtered = filtered.filter((a) => a.documentId === documentId)
    }

    return HttpResponse.json({ data: filtered.slice(0, limit) })
  }),

  // ==================== BREADCRUMB PATH ====================
  http.get('/api/documents/:id/breadcrumb', async ({ params }) => {
    await mockDelay('read')
    const breadcrumb: { id: string; name: string }[] = []
    let currentId = params.id as string

    while (currentId) {
      const doc = documents.find((d) => d.id === currentId)
      if (!doc) break
      breadcrumb.unshift({ id: doc.id, name: doc.name })
      currentId = doc.parentId || ''
    }

    return HttpResponse.json({ data: breadcrumb })
  }),
]
