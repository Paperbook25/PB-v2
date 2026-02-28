import * as React from 'react'
import { Upload, X, ImageIcon, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  maxSizeMB?: number
  aspectRatio?: number
  placeholder?: string
  disabled?: boolean
  className?: string
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const ImageUpload = React.forwardRef<HTMLDivElement, ImageUploadProps>(
  (
    {
      value,
      onChange,
      maxSizeMB = 5,
      aspectRatio,
      placeholder = 'Upload Image',
      disabled = false,
      className,
    },
    ref
  ) => {
    const [isDragging, setIsDragging] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const validateFile = (file: File): string | null => {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return 'Please upload a JPEG, PNG, or WebP image'
      }

      const sizeMB = file.size / (1024 * 1024)
      if (sizeMB > maxSizeMB) {
        return `Image size must be less than ${maxSizeMB}MB`
      }

      return null
    }

    const processFile = async (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setError(null)

      // Convert to base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onChange(result)
      }
      reader.onerror = () => {
        setError('Failed to read the image file')
      }
      reader.readAsDataURL(file)
    }

    const handleDrop = React.useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (disabled) return

        const file = e.dataTransfer.files[0]
        if (file) {
          processFile(file)
        }
      },
      [disabled, maxSizeMB, onChange]
    )

    const handleDragOver = React.useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        if (!disabled) {
          setIsDragging(true)
        }
      },
      [disabled]
    )

    const handleDragLeave = React.useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
      },
      []
    )

    const handleClick = () => {
      if (!disabled) {
        inputRef.current?.click()
      }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        processFile(file)
      }
      // Reset input so the same file can be selected again
      e.target.value = ''
    }

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange('')
      setError(null)
    }

    return (
      <div ref={ref} className={cn('space-y-2', className)}>
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors cursor-pointer',
            aspectRatio ? 'overflow-hidden' : 'min-h-[150px]',
            isDragging && 'border-primary bg-primary/5',
            disabled && 'cursor-not-allowed opacity-50',
            error && 'border-destructive',
            !isDragging && !error && !disabled && 'border-muted-foreground/25 hover:border-primary hover:bg-muted/50'
          )}
          style={aspectRatio ? { aspectRatio: aspectRatio } : undefined}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled}
          />

          {value ? (
            <>
              <img
                src={value}
                alt="Uploaded preview"
                className={cn(
                  'object-cover',
                  aspectRatio ? 'w-full h-full' : 'max-h-[200px] max-w-full rounded-md'
                )}
              />
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                {isDragging ? (
                  <Upload className="h-6 w-6 text-primary" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm font-medium">
                {isDragging ? 'Drop image here' : placeholder}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                JPEG, PNG, WebP up to {maxSizeMB}MB
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    )
  }
)

ImageUpload.displayName = 'ImageUpload'

export { ImageUpload }
export type { ImageUploadProps }
