/**
 * File Upload Service
 * Abstraction layer for file uploads with support for multiple storage providers.
 *
 * Features:
 * - Support for local, S3, and cloud storage
 * - Progress tracking
 * - File validation (type, size)
 * - Image resizing/compression
 * - Chunked uploads for large files
 */

export type StorageProvider = 'local' | 's3' | 'cloudinary' | 'azure'

export interface UploadConfig {
  provider?: StorageProvider
  maxSize?: number // bytes
  allowedTypes?: string[]
  folder?: string
  generateThumbnail?: boolean
  thumbnailSize?: { width: number; height: number }
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

export interface UploadResult {
  url: string
  key: string
  filename: string
  size: number
  mimeType: string
  thumbnailUrl?: string
}

export interface UploadError {
  code: 'FILE_TOO_LARGE' | 'INVALID_TYPE' | 'UPLOAD_FAILED' | 'NETWORK_ERROR'
  message: string
}

type ProgressCallback = (progress: UploadProgress) => void

const DEFAULT_CONFIG: Required<UploadConfig> = {
  provider: 'local',
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx'],
  folder: 'uploads',
  generateThumbnail: false,
  thumbnailSize: { width: 200, height: 200 },
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  config: UploadConfig = {}
): { valid: boolean; error?: UploadError } {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  // Check file size
  if (file.size > mergedConfig.maxSize) {
    return {
      valid: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: `File size exceeds limit of ${formatFileSize(mergedConfig.maxSize)}`,
      },
    }
  }

  // Check file type
  if (mergedConfig.allowedTypes.length > 0) {
    const isAllowed = mergedConfig.allowedTypes.some((type) => {
      if (type.includes('*')) {
        // Wildcard match (e.g., "image/*")
        const baseType = type.split('/')[0]
        return file.type.startsWith(baseType)
      }
      if (type.startsWith('.')) {
        // Extension match
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      // Exact MIME type match
      return file.type === type
    })

    if (!isAllowed) {
      return {
        valid: false,
        error: {
          code: 'INVALID_TYPE',
          message: `File type ${file.type || 'unknown'} is not allowed`,
        },
      }
    }
  }

  return { valid: true }
}

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
}

/**
 * Generate unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const ext = getFileExtension(originalName)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')
  return `${baseName}-${timestamp}-${random}.${ext}`
}

/**
 * Compress image before upload
 */
export async function compressImage(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.8 } = options

  if (!file.type.startsWith('image/')) {
    return file
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      let { width, height } = img

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height
      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        file.type,
        quality
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

/**
 * Upload file to server
 */
export async function uploadFile(
  file: File,
  config: UploadConfig = {},
  onProgress?: ProgressCallback
): Promise<UploadResult> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config }

  // Validate file
  const validation = validateFile(file, config)
  if (!validation.valid) {
    throw validation.error
  }

  // Compress image if needed
  let fileToUpload = file
  if (file.type.startsWith('image/') && file.size > 1024 * 1024) {
    fileToUpload = await compressImage(file)
  }

  // Create form data
  const formData = new FormData()
  formData.append('file', fileToUpload)
  formData.append('folder', mergedConfig.folder)
  formData.append('provider', mergedConfig.provider)

  if (mergedConfig.generateThumbnail) {
    formData.append('generateThumbnail', 'true')
    formData.append('thumbnailWidth', String(mergedConfig.thumbnailSize.width))
    formData.append('thumbnailHeight', String(mergedConfig.thumbnailSize.height))
  }

  // Upload with progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress({
          loaded: event.loaded,
          total: event.total,
          percentage: Math.round((event.loaded / event.total) * 100),
        })
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve(response.data)
        } catch {
          reject({ code: 'UPLOAD_FAILED', message: 'Invalid server response' })
        }
      } else {
        reject({ code: 'UPLOAD_FAILED', message: `Upload failed with status ${xhr.status}` })
      }
    })

    xhr.addEventListener('error', () => {
      reject({ code: 'NETWORK_ERROR', message: 'Network error during upload' })
    })

    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  })
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  config: UploadConfig = {},
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadResult[]> {
  const results: UploadResult[] = []

  for (let i = 0; i < files.length; i++) {
    const result = await uploadFile(files[i], config, (progress) => {
      onProgress?.(i, progress)
    })
    results.push(result)
  }

  return results
}

/**
 * Delete uploaded file
 */
export async function deleteFile(key: string): Promise<void> {
  const response = await fetch(`/api/upload/${encodeURIComponent(key)}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('Failed to delete file')
  }
}

/**
 * Get signed URL for private file access
 */
export async function getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const response = await fetch(`/api/upload/signed-url?key=${encodeURIComponent(key)}&expires=${expiresIn}`)

  if (!response.ok) {
    throw new Error('Failed to get signed URL')
  }

  const data = await response.json()
  return data.url
}

// ==================== FILE TYPE PRESETS ====================

export const FILE_PRESETS = {
  images: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 5 * 1024 * 1024, // 5MB
  },
  documents: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
  },
  profilePhotos: {
    allowedTypes: ['image/jpeg', 'image/png'],
    maxSize: 2 * 1024 * 1024, // 2MB
    generateThumbnail: true,
    thumbnailSize: { width: 150, height: 150 },
  },
  studentDocuments: {
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 5 * 1024 * 1024, // 5MB
    folder: 'students/documents',
  },
  certificates: {
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 3 * 1024 * 1024, // 3MB
    folder: 'certificates',
  },
} as const
