import type { ReactNode } from 'react'
import { useAddonStore } from '@/stores/useAddonStore'
import { Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

interface AddonGateProps {
  slug: string       // addon slug like 'library', 'transport', etc.
  children: ReactNode
  fallback?: ReactNode
}

export function AddonGate({ slug, children, fallback }: AddonGateProps) {
  const { isAddonEnabled, loaded } = useAddonStore()

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-600 rounded-full" />
      </div>
    )
  }

  if (!isAddonEnabled(slug)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center max-w-md">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
            <Lock className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Module Not Enabled</h2>
          <p className="text-gray-500 mb-6">
            This module is not currently active for your school. Contact your administrator to enable it.
          </p>
          <Link
            to="/settings?tab=modules"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            Go to Settings
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
