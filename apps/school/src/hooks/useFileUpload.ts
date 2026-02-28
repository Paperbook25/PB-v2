import { useState, useCallback } from 'react'
import {
  uploadFile,
  uploadFiles,
  validateFile,
  UploadConfig,
  UploadProgress,
  UploadResult,
  UploadError,
} from '@/lib/file-upload'

export type UploadStatus = 'idle' | 'validating' | 'uploading' | 'success' | 'error'

interface FileUploadState {
  status: UploadStatus
  progress: UploadProgress | null
  result: UploadResult | null
  error: UploadError | null
}

interface UseFileUploadOptions extends UploadConfig {
  onSuccess?: (result: UploadResult) => void
  onError?: (error: UploadError) => void
  onProgress?: (progress: UploadProgress) => void
}

interface UseFileUploadReturn {
  status: UploadStatus
  progress: UploadProgress | null
  result: UploadResult | null
  error: UploadError | null
  isUploading: boolean
  upload: (file: File) => Promise<UploadResult | null>
  uploadMultiple: (files: File[]) => Promise<UploadResult[]>
  validate: (file: File) => { valid: boolean; error?: UploadError }
  reset: () => void
}

/**
 * Hook for managing file uploads
 *
 * @example
 * ```tsx
 * function ProfilePhotoUpload() {
 *   const { upload, isUploading, progress, result, error } = useFileUpload({
 *     maxSize: 2 * 1024 * 1024,
 *     allowedTypes: ['image/jpeg', 'image/png'],
 *     onSuccess: (result) => console.log('Uploaded:', result.url),
 *   })
 *
 *   const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
 *     const file = e.target.files?.[0]
 *     if (file) {
 *       await upload(file)
 *     }
 *   }
 *
 *   return (
 *     <div>
 *       <input type="file" onChange={handleFile} disabled={isUploading} />
 *       {isUploading && <progress value={progress?.percentage} max={100} />}
 *       {error && <p className="text-red-500">{error.message}</p>}
 *       {result && <img src={result.url} alt="Uploaded" />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const { onSuccess, onError, onProgress, ...config } = options

  const [state, setState] = useState<FileUploadState>({
    status: 'idle',
    progress: null,
    result: null,
    error: null,
  })

  const validate = useCallback(
    (file: File) => {
      return validateFile(file, config)
    },
    [config]
  )

  const upload = useCallback(
    async (file: File): Promise<UploadResult | null> => {
      setState({
        status: 'validating',
        progress: null,
        result: null,
        error: null,
      })

      // Validate file
      const validation = validate(file)
      if (!validation.valid) {
        const error = validation.error!
        setState((prev) => ({ ...prev, status: 'error', error }))
        onError?.(error)
        return null
      }

      setState((prev) => ({ ...prev, status: 'uploading' }))

      try {
        const result = await uploadFile(file, config, (progress) => {
          setState((prev) => ({ ...prev, progress }))
          onProgress?.(progress)
        })

        setState({
          status: 'success',
          progress: { loaded: file.size, total: file.size, percentage: 100 },
          result,
          error: null,
        })
        onSuccess?.(result)
        return result
      } catch (err) {
        const error = err as UploadError
        setState((prev) => ({ ...prev, status: 'error', error }))
        onError?.(error)
        return null
      }
    },
    [config, validate, onSuccess, onError, onProgress]
  )

  const uploadMultiple = useCallback(
    async (files: File[]): Promise<UploadResult[]> => {
      setState({
        status: 'validating',
        progress: null,
        result: null,
        error: null,
      })

      // Validate all files
      for (const file of files) {
        const validation = validate(file)
        if (!validation.valid) {
          const error = validation.error!
          setState((prev) => ({ ...prev, status: 'error', error }))
          onError?.(error)
          return []
        }
      }

      setState((prev) => ({ ...prev, status: 'uploading' }))

      try {
        const results = await uploadFiles(files, config, (fileIndex, progress) => {
          // Calculate overall progress
          const overallLoaded =
            files.slice(0, fileIndex).reduce((sum, f) => sum + f.size, 0) + progress.loaded
          const overallTotal = files.reduce((sum, f) => sum + f.size, 0)
          const overallProgress: UploadProgress = {
            loaded: overallLoaded,
            total: overallTotal,
            percentage: Math.round((overallLoaded / overallTotal) * 100),
          }
          setState((prev) => ({ ...prev, progress: overallProgress }))
          onProgress?.(overallProgress)
        })

        const totalSize = files.reduce((sum, f) => sum + f.size, 0)
        setState({
          status: 'success',
          progress: { loaded: totalSize, total: totalSize, percentage: 100 },
          result: results[results.length - 1], // Last result
          error: null,
        })

        return results
      } catch (err) {
        const error = err as UploadError
        setState((prev) => ({ ...prev, status: 'error', error }))
        onError?.(error)
        return []
      }
    },
    [config, validate, onError, onProgress]
  )

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      progress: null,
      result: null,
      error: null,
    })
  }, [])

  return {
    status: state.status,
    progress: state.progress,
    result: state.result,
    error: state.error,
    isUploading: state.status === 'uploading' || state.status === 'validating',
    upload,
    uploadMultiple,
    validate,
    reset,
  }
}
