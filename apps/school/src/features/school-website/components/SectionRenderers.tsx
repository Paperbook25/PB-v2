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

// ==================== Fallback for custom_html / unknown types ====================

function FallbackRenderer({ section }: { section: WebsiteSection }) {
  if (section.type === 'custom_html') {
    const content = section.content as unknown as CustomHtmlContent
    return (
      <div
        className="py-8 px-6 max-w-6xl mx-auto"
        dangerouslySetInnerHTML={{ __html: content.html || '' }}
      />
    )
  }

  return (
    <div className="py-8 px-6 text-center text-gray-400">
      Unknown section type: {section.type}
    </div>
  )
}

// ==================== Main Renderer ====================

interface SectionRendererProps {
  section: WebsiteSection
  template?: string // template ID like 'school-classic' or legacy 'classic'
}

export function SectionRenderer({ section, template = 'school-modern' }: SectionRendererProps) {
  const templateId = resolveTemplateId(template)

  let config: TemplateConfig | undefined
  try {
    config = getTemplateConfig(templateId)
  } catch {
    // If template not found, fall back to school-modern
    config = getTemplateConfig('school-modern')
  }

  const variantName = config.sectionVariants[section.type] || 'default'
  const VariantComponent = getVariantComponent(section.type, variantName)

  if (!VariantComponent) {
    // Fallback for custom_html or unknown types
    return <FallbackRenderer section={section} />
  }

  return <VariantComponent section={section} theme={config.theme} />
}
