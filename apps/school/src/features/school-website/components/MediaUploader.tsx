import { useState, useRef, useCallback } from 'react'
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react'
import { useUploadMediaFile } from '../api/school-website.api'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_EXTENSIONS = 'JPEG, PNG, GIF, WebP, SVG'

interface MediaUploaderProps {
  /** Called with the uploaded file URL when upload completes */
  onUpload: (url: string) => void
  /** Optional: close/dismiss handler */
  onClose?: () => void
  /** Compact mode for inline use next to text inputs */
  compact?: boolean
}

export function MediaUploader({ onUpload, onClose, compact = false }: MediaUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useUploadMediaFile()

  const processFile = useCallback(async (file: File) => {
    setError(null)

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`Invalid file type. Allowed: ${ALLOWED_EXTENSIONS}`)
      return
    }

    if (file.size > MAX_SIZE) {
      setError('File too large. Maximum 5MB allowed.')
      return
    }

    setFileName(file.name)

    // Read as base64
    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      // dataUrl format: "data:image/png;base64,iVBOR..."
      const base64Data = dataUrl.split(',')[1]
      if (!base64Data) {
        setError('Failed to read file data.')
        return
      }

      // Show preview
      setPreview(dataUrl)

      try {
        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          data: base64Data,
          mimeType: file.type,
        })
        // result should have .url
        const uploaded = result as { url: string }
        onUpload(uploaded.url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
        setPreview(null)
      }
    }
    reader.onerror = () => {
      setError('Failed to read file.')
    }
    reader.readAsDataURL(file)
  }, [onUpload, uploadMutation])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    // Reset so same file can be selected again
    if (inputRef.current) inputRef.current.value = ''
  }, [processFile])

  const reset = useCallback(() => {
    setPreview(null)
    setError(null)
    setFileName('')
  }, [])

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition disabled:opacity-50"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : uploadMutation.isSuccess ? (
            <CheckCircle2 className="h-3 w-3 text-green-500" />
          ) : (
            <Upload className="h-3 w-3" />
          )}
          {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
        </button>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {onClose && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Upload Image</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {!preview ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors
            ${dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
            }
          `}
        >
          <ImageIcon className={`h-8 w-8 mb-2 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-sm font-medium text-gray-600">
            {dragActive ? 'Drop image here' : 'Drop image here or click to browse'}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {ALLOWED_EXTENSIONS} &mdash; Max 5MB
          </p>
        </div>
      ) : (
        <div className="relative border rounded-lg overflow-hidden bg-gray-100">
          <img src={preview} alt="Preview" className="w-full max-h-48 object-contain" />
          {uploadMutation.isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading {fileName}...
              </div>
            </div>
          )}
          {uploadMutation.isSuccess && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Uploaded successfully
              </div>
            </div>
          )}
          <button
            onClick={reset}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100"
          >
            <X className="h-3 w-3 text-gray-600" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
