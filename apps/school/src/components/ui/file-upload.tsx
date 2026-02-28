import { useCallback, useState, useRef } from 'react'
import { Upload, X, FileText, Image as ImageIcon, Loader2, AlertCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Progress } from './progress'
import { useFileUpload } from '@/hooks/useFileUpload'
import { formatFileSize, UploadConfig, UploadResult } from '@/lib/file-upload'

interface FileUploadProps extends UploadConfig {
  /**
   * Called when file is successfully uploaded
   */
  onUpload?: (result: UploadResult) => void
  /**
   * Called when upload fails
   */
  onError?: (error: { code: string; message: string }) => void
  /**
   * Accept string for input (e.g., "image/*,.pdf")
   */
  accept?: string
  /**
   * Allow multiple files
   */
  multiple?: boolean
  /**
   * Show preview for images
   */
  showPreview?: boolean
  /**
   * Custom label
   */
  label?: string
  /**
   * Helper text
   */
  helperText?: string
  /**
   * Disabled state
   */
  disabled?: boolean
  /**
   * Additional class name
   */
  className?: string
  /**
   * Variant style
   */
  variant?: 'dropzone' | 'button' | 'compact'
}

export function FileUpload({
  onUpload,
  onError,
  accept,
  multiple = false,
  showPreview = true,
  label,
  helperText,
  disabled = false,
  className,
  variant = 'dropzone',
  ...uploadConfig
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null)

  const { upload, uploadMultiple, isUploading, progress, status, error, reset } = useFileUpload({
    ...uploadConfig,
    onSuccess: (result) => {
      setUploadedFile({ name: result.filename, size: result.size })
      onUpload?.(result)
    },
    onError,
  })

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]

      // Show preview for images
      if (showPreview && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }

      // Upload
      if (multiple && files.length > 1) {
        await uploadMultiple(Array.from(files))
      } else {
        await upload(file)
      }
    },
    [upload, uploadMultiple, multiple, showPreview]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      if (disabled || isUploading) return
      handleFileSelect(e.dataTransfer.files)
    },
    [disabled, isUploading, handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleClear = useCallback(() => {
    setPreview(null)
    setUploadedFile(null)
    reset()
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [reset])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files)
    },
    [handleFileSelect]
  )

  // Button variant
  if (variant === 'button') {
    return (
      <div className={cn('inline-flex items-center gap-2', className)}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {label || 'Upload File'}
            </>
          )}
        </Button>
        {uploadedFile && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-green-500" />
            {uploadedFile.name}
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleClear}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
        {error && <span className="text-sm text-destructive">{error.message}</span>}
      </div>
    )
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={cn('space-y-2', className)}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
        <div
          className={cn(
            'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors',
            isDragging && 'border-primary bg-primary/5',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-destructive'
          )}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {preview ? (
            <img src={preview} alt="Preview" className="h-10 w-10 rounded object-cover" />
          ) : uploadedFile ? (
            <FileText className="h-10 w-10 text-muted-foreground" />
          ) : (
            <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {uploadedFile ? (
              <>
                <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
              </>
            ) : (
              <>
                <p className="text-sm">{label || 'Click to upload'}</p>
                <p className="text-xs text-muted-foreground">{helperText || 'or drag and drop'}</p>
              </>
            )}
          </div>
          {isUploading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          {status === 'success' && <Check className="h-5 w-5 text-green-500" />}
          {uploadedFile && !isUploading && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {isUploading && progress && <Progress value={progress.percentage} className="h-1" />}
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error.message}
          </p>
        )}
      </div>
    )
  }

  // Dropzone variant (default)
  return (
    <div className={cn('space-y-4', className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-destructive',
          !isDragging && !error && 'hover:border-primary/50 hover:bg-muted/50'
        )}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 rounded-lg mx-auto object-contain"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : uploadedFile ? (
          <div className="space-y-2">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="font-medium">{uploadedFile.name}</p>
            <p className="text-sm text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
            >
              <X className="h-3 w-3 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {isUploading ? (
              <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
            ) : (
              <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary" />
              </div>
            )}
            <div>
              <p className="text-lg font-medium">{label || 'Upload a file'}</p>
              <p className="text-sm text-muted-foreground">
                {helperText || 'Drag and drop or click to browse'}
              </p>
            </div>
            {uploadConfig.maxSize && (
              <p className="text-xs text-muted-foreground">
                Max size: {formatFileSize(uploadConfig.maxSize)}
              </p>
            )}
          </div>
        )}
      </div>
      {isUploading && progress && (
        <div className="space-y-2">
          <Progress value={progress.percentage} />
          <p className="text-sm text-muted-foreground text-center">{progress.percentage}% uploaded</p>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {error.message}
        </div>
      )}
    </div>
  )
}
