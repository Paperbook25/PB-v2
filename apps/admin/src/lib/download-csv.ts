export function downloadCsv(
  rows: any[],
  columns: { key: string; label: string; format?: (v: any) => string }[],
  filename: string,
) {
  const header = columns.map(c => `"${c.label}"`).join(',')
  const body = rows.map(row =>
    columns.map(c => {
      const raw = row[c.key]
      const val = c.format ? c.format(raw) : (raw ?? '')
      return `"${String(val).replace(/"/g, '""')}"`
    }).join(',')
  ).join('\n')
  const blob = new Blob(['\uFEFF' + header + '\n' + body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
