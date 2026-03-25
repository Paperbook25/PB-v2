// ==================== Template Registry ====================
// Defines all 12 templates across 3 institution types with their theme configs.

export type InstitutionType = 'school' | 'college' | 'coaching'

export type TemplateId =
  | 'school-classic' | 'school-modern' | 'school-vibrant' | 'school-minimal'
  | 'college-academic' | 'college-campus' | 'college-tech' | 'college-minimal'
  | 'coaching-results' | 'coaching-professional' | 'coaching-dynamic' | 'coaching-clean'

export interface TemplateTheme {
  defaultPrimaryColor: string
  defaultAccentColor: string
  defaultFont: string
  heroStyle: 'banner' | 'split' | 'video' | 'minimal'
  cardStyle: 'flat' | 'elevated' | 'bordered' | 'glass'
  cornerRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  navStyle: 'transparent' | 'solid' | 'floating'
  sectionSpacing: 'compact' | 'normal' | 'spacious'
}

export interface TemplateConfig {
  id: TemplateId
  label: string
  institutionType: InstitutionType
  description: string
  theme: TemplateTheme
  sectionVariants: Record<string, string>
  defaultSections: string[]
  fonts: { heading: string; body: string }
}

// --------------- Section variant presets ---------------

const SCHOOL_DEFAULT_SECTIONS = [
  'hero', 'about', 'stats', 'admissions', 'gallery',
  'testimonials', 'faculty', 'events', 'contact',
]

const COLLEGE_DEFAULT_SECTIONS = [
  'hero', 'about', 'stats', 'faculty', 'gallery',
  'admissions', 'testimonials', 'news', 'contact',
]

const COACHING_DEFAULT_SECTIONS = [
  'hero', 'stats', 'about', 'testimonials',
  'admissions', 'gallery', 'faculty', 'contact',
]

// --------------- Registry ---------------

