// ==================== Section Content Types ====================

export interface HeroContent {
  headline: string
  subtitle: string
  backgroundImage: string
  ctaText: string
  ctaLink: string
}

export interface AboutContent {
  body: string
  image: string
  mission: string
  vision: string
}

export interface StatsItem {
  label: string
  value: string
  icon: string
}
export interface StatsContent {
  items: StatsItem[]
}

export interface AdmissionsContent {
  body: string
  ctaText: string
  ctaLink: string
  showApplicationForm: boolean
}

export interface FacultyContent {
  description: string
  showAll: boolean
  featured: string[]
}

export interface GalleryImage {
  url: string
  caption: string
}
export interface GalleryContent {
  images: GalleryImage[]
  layout: 'grid' | 'masonry'
}

export interface TestimonialItem {
  name: string
  role: string
  quote: string
  avatar: string
}
export interface TestimonialsContent {
  items: TestimonialItem[]
}

export interface EventsContent {
  showCount: number
  showPast: boolean
}

export interface NewsItem {
  title: string
  body: string
  date: string
  image: string
}
export interface NewsContent {
  items: NewsItem[]
}

export interface ContactContent {
  showMap: boolean
  showForm: boolean
  mapEmbed: string
  additionalInfo: string
}

export interface CustomHtmlContent {
  html: string
}

export type SectionType =
  | 'hero' | 'about' | 'stats' | 'admissions' | 'faculty' | 'gallery'
  | 'testimonials' | 'events' | 'news' | 'contact' | 'custom_html'

export type SectionContent =
  | HeroContent | AboutContent | StatsContent | AdmissionsContent
  | FacultyContent | GalleryContent | TestimonialsContent | EventsContent
  | NewsContent | ContactContent | CustomHtmlContent

// ==================== Models ====================

export interface WebsiteSection {
  id: string
  pageId: string
  type: SectionType
  title: string | null
  content: Record<string, unknown>
  sortOrder: number
  isVisible: boolean
  createdAt: string
  updatedAt: string
}

export interface WebsitePage {
  id: string
  slug: string
  title: string
  isPublished: boolean
  sortOrder: number
  sections: WebsiteSection[]
  createdAt: string
  updatedAt: string
}

export interface WebsiteSettings {
  id: string
  template: TemplateStyle
  primaryColor: string
  accentColor: string
  fontFamily: string
  customDomain: string | null
  metaTitle: string | null
  metaDescription: string | null
  socialLinks: Record<string, string>
  headerHtml: string | null
  footerHtml: string | null
  createdAt: string
  updatedAt: string
}

export interface WebsiteMedia {
  id: string
  fileName: string
  url: string
  mimeType: string | null
  fileSize: number | null
  altText: string | null
  createdAt: string
}

export type TemplateStyle =
  // Legacy values
  | 'classic' | 'modern' | 'minimal'
  // School templates
  | 'school-classic' | 'school-modern' | 'school-vibrant' | 'school-minimal'
  // College templates
  | 'college-academic' | 'college-campus' | 'college-tech' | 'college-minimal'
  // Coaching templates
  | 'coaching-results' | 'coaching-professional' | 'coaching-dynamic' | 'coaching-clean'

export const SECTION_TYPES: { value: SectionType; label: string; description: string; icon: string }[] = [
  { value: 'hero', label: 'Welcome Banner', description: 'A large banner at the top of your page with a headline and button', icon: 'Image' },
  { value: 'about', label: 'About School', description: 'Share your school\'s story, mission, and vision', icon: 'Info' },
  { value: 'stats', label: 'Numbers & Highlights', description: 'Show key numbers like students, teachers, pass rate', icon: 'BarChart3' },
  { value: 'admissions', label: 'Admissions Info', description: 'Information about how to apply and enroll', icon: 'UserPlus' },
  { value: 'faculty', label: 'Our Teachers', description: 'Showcase your school\'s teaching staff', icon: 'Users' },
  { value: 'gallery', label: 'Photo Gallery', description: 'Display photos of your school campus and events', icon: 'Images' },
  { value: 'testimonials', label: 'Parent Reviews', description: 'What parents and students say about your school', icon: 'MessageSquareQuote' },
  { value: 'events', label: 'Upcoming Events', description: 'Show upcoming school events from your calendar', icon: 'Calendar' },
  { value: 'news', label: 'News & Updates', description: 'Share the latest news and announcements', icon: 'Newspaper' },
  { value: 'contact', label: 'Contact Details', description: 'Your school\'s address, phone, email, and a contact form', icon: 'Phone' },
  { value: 'custom_html', label: 'Custom Content', description: 'Add any custom content using HTML', icon: 'Code' },
]
