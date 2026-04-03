import { Download } from 'lucide-react'
import { useState } from 'react'

interface ExportButtonProps {
  endpoint: string
  filename: string
  label?: string
}

export function ExportButton({ endpoint, filename, label = 'Export CSV' }: ExportButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin${endpoint}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
    >
      <Download className="h-3.5 w-3.5" />
      {loading ? 'Exporting...' : label}
    </button>
  )
}
