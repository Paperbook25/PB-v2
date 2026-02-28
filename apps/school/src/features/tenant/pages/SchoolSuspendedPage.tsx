import { useTenant } from '@/context/TenantContext'

export function SchoolSuspendedPage() {
  const { org } = useTenant()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 text-5xl">&#128683;</div>
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">
          School Suspended
        </h1>
        <p className="mb-6 text-gray-600">
          {org?.name ? (
            <>
              <strong>{org.name}</strong> has been temporarily suspended.
            </>
          ) : (
            'This school has been temporarily suspended.'
          )}
        </p>
        <p className="text-sm text-gray-500">
          Please contact your school administrator for more information.
        </p>
      </div>
    </div>
  )
}
