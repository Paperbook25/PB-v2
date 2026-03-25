// Shared utilities for section variant components.

import type { TemplateTheme } from '../registry'

/** Map cornerRadius token to Tailwind border-radius class. */
export function radiusClass(cr: TemplateTheme['cornerRadius']): string {
  const map: Record<TemplateTheme['cornerRadius'], string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }
  return map[cr] ?? 'rounded-md'
}

/** Map sectionSpacing token to vertical padding class. */
export function spacingClass(sp: TemplateTheme['sectionSpacing']): string {
  const map: Record<TemplateTheme['sectionSpacing'], string> = {
    compact: 'py-12 md:py-16',
    normal: 'py-16 md:py-24',
    spacious: 'py-24 md:py-32',
  }
  return map[sp] ?? 'py-16 md:py-24'
}

/** Map cardStyle to a set of Tailwind utility classes. */
export function cardClass(cs: TemplateTheme['cardStyle'], cr: TemplateTheme['cornerRadius']): string {
  const r = radiusClass(cr)
  const map: Record<TemplateTheme['cardStyle'], string> = {
    flat: `${r} bg-white`,
    elevated: `${r} bg-white shadow-lg`,
    bordered: `${r} bg-white border border-gray-200`,
    glass: `${r} bg-white/10 backdrop-blur-md border border-white/20`,
  }
  return map[cs] ?? `${r} bg-white shadow-lg`
}

/** Safely read a field from the section content record. */
export function field<T = string>(content: Record<string, unknown> | null | undefined, key: string, fallback: T): T {
  if (!content || typeof content !== 'object') return fallback
  const v = (content as Record<string, unknown>)[key]
  if (v === undefined || v === null) return fallback
  return v as T
}
