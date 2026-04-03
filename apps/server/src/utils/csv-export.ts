/**
 * Simple CSV generator - converts array of objects to CSV string.
 */
export function generateCsv(data: Record<string, any>[], columns: { key: string; header: string }[]): string {
  const headers = columns.map(c => c.header)
  const rows = data.map(row =>
    columns.map(c => {
      const val = row[c.key]
      if (val === null || val === undefined) return ''
      const str = String(val)
      // Escape quotes and wrap in quotes if contains comma, newline, or quote
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}

export function setCsvHeaders(res: any, filename: string) {
  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
}
