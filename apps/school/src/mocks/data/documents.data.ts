import { faker } from '@faker-js/faker'
import type {
  Document,
  Folder,
  File,
  DocumentVersion,
  DocumentActivity,
  DocumentStats,
  DocumentCategory,
  FileType,
  AccessLevel,
} from '@/features/documents/types/documents.types'

// ==================== ROOT FOLDERS ====================

const ROOT_FOLDERS: Folder[] = [
  {
    id: 'folder-academic',
    name: 'Academic',
    type: 'folder',
    category: 'academic',
    description: 'Academic documents including curriculum, syllabi, and lesson plans',
    path: '/Academic',
    accessLevel: 'staff_only',
    childCount: 12,
    totalSize: 52428800,
    createdBy: 'admin',
    createdByName: 'System Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-15T10:30:00Z',
  },
  {
    id: 'folder-administrative',
    name: 'Administrative',
    type: 'folder',
    category: 'administrative',
    description: 'Administrative documents and meeting minutes',
    path: '/Administrative',
    accessLevel: 'admin_only',
    childCount: 8,
    totalSize: 31457280,
    createdBy: 'admin',
    createdByName: 'System Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-10T14:20:00Z',
  },
  {
    id: 'folder-circulars',
    name: 'Circulars & Notices',
    type: 'folder',
    category: 'circulars',
    description: 'Official circulars and notices',
    path: '/Circulars',
    accessLevel: 'public',
    childCount: 25,
    totalSize: 15728640,
    createdBy: 'admin',
    createdByName: 'System Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-18T09:00:00Z',
  },
  {
    id: 'folder-forms',
    name: 'Forms & Templates',
    type: 'folder',
    category: 'forms',
    description: 'Downloadable forms and document templates',
    path: '/Forms',
    accessLevel: 'public',
    childCount: 15,
    totalSize: 10485760,
    createdBy: 'admin',
    createdByName: 'System Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-05-20T11:45:00Z',
  },
  {
    id: 'folder-policies',
    name: 'Policies & Guidelines',
    type: 'folder',
    category: 'policies',
    description: 'School policies, guidelines, and SOPs',
    path: '/Policies',
    accessLevel: 'staff_only',
    childCount: 10,
    totalSize: 20971520,
    createdBy: 'admin',
    createdByName: 'System Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-04-12T16:30:00Z',
  },
  {
    id: 'folder-reports',
    name: 'Reports',
    type: 'folder',
    category: 'reports',
    description: 'Various reports and analytics',
    path: '/Reports',
    accessLevel: 'admin_only',
    childCount: 18,
    totalSize: 41943040,
    createdBy: 'admin',
    createdByName: 'System Admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-06-17T13:15:00Z',
  },
]

// ==================== SAMPLE FILES ====================

function generateFile(
  parentId: string,
  parentPath: string,
  category: DocumentCategory,
  accessLevel: AccessLevel
): File {
  const fileTypes: FileType[] = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'png']
  const fileType = faker.helpers.arrayElement(fileTypes)
  const fileName = `${faker.lorem.words(3).replace(/\s/g, '_')}.${fileType}`

  return {
    id: faker.string.uuid(),
    name: fileName,
    type: 'file',
    category,
    description: faker.lorem.sentence(),
    fileType,
    fileSize: faker.number.int({ min: 10240, max: 10485760 }), // 10KB - 10MB
    fileUrl: `https://storage.example.com/documents/${faker.string.alphanumeric(20)}`,
    thumbnailUrl: fileType === 'jpg' || fileType === 'png'
      ? `https://storage.example.com/thumbnails/${faker.string.alphanumeric(20)}`
      : undefined,
    parentId,
    path: `${parentPath}/${fileName}`,
    accessLevel,
    tags: faker.helpers.arrayElements(['important', 'urgent', '2024', 'official', 'draft', 'final'], { min: 0, max: 3 }),
    version: faker.number.int({ min: 1, max: 5 }),
    isArchived: faker.datatype.boolean({ probability: 0.1 }),
    isStarred: faker.datatype.boolean({ probability: 0.2 }),
    downloadCount: faker.number.int({ min: 0, max: 100 }),
    createdBy: faker.string.uuid(),
    createdByName: faker.person.fullName(),
    createdAt: faker.date.past({ years: 1 }).toISOString(),
    updatedAt: faker.date.recent({ days: 30 }).toISOString(),
    lastAccessedAt: faker.date.recent({ days: 7 }).toISOString(),
  }
}

