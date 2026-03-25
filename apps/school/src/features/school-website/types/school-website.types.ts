// ==================== Section Content Types ====================

export interface HeroContent {
  headline: string
  subtitle: string
  backgroundImage: string
  ctaText: string
  ctaLink: string
  videoUrl?: string
  overlayColor?: string
  overlayOpacity?: number
  buttonStyle?: 'solid' | 'outline' | 'pill'
  mobileHeadline?: string
  secondaryCtaText?: string
  secondaryCtaLink?: string
}

export interface AboutContent {
  body: string
  image: string
  mission: string
  vision: string
  foundedYear?: number
  accreditationBadges?: { name: string; logo: string }[]
  timeline?: { year: string; event: string }[]
  values?: string[]
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
  eligibilityCriteria?: string
  admissionDates?: { startDate: string; endDate: string }
  documentsRequired?: string[]
  entranceExamInfo?: string
  feeRange?: string
  applicationSteps?: { step: number; title: string; description: string }[]
}

export interface FacultyContent {
  description: string
  showAll: boolean
  featured: string[]
}

export interface GalleryImage {
  url: string
  caption: string
  alt?: string
  category?: string
}
export interface GalleryContent {
  images: GalleryImage[]
  layout: 'grid' | 'masonry'
  categories?: string[]
  videoUrls?: { url: string; thumbnail: string; title: string }[]
  showCategoryFilter?: boolean
}

export interface TestimonialItem {
  name: string
  role: string
  quote: string
  avatar: string
  rating?: number
  relationship?: 'parent' | 'student' | 'alumni'
  videoUrl?: string
  batch?: string
  isVerified?: boolean
}
export interface TestimonialsContent {
  items: TestimonialItem[]
  showRatings?: boolean
  filterByRelationship?: boolean
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
  address?: { street: string; city: string; state: string; pincode: string }
  phones?: { label: string; number: string }[]
  emails?: { label: string; address: string }[]
  whatsappNumber?: string
  officeHours?: string
  appointmentUrl?: string
}

export interface CustomHtmlContent {
  html: string
}

// --- NEW SECTION CONTENT INTERFACES ---

export interface CourseItem { name: string; description: string; duration: string; eligibility: string; image: string; fees: string; category: string }
export interface CoursesContent { description: string; items: CourseItem[]; layout: 'grid' | 'list' | 'tabs'; showFees: boolean }

export interface TopperItem { name: string; score: string; photo: string; exam: string; rank: string; year: string }
export interface ResultHighlight { label: string; value: string; year: string }
export interface ResultsContent { description: string; highlights: ResultHighlight[]; toppers: TopperItem[]; showYearFilter: boolean }

export interface FeeRow { category: string; tuitionFee: string; otherFees: string; totalFee: string; installments: string }
export interface FeeStructureContent { description: string; rows: FeeRow[]; scholarshipInfo: string; paymentModes: string[]; disclaimerText: string }

export interface AccreditationBadge { name: string; logo: string; certNumber: string; verificationUrl: string; validUntil: string }
export interface AccreditationContent { description: string; badges: AccreditationBadge[] }

export interface FacilityItem { name: string; description: string; image: string; icon: string }
export interface InfrastructureContent { description: string; facilities: FacilityItem[]; layout: 'grid' | 'carousel' }

export interface PlacementStat { label: string; value: string }
export interface CompanyLogo { name: string; logo: string; url: string }
export interface PlacementsContent { description: string; stats: PlacementStat[]; companies: CompanyLogo[]; showStats: boolean }

export interface LeaderProfile { name: string; designation: string; photo: string; message: string; qualifications: string }
export interface LeadershipContent { description: string; leaders: LeaderProfile[]; layout: 'featured' | 'grid' }

export interface DownloadItem { title: string; description: string; fileUrl: string; fileType: string; fileSize: string; category: string }
export interface DownloadsContent { description: string; items: DownloadItem[]; showCategories: boolean }

export interface FaqItem { question: string; answer: string; category: string }
export interface FaqContent { description: string; items: FaqItem[]; showCategories: boolean }

export interface RouteInfo { name: string; areas: string[]; timing: string; vehicleType: string }
export interface TransportContent { description: string; routes: RouteInfo[]; features: string[]; contactNumber: string }

