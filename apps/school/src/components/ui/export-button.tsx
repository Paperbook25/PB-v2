import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from './button'
import { useToast } from '@/hooks/use-toast'
import { exportToCSV, generateExportFilename, type CsvColumn } from '@/lib/csv-export'
import { useAudit } from '@/hooks/useAudit'
import type { AuditModule } from '@/features/settings/types/settings.types'

interface ExportButtonProps<T extends Record<string, unknown>> {
  data: T[] | (() => Promise<T[]>)
  columns: CsvColumn<T>[]
  filename: string
  module?: AuditModule
  entityType?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  children?: React.ReactNode
}

export function ExportButton<T extends Record<string, unknown>>({
  data,
  columns,
  filename,
  module,
  entityType,
  variant = 'outline',
  size = 'default',
  className,
  children,
}: ExportButtonProps<T>) {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()
  // Always call hook unconditionally, pass a default module when not provided
  const audit = useAudit(module ?? 'students')

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Get data (either directly or via async function)
      const exportData = typeof data === 'function' ? await data() : data

      if (!exportData || exportData.length === 0) {
        toast({
          title: 'No Data',
          description: 'There is no data to export.',
          variant: 'destructive',
        })
        return
      }

      // Generate filename with date
      const exportFilename = generateExportFilename(filename)

      // Export to CSV
      exportToCSV(exportData, columns, exportFilename)

      // Log audit event if module is specified
      if (module && entityType) {
        audit.exportData(entityType, `Exported ${exportData.length} ${entityType} records to CSV`)
      }

      toast({
        title: 'Export Successful',
        description: `Exported ${exportData.length} records to ${exportFilename}`,
      })
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          {children || 'Export CSV'}
        </>
      )}
    </Button>
  )
}
