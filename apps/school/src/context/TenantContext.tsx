import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface TenantOrg {
  name: string
  slug: string
  logo: string | null
  status: string
}

interface TenantState {
  /** The slug extracted from the subdomain (null if no subdomain). */
  slug: string | null
  /** Resolved org data (null if slug not found in DB). */
  org: TenantOrg | null
  /** Whether tenant resolution is in progress. */
  loading: boolean
  /** Whether the subdomain exists but the school was not found. */
  notFound: boolean
  /** Whether the school exists but is suspended. */
  suspended: boolean
}

const TenantContext = createContext<TenantState>({
  slug: null,
  org: null,
  loading: false,
  notFound: false,
  suspended: false,
})

// ---------------------------------------------------------------------------
// Subdomain extraction (client-side)
// ---------------------------------------------------------------------------

// Read from Vite env; falls back to paperbook.local for dev
const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN || 'paperbook.local'
const BASE_DOMAINS = [APP_DOMAIN]

function extractSlugFromHostname(): string | null {
  const host = window.location.hostname.toLowerCase()

  for (const base of BASE_DOMAINS) {
    if (host.endsWith(`.${base}`)) {
      const slug = host.slice(0, -(base.length + 1))
      // Validate DNS label rules
      if (/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(slug)) {
        return slug
      }
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function TenantProvider({ children }: { children: ReactNode }) {
  const slug = useMemo(() => extractSlugFromHostname(), [])

  const [state, setState] = useState<TenantState>(() => {
    // In production: Express injects window.__PAPERBOOK_TENANT__
    const injected = (window as any).__PAPERBOOK_TENANT__ as {
      slug: string | null
      org: TenantOrg | null
    } | undefined

    if (injected) {
      return {
        slug: injected.slug,
        org: injected.org,
        loading: false,
        notFound: !!injected.slug && !injected.org,
        suspended: injected.org?.status === 'suspended',
      }
    }

    // In development: we need to resolve via API
    if (slug) {
      return {
        slug,
        org: null,
        loading: true,
        notFound: false,
        suspended: false,
      }
    }

    // No subdomain (localhost, bare domain)
    return {
      slug: null,
      org: null,
      loading: false,
      notFound: false,
      suspended: false,
    }
  })

  // In dev mode, resolve the tenant via API call
  useEffect(() => {
    if (!state.loading || !slug) return

    const controller = new AbortController()

    fetch(`/api/public/tenant/resolve?slug=${encodeURIComponent(slug)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) {
          setState((prev) => ({
            ...prev,
            loading: false,
            notFound: true,
          }))
          return
        }
        return res.json()
      })
      .then((data) => {
        if (!data) return
        if (data.status === 'suspended') {
          setState((prev) => ({
            ...prev,
            org: data,
            loading: false,
            suspended: true,
          }))
        } else {
          setState((prev) => ({
            ...prev,
            org: data,
            loading: false,
          }))
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return
        console.error('[Tenant] Resolution failed:', err)
        setState((prev) => ({
          ...prev,
          loading: false,
          notFound: true,
        }))
      })

    return () => controller.abort()
  }, [slug, state.loading])

  return (
    <TenantContext.Provider value={state}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  return useContext(TenantContext)
}
