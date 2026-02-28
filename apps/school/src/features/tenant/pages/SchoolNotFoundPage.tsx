import { useTenant } from '@/context/TenantContext'

export function SchoolNotFoundPage() {
  const { slug } = useTenant()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 text-6xl font-bold text-gray-300">404</div>
        <h1 className="mb-2 text-2xl font-semibold text-gray-900">
          School Not Found
        </h1>
        <p className="mb-6 text-gray-600">
          {slug ? (
            <>
              No school is registered at{' '}
              <code className="rounded bg-gray-100 px-2 py-1 text-sm font-mono">
                {slug}.paperbook.app
              </code>
            </>
          ) : (
            'The school you are looking for does not exist.'
          )}
        </p>
        <p className="text-sm text-gray-500">
          If you believe this is an error, contact your school administrator
          or visit{' '}
          <a
            href="https://paperbook.app"
            className="text-blue-600 underline hover:text-blue-700"
          >
            paperbook.app
          </a>
          .
        </p>
      </div>
    </div>
  )
}
