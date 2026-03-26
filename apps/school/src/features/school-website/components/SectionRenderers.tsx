import { Component, type ReactNode } from 'react'
import DOMPurify from 'dompurify'
import { getVariantComponent } from '../templates/section-variants'
import { getTemplateConfig, type TemplateConfig } from '../templates/registry'
import type { WebsiteSection, CustomHtmlContent } from '../types/school-website.types'

// Legacy template names -> new template IDs
const LEGACY_MAP: Record<string, string> = {
  classic: 'school-classic',
  modern: 'school-modern',
  minimal: 'school-minimal',
}

function resolveTemplateId(template: string): string {
  return LEGACY_MAP[template] || template
}

// ==================== Error boundary per section ====================

interface ErrorBoundaryProps { children: ReactNode; sectionType: string }
interface ErrorBoundaryState { hasError: boolean }

class SectionErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="py-8 px-6 text-center bg-gray-50 border-y">
          <p className="text-sm text-gray-400">Failed to render section: {this.props.sectionType}</p>
        </div>
      )
    }
    return this.props.children
  }
}

// ==================== Fallback for custom_html / unknown types ====================

function FallbackRenderer({ section }: { section: WebsiteSection }) {
  if (section.type === 'custom_html') {
    const content = (section.content || {}) as unknown as CustomHtmlContent
    return (
      <div
        className="py-8 px-6 max-w-6xl mx-auto"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content?.html || '') }}
      />
    )
  }

  return (
    <div className="py-8 px-6 text-center text-gray-400">
      Unknown section type: {section.type || 'unknown'}
    </div>
  )
}

// ==================== Main Renderer ====================

interface SectionRendererProps {
  section: WebsiteSection
  template?: string
  primaryColor?: string
  accentColor?: string
}

export function SectionRenderer({ section, template = 'school-modern', primaryColor, accentColor }: SectionRendererProps) {
  if (!section || !section.type) {
    return null
  }

  const templateId = resolveTemplateId(template)

  let config: TemplateConfig
  try {
    config = getTemplateConfig(templateId)
  } catch {
    try {
      config = getTemplateConfig('school-modern')
    } catch {
      // Last resort fallback
      return <FallbackRenderer section={section} />
    }
  }

  // Override theme with user's custom colors
  const theme = {
    ...config.theme,
    ...(primaryColor && { defaultPrimaryColor: primaryColor }),
    ...(accentColor && { defaultAccentColor: accentColor }),
  }

  const variantName = config.sectionVariants[section.type] || 'default'
  const VariantComponent = getVariantComponent(section.type, variantName)

  if (!VariantComponent) {
    return <FallbackRenderer section={section} />
  }

  // Ensure content is always an object
  const safeSection = {
    ...section,
    content: (section.content && typeof section.content === 'object') ? section.content : {},
  }

  return (
    <SectionErrorBoundary sectionType={section.type}>
      <VariantComponent section={safeSection as WebsiteSection} theme={theme} />
    </SectionErrorBoundary>
  )
}
