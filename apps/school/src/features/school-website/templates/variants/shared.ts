// Shared utilities for section variant components.

import type React from 'react'
import type { TemplateTheme } from '../registry'

/** Convert hex color to RGB components */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 37, g: 99, b: 235 } // fallback blue
}

/** Generate a light tint of the primary color at given opacity (0-1) */
export function tint(hex: string, opacity: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

/** Darken a color by mixing with black */
export function darken(hex: string, amount: number): string {
  const { r, g, b } = hexToRgb(hex)
  const f = 1 - amount
  return `rgb(${Math.round(r * f)}, ${Math.round(g * f)}, ${Math.round(b * f)})`
}

/** Get section background style based on index for alternating look */
export function sectionBg(theme: TemplateTheme, index: number): React.CSSProperties {
  if (index % 2 === 0) return {}
  return { backgroundColor: tint(theme.defaultPrimaryColor, 0.04) }
}

/** Get heading color style using primary color */
export function headingColor(theme: TemplateTheme): React.CSSProperties {
  return { color: theme.defaultPrimaryColor }
}

/** Get accent tag/badge style */
export function accentBadgeStyle(theme: TemplateTheme): React.CSSProperties {
  return {
    backgroundColor: tint(theme.defaultAccentColor, 0.12),
    color: theme.defaultAccentColor,
  }
}

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