// ==================== GENERATE ALL DOCUMENTS ====================

export const documents: Document[] = [...ROOT_FOLDERS]

// Add files to each root folder
ROOT_FOLDERS.forEach((folder) => {
  const filesCount = faker.number.int({ min: 5, max: 15 })
  for (let i = 0; i < filesCount; i++) {
    documents.push(generateFile(folder.id, folder.path, folder.category!, folder.accessLevel))
  }

  // Add subfolders
  const subfolderCount = faker.number.int({ min: 1, max: 3 })
  for (let i = 0; i < subfolderCount; i++) {
    const subfolderName = faker.lorem.words(2).replace(/\s/g, '_')
    const subfolder: Folder = {
      id: faker.string.uuid(),
      name: subfolderName,
      type: 'folder',
      category: folder.category,
      parentId: folder.id,
      path: `${folder.path}/${subfolderName}`,
      accessLevel: folder.accessLevel,
      childCount: faker.number.int({ min: 3, max: 8 }),
      totalSize: faker.number.int({ min: 1048576, max: 10485760 }),
      createdBy: faker.string.uuid(),
      createdByName: faker.person.fullName(),
      createdAt: faker.date.past({ years: 0.5 }).toISOString(),
      updatedAt: faker.date.recent({ days: 30 }).toISOString(),
    }
    documents.push(subfolder)

    // Add files to subfolder
    const subfilesCount = faker.number.int({ min: 3, max: 8 })
    for (let j = 0; j < subfilesCount; j++) {
      documents.push(generateFile(subfolder.id, subfolder.path, folder.category!, folder.accessLevel))
    }
  }
})

// ==================== DOCUMENT VERSIONS ====================

export const documentVersions: DocumentVersion[] = []

documents.filter((d) => d.type === 'file' && (d.version || 1) > 1).forEach((doc) => {
  const versionCount = doc.version || 1
  for (let v = 1; v <= versionCount; v++) {
    documentVersions.push({
      id: `${doc.id}-v${v}`,
      documentId: doc.id,
      version: v,
      fileUrl: `https://storage.example.com/documents/${doc.id}/v${v}`,
      fileSize: faker.number.int({ min: 10240, max: 10485760 }),
      uploadedBy: faker.string.uuid(),
      uploadedByName: faker.person.fullName(),
      uploadedAt: faker.date.past({ years: 0.5 }).toISOString(),
      changeNote: v > 1 ? faker.lorem.sentence() : undefined,
    })
  }
})

// ==================== DOCUMENT ACTIVITIES ====================

export const documentActivities: DocumentActivity[] = []

const actions: DocumentActivity['action'][] = ['created', 'viewed', 'downloaded', 'updated', 'shared']
documents.slice(0, 50).forEach((doc) => {
  const activityCount = faker.number.int({ min: 1, max: 5 })
  for (let i = 0; i < activityCount; i++) {
    documentActivities.push({
      id: faker.string.uuid(),
      documentId: doc.id,
      documentName: doc.name,
      action: faker.helpers.arrayElement(actions),
      userId: faker.string.uuid(),
      userName: faker.person.fullName(),
      timestamp: faker.date.recent({ days: 30 }).toISOString(),
      details: faker.datatype.boolean() ? faker.lorem.sentence() : undefined,
    })
  }
})

// Sort by timestamp descending
documentActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

// ==================== STATS ====================

export function getDocumentStats(): DocumentStats {
  const files = documents.filter((d) => d.type === 'file') as File[]
  const folders = documents.filter((d) => d.type === 'folder') as Folder[]

  const totalSize = files.reduce((sum, f) => sum + (f.fileSize || 0), 0)

  const categoryBreakdown: DocumentStats['categoryBreakdown'] = []
  const categories = new Set(documents.map((d) => d.category).filter(Boolean))
  categories.forEach((cat) => {
    if (cat) {
      categoryBreakdown.push({
        category: cat,
        count: documents.filter((d) => d.category === cat).length,
      })
    }
  })

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const recentUploads = files.filter((f) => new Date(f.createdAt) > oneWeekAgo).length

  return {
    totalDocuments: documents.length,
    totalFolders: folders.length,
    totalFiles: files.length,
    totalSize,
    recentUploads,
    sharedDocuments: faker.number.int({ min: 10, max: 50 }),
    categoryBreakdown,
  }
}