export interface ActivityItem { name: string; description: string; image: string; category: string }
export interface StudentLifeContent { description: string; activities: ActivityItem[]; layout: 'grid' | 'masonry' }

export interface SafetyFeature { title: string; description: string; icon: string }
export interface EmergencyContact { role: string; name: string; phone: string }
export interface SafetyContent { description: string; features: SafetyFeature[]; emergencyContacts: EmergencyContact[] }

export interface AlumniItem { name: string; batch: string; achievement: string; photo: string; currentRole: string; testimonial: string }
export interface AlumniContent { description: string; alumni: AlumniItem[]; networkUrl: string }

export interface TourStop { title: string; type: 'video' | '360' | 'embed'; url: string; thumbnail: string; description: string }
export interface VirtualTourContent { description: string; items: TourStop[]; primaryVideoUrl: string }

export interface CtaBannerContent { headline: string; subtitle: string; ctaText: string; ctaLink: string; secondaryCtaText: string; secondaryCtaLink: string; backgroundImage: string; backgroundColor: string; style: 'full' | 'contained' }

export type SectionType =
  | 'hero' | 'about' | 'stats' | 'admissions' | 'faculty' | 'gallery'
  | 'testimonials' | 'events' | 'news' | 'contact' | 'custom_html'
  | 'courses' | 'results' | 'fee_structure' | 'accreditation' | 'infrastructure'
  | 'placements' | 'leadership' | 'downloads' | 'faq' | 'transport'
  | 'student_life' | 'safety' | 'alumni' | 'virtual_tour' | 'cta_banner'

export type SectionContent =
  | HeroContent | AboutContent | StatsContent | AdmissionsContent
  | FacultyContent | GalleryContent | TestimonialsContent | EventsContent
  | NewsContent | ContactContent | CustomHtmlContent
  | CoursesContent | ResultsContent | FeeStructureContent | AccreditationContent
  | InfrastructureContent | PlacementsContent | LeadershipContent | DownloadsContent
  | FaqContent | TransportContent | StudentLifeContent | SafetyContent
  | AlumniContent | VirtualTourContent | CtaBannerContent

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
  { value: 'courses', label: 'Programs & Courses', description: 'Display educational programs, classes, and course details', icon: 'GraduationCap' },
  { value: 'results', label: 'Results & Achievements', description: 'Showcase board results, toppers, and success stories', icon: 'Trophy' },
  { value: 'fee_structure', label: 'Fee Structure', description: 'Display fee tables, scholarships, and payment information', icon: 'IndianRupee' },
  { value: 'accreditation', label: 'Accreditation', description: 'Show affiliations, certifications, and accreditation badges', icon: 'BadgeCheck' },
  { value: 'infrastructure', label: 'Infrastructure', description: 'Showcase campus facilities, labs, and amenities', icon: 'Building2' },
  { value: 'placements', label: 'Placements', description: 'Display placement statistics and recruiting companies', icon: 'Briefcase' },
  { value: 'leadership', label: 'Leadership', description: 'Feature principal\'s message and management team', icon: 'Crown' },
  { value: 'downloads', label: 'Downloads', description: 'Offer brochures, prospectus, and forms for download', icon: 'Download' },
  { value: 'faq', label: 'FAQs', description: 'Answer frequently asked questions', icon: 'HelpCircle' },
  { value: 'transport', label: 'Transport', description: 'Show bus routes, timings, and transport features', icon: 'Bus' },
  { value: 'student_life', label: 'Student Life', description: 'Showcase clubs, sports, and extracurricular activities', icon: 'PartyPopper' },
  { value: 'safety', label: 'Safety & Security', description: 'Display safety features and emergency information', icon: 'ShieldCheck' },
  { value: 'alumni', label: 'Alumni Network', description: 'Feature notable alumni and success stories', icon: 'Users' },
  { value: 'virtual_tour', label: 'Virtual Tour', description: 'Offer video tours and 360-degree campus views', icon: 'Video' },
  { value: 'cta_banner', label: 'Call to Action', description: 'Add conversion-focused banners and CTAs', icon: 'Megaphone' },
]