export const TEMPLATE_REGISTRY: TemplateConfig[] = [
  // ===== School templates =====
  {
    id: 'school-classic',
    label: 'Classic School',
    institutionType: 'school',
    description: 'Traditional, trustworthy design with warm tones and serif accents.',
    theme: {
      defaultPrimaryColor: '#1e3a5f',
      defaultAccentColor: '#d4a853',
      defaultFont: 'Georgia',
      heroStyle: 'banner',
      cardStyle: 'bordered',
      cornerRadius: 'sm',
      navStyle: 'solid',
      sectionSpacing: 'normal',
    },
    sectionVariants: {
      hero: 'banner',
      about: 'classic',
      stats: 'cards',
      testimonials: 'cards',
      admissions: 'cta',
      gallery: 'grid',
      contact: 'split',
      faculty: 'grid',
      news: 'cards',
      events: 'cards',
      custom_html: 'default',
    },
    defaultSections: SCHOOL_DEFAULT_SECTIONS,
    fonts: { heading: 'Georgia', body: 'Georgia' },
  },
  {
    id: 'school-modern',
    label: 'Modern School',
    institutionType: 'school',
    description: 'Clean, contemporary layout with vibrant blues and floating nav.',
    theme: {
      defaultPrimaryColor: '#2563eb',
      defaultAccentColor: '#f59e0b',
      defaultFont: 'Inter',
      heroStyle: 'split',
      cardStyle: 'elevated',
      cornerRadius: 'lg',
      navStyle: 'floating',
      sectionSpacing: 'normal',
    },
    sectionVariants: {
      hero: 'split',
      about: 'split',
      stats: 'counters',
      testimonials: 'carousel',
      admissions: 'form',
      gallery: 'masonry',
      contact: 'split',
      faculty: 'cards',
      news: 'cards',
      events: 'timeline',
      custom_html: 'default',
    },
    defaultSections: SCHOOL_DEFAULT_SECTIONS,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'school-vibrant',
    label: 'Vibrant School',
    institutionType: 'school',
    description: 'Playful, colourful design for primary and secondary schools.',
    theme: {
      defaultPrimaryColor: '#7c3aed',
      defaultAccentColor: '#f97316',
      defaultFont: 'Nunito',
      heroStyle: 'banner',
      cardStyle: 'elevated',
      cornerRadius: 'full',
      navStyle: 'solid',
      sectionSpacing: 'spacious',
    },
    sectionVariants: {
      hero: 'banner',
      about: 'split',
      stats: 'cards',
      testimonials: 'grid',
      admissions: 'cta',
      gallery: 'masonry',
      contact: 'stacked',
      faculty: 'cards',
      news: 'list',
      events: 'cards',
      custom_html: 'default',
    },
    defaultSections: SCHOOL_DEFAULT_SECTIONS,
    fonts: { heading: 'Nunito', body: 'Nunito' },
  },
  {
    id: 'school-minimal',
    label: 'Minimal School',
    institutionType: 'school',
    description: 'Understated elegance — less is more.',
    theme: {
      defaultPrimaryColor: '#1f2937',
      defaultAccentColor: '#6366f1',
      defaultFont: 'Inter',
      heroStyle: 'minimal',
      cardStyle: 'flat',
      cornerRadius: 'sm',
      navStyle: 'solid',
      sectionSpacing: 'compact',
    },
    sectionVariants: {
      hero: 'minimal',
      about: 'minimal',
      stats: 'minimal',
      testimonials: 'cards',
      admissions: 'minimal',
      gallery: 'grid',
      contact: 'stacked',
      faculty: 'grid',
      news: 'list',
      events: 'cards',
      custom_html: 'default',
    },
    defaultSections: SCHOOL_DEFAULT_SECTIONS,
    fonts: { heading: 'Inter', body: 'Inter' },
  },

  // ===== College templates =====
  {
    id: 'college-academic',
    label: 'Academic College',
    institutionType: 'college',
    description: 'Prestigious, scholarly aesthetic inspired by Ivy League institutions.',
    theme: {
      defaultPrimaryColor: '#1e3a5f',
      defaultAccentColor: '#b8860b',
      defaultFont: 'Playfair Display',
      heroStyle: 'banner',
      cardStyle: 'bordered',
      cornerRadius: 'none',
      navStyle: 'solid',
      sectionSpacing: 'spacious',
    },
    sectionVariants: {
      hero: 'banner',
      about: 'classic',
      stats: 'counters',
      testimonials: 'carousel',
      admissions: 'cta',
      gallery: 'grid',
      contact: 'split',
      faculty: 'grid',
      news: 'cards',
      events: 'timeline',
      custom_html: 'default',
    },
    defaultSections: COLLEGE_DEFAULT_SECTIONS,
    fonts: { heading: 'Playfair Display', body: 'Source Sans Pro' },
  },
  {
    id: 'college-campus',
    label: 'Campus Life',
    institutionType: 'college',
    description: 'Photo-forward design showcasing campus culture and student life.',
    theme: {
      defaultPrimaryColor: '#065f46',
      defaultAccentColor: '#d97706',
      defaultFont: 'Source Sans Pro',
      heroStyle: 'split',
      cardStyle: 'elevated',
      cornerRadius: 'md',
      navStyle: 'transparent',
      sectionSpacing: 'normal',
    },
    sectionVariants: {
      hero: 'split',
      about: 'split',
      stats: 'cards',
      testimonials: 'grid',
      admissions: 'form',
      gallery: 'masonry',
      contact: 'split',
      faculty: 'cards',
      news: 'cards',
      events: 'cards',
      custom_html: 'default',
    },
    defaultSections: COLLEGE_DEFAULT_SECTIONS,
    fonts: { heading: 'Source Sans Pro', body: 'Source Sans Pro' },
  },
  {
    id: 'college-tech',
    label: 'Tech College',
    institutionType: 'college',
    description: 'Futuristic, glass-morphism design for engineering and IT colleges.',
    theme: {
      defaultPrimaryColor: '#4f46e5',
      defaultAccentColor: '#06b6d4',
      defaultFont: 'Space Grotesk',
      heroStyle: 'video',
      cardStyle: 'glass',
      cornerRadius: 'lg',
      navStyle: 'floating',
      sectionSpacing: 'normal',
    },
    sectionVariants: {
      hero: 'video',
      about: 'split',
      stats: 'counters',
      testimonials: 'carousel',
      admissions: 'cta',
      gallery: 'masonry',
      contact: 'split',
      faculty: 'cards',
      news: 'cards',
      events: 'timeline',
      custom_html: 'default',
    },
    defaultSections: COLLEGE_DEFAULT_SECTIONS,
    fonts: { heading: 'Space Grotesk', body: 'Inter' },
  },
  {
    id: 'college-minimal',
    label: 'Minimal College',
    institutionType: 'college',
    description: 'Refined, editorial feel with generous white space.',
    theme: {
      defaultPrimaryColor: '#374151',
      defaultAccentColor: '#8b5cf6',
      defaultFont: 'Merriweather',
      heroStyle: 'minimal',
      cardStyle: 'flat',
      cornerRadius: 'sm',
      navStyle: 'solid',
      sectionSpacing: 'compact',
    },
    sectionVariants: {
      hero: 'minimal',
      about: 'minimal',
      stats: 'minimal',
      testimonials: 'cards',
      admissions: 'minimal',
      gallery: 'grid',
      contact: 'stacked',
      faculty: 'grid',
      news: 'list',
      events: 'cards',
      custom_html: 'default',
    },
    defaultSections: COLLEGE_DEFAULT_SECTIONS,
    fonts: { heading: 'Merriweather', body: 'Inter' },
  },

  // ===== Coaching templates =====
  {
    id: 'coaching-results',
    label: 'Results Focused',
    institutionType: 'coaching',
    description: 'Bold, high-impact design that puts results front and centre.',
    theme: {
      defaultPrimaryColor: '#dc2626',
      defaultAccentColor: '#fbbf24',
      defaultFont: 'Montserrat',
      heroStyle: 'banner',
      cardStyle: 'elevated',
      cornerRadius: 'md',
      navStyle: 'solid',
      sectionSpacing: 'compact',
    },
    sectionVariants: {
      hero: 'banner',
      about: 'classic',
      stats: 'counters',
      testimonials: 'carousel',
      admissions: 'cta',
      gallery: 'grid',
      contact: 'stacked',
      faculty: 'grid',
      news: 'cards',
      events: 'cards',
      custom_html: 'default',
    },
    defaultSections: COACHING_DEFAULT_SECTIONS,
    fonts: { heading: 'Montserrat', body: 'Montserrat' },
  },
  {
    id: 'coaching-professional',
    label: 'Professional Coaching',
    institutionType: 'coaching',
    description: 'Polished, corporate feel for competitive-exam coaching centres.',
    theme: {
      defaultPrimaryColor: '#1e3a5f',
      defaultAccentColor: '#c49b3c',
      defaultFont: 'Lato',
      heroStyle: 'split',
      cardStyle: 'bordered',
      cornerRadius: 'sm',
      navStyle: 'solid',
      sectionSpacing: 'normal',
    },
    sectionVariants: {
      hero: 'split',
      about: 'split',
      stats: 'cards',
      testimonials: 'cards',
      admissions: 'form',
      gallery: 'grid',
      contact: 'split',
      faculty: 'cards',
      news: 'list',
      events: 'timeline',
      custom_html: 'default',
    },
    defaultSections: COACHING_DEFAULT_SECTIONS,
    fonts: { heading: 'Lato', body: 'Lato' },
  },
  {
    id: 'coaching-dynamic',
    label: 'Dynamic Coaching',
    institutionType: 'coaching',
    description: 'Energetic, youthful design with glass-morphism effects.',
    theme: {
      defaultPrimaryColor: '#7c3aed',
      defaultAccentColor: '#10b981',
      defaultFont: 'Poppins',
      heroStyle: 'banner',
      cardStyle: 'glass',
      cornerRadius: 'lg',
      navStyle: 'floating',
      sectionSpacing: 'normal',
    },
    sectionVariants: {
      hero: 'banner',
      about: 'split',
      stats: 'counters',
      testimonials: 'grid',
      admissions: 'cta',
      gallery: 'masonry',
      contact: 'split',
      faculty: 'cards',
      news: 'cards',
      events: 'timeline',
      custom_html: 'default',
    },
    defaultSections: COACHING_DEFAULT_SECTIONS,
    fonts: { heading: 'Poppins', body: 'Poppins' },
  },
  {
    id: 'coaching-clean',
    label: 'Clean Coaching',
    institutionType: 'coaching',
    description: 'Minimal, no-nonsense design that lets content speak.',
    theme: {
      defaultPrimaryColor: '#111827',
      defaultAccentColor: '#3b82f6',
      defaultFont: 'Inter',
      heroStyle: 'minimal',
      cardStyle: 'flat',
      cornerRadius: 'sm',
      navStyle: 'solid',
      sectionSpacing: 'compact',
    },
    sectionVariants: {
      hero: 'minimal',
      about: 'minimal',
      stats: 'minimal',
      testimonials: 'cards',
      admissions: 'minimal',
      gallery: 'grid',
      contact: 'stacked',
      faculty: 'grid',
      news: 'list',
      events: 'cards',
      custom_html: 'default',
    },
    defaultSections: COACHING_DEFAULT_SECTIONS,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
]

// --------------- Helpers ---------------

export function getTemplateConfig(id: string): TemplateConfig {
  const config = TEMPLATE_REGISTRY.find((t) => t.id === id)
  if (!config) {
    throw new Error(`Template "${id}" not found in registry.`)
  }
  return config
}

export function getTemplatesByInstitution(type: InstitutionType): TemplateConfig[] {
  return TEMPLATE_REGISTRY.filter((t) => t.institutionType === type)
}
