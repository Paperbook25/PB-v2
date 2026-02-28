interface StatusBadgeProps {
  status: string
  className?: string
}

const statusStyles: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  suspended: 'bg-red-50 text-red-700 border-red-200',
  trial: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  churned: 'bg-gray-50 text-gray-600 border-gray-200',
  banned: 'bg-red-50 text-red-700 border-red-200',
  inactive: 'bg-gray-50 text-gray-600 border-gray-200',
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
}

const statusDots: Record<string, string> = {
  active: 'bg-green-500',
  suspended: 'bg-red-500',
  trial: 'bg-yellow-500',
  churned: 'bg-gray-400',
  banned: 'bg-red-500',
  inactive: 'bg-gray-400',
  pending: 'bg-yellow-500',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase()
  const style = statusStyles[normalized] || 'bg-gray-50 text-gray-600 border-gray-200'
  const dot = statusDots[normalized] || 'bg-gray-400'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${style} ${className || ''}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  )
}
