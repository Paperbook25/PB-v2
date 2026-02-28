/**
 * CSV Export Utility
 * Provides functions for converting data to CSV and triggering downloads.
 */

export interface CsvColumn<T> {
  key: keyof T | string
  header: string
  formatter?: (value: unknown, row: T) => string
}

/**
 * Escapes a value for CSV format
 */
function escapeCSV(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  const str = String(value)

  // If the value contains special characters, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Gets a nested value from an object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

/**
 * Converts an array of objects to CSV string
 */
export function toCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: CsvColumn<T>[]
): string {
  // Header row
  const header = columns.map((col) => escapeCSV(col.header)).join(',')

  // Data rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const rawValue = getNestedValue(row as Record<string, unknown>, col.key as string)
        const value = col.formatter ? col.formatter(rawValue, row) : rawValue
        return escapeCSV(value)
      })
      .join(',')
  )

  return [header, ...rows].join('\n')
}

/**
 * Triggers a CSV file download in the browser
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Add BOM for Excel compatibility with UTF-8
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })

  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Exports data to CSV and triggers download
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: CsvColumn<T>[],
  filename: string
): void {
  const csv = toCSV(data, columns)
  downloadCSV(csv, filename)
}

/**
 * Common formatters for CSV export
 */
export const csvFormatters = {
  date: (value: unknown) => {
    if (!value) return ''
    const date = new Date(value as string)
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  },

  dateTime: (value: unknown) => {
    if (!value) return ''
    const date = new Date(value as string)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  },

  currency: (value: unknown) => {
    if (value === null || value === undefined) return ''
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value as number)
  },

  boolean: (value: unknown) => (value ? 'Yes' : 'No'),

  array: (value: unknown) => {
    if (!Array.isArray(value)) return ''
    return value.join('; ')
  },

  percentage: (value: unknown) => {
    if (value === null || value === undefined) return ''
    return `${value}%`
  },
}

/**
 * Generates a filename with current date
 */
export function generateExportFilename(prefix: string): string {
  const date = new Date()
  const dateStr = date.toISOString().split('T')[0]
  return `${prefix}_${dateStr}.csv`
}
