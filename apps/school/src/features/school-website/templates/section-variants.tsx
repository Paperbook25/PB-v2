import type { ComponentType } from 'react'
import type { TemplateTheme } from './registry'
import type { WebsiteSection } from '../types/school-website.types'

// ==================== Variant props interface ====================

export interface VariantProps {
  section: WebsiteSection
  theme: TemplateTheme
}

// ==================== Hero variants ====================
import { HeroBanner } from './variants/hero/HeroBanner'
import { HeroSplit } from './variants/hero/HeroSplit'
import { HeroVideo } from './variants/hero/HeroVideo'
import { HeroMinimal } from './variants/hero/HeroMinimal'

// ==================== About variants ====================
import { AboutClassic } from './variants/about/AboutClassic'
import { AboutSplit } from './variants/about/AboutSplit'
import { AboutMinimal } from './variants/about/AboutMinimal'

// ==================== Stats variants ====================
import { StatsCards } from './variants/stats/StatsCards'
import { StatsCounters } from './variants/stats/StatsCounters'
import { StatsMinimal } from './variants/stats/StatsMinimal'

// ==================== Testimonials variants ====================
import { TestimonialsCards } from './variants/testimonials/TestimonialsCards'
import { TestimonialsCarousel } from './variants/testimonials/TestimonialsCarousel'
import { TestimonialsGrid } from './variants/testimonials/TestimonialsGrid'

// ==================== Admissions variants ====================
import { AdmissionsCTA } from './variants/admissions/AdmissionsCTA'
import { AdmissionsForm } from './variants/admissions/AdmissionsForm'
import { AdmissionsMinimal } from './variants/admissions/AdmissionsMinimal'

// ==================== Gallery variants ====================
import { GalleryGrid } from './variants/gallery/GalleryGrid'
import { GalleryMasonry } from './variants/gallery/GalleryMasonry'

// ==================== Contact variants ====================
import { ContactSplit } from './variants/contact/ContactSplit'
import { ContactStacked } from './variants/contact/ContactStacked'

// ==================== Faculty variants ====================
import { FacultyGrid } from './variants/faculty/FacultyGrid'
import { FacultyCards } from './variants/faculty/FacultyCards'

// ==================== News variants ====================
import { NewsCards } from './variants/news/NewsCards'
import { NewsList } from './variants/news/NewsList'

// ==================== Events variants ====================
import { EventsCards } from './variants/events/EventsCards'
import { EventsTimeline } from './variants/events/EventsTimeline'

// ==================== Courses variants ====================
import { CoursesGrid } from './variants/courses/CoursesGrid'
import { CoursesList } from './variants/courses/CoursesList'
import { CoursesTabs } from './variants/courses/CoursesTabs'

// ==================== Results variants ====================
import { ResultsShowcase } from './variants/results/ResultsShowcase'
import { ResultsGrid } from './variants/results/ResultsGrid'
import { ResultsTimeline } from './variants/results/ResultsTimeline'

// ==================== Fee Structure variants ====================
import { FeeTable } from './variants/fee_structure/FeeTable'
import { FeeCards } from './variants/fee_structure/FeeCards'
import { FeeMinimal } from './variants/fee_structure/FeeMinimal'

// ==================== Accreditation variants ====================
import { AccreditationBadges } from './variants/accreditation/AccreditationBadges'
import { AccreditationCards } from './variants/accreditation/AccreditationCards'
import { AccreditationMinimal } from './variants/accreditation/AccreditationMinimal'

// ==================== Infrastructure variants ====================
import { InfraGrid } from './variants/infrastructure/InfraGrid'
import { InfraCarousel } from './variants/infrastructure/InfraCarousel'
import { InfraMinimal } from './variants/infrastructure/InfraMinimal'

// ==================== Placements variants ====================
import { PlacementsShowcase } from './variants/placements/PlacementsShowcase'
import { PlacementsGrid } from './variants/placements/PlacementsGrid'
import { PlacementsMinimal } from './variants/placements/PlacementsMinimal'

// ==================== Leadership variants ====================
import { LeadershipFeatured } from './variants/leadership/LeadershipFeatured'
import { LeadershipGrid } from './variants/leadership/LeadershipGrid'
import { LeadershipMinimal } from './variants/leadership/LeadershipMinimal'

// ==================== Downloads variants ====================
import { DownloadsGrid } from './variants/downloads/DownloadsGrid'
import { DownloadsList } from './variants/downloads/DownloadsList'

// ==================== FAQ variants ====================
import { FaqAccordion } from './variants/faq/FaqAccordion'
import { FaqCategorized } from './variants/faq/FaqCategorized'
import { FaqMinimal } from './variants/faq/FaqMinimal'

// ==================== Transport variants ====================
import { TransportCards } from './variants/transport/TransportCards'
import { TransportList } from './variants/transport/TransportList'

// ==================== Student Life variants ====================
import { StudentLifeGrid } from './variants/student_life/StudentLifeGrid'
import { StudentLifeMasonry } from './variants/student_life/StudentLifeMasonry'
import { StudentLifeMinimal } from './variants/student_life/StudentLifeMinimal'

// ==================== Safety variants ====================
import { SafetyGrid } from './variants/safety/SafetyGrid'
import { SafetyMinimal } from './variants/safety/SafetyMinimal'

// ==================== Alumni variants ====================
import { AlumniCards } from './variants/alumni/AlumniCards'
import { AlumniCarousel } from './variants/alumni/AlumniCarousel'
import { AlumniMinimal } from './variants/alumni/AlumniMinimal'

// ==================== Virtual Tour variants ====================
import { VirtualTourHero } from './variants/virtual_tour/VirtualTourHero'
import { VirtualTourGallery } from './variants/virtual_tour/VirtualTourGallery'

// ==================== CTA Banner variants ====================
import { CtaBannerFull } from './variants/cta_banner/CtaBannerFull'
import { CtaBannerContained } from './variants/cta_banner/CtaBannerContained'
import { CtaBannerMinimal } from './variants/cta_banner/CtaBannerMinimal'

// ==================== Variant map ====================

export const VARIANT_MAP: Record<string, Record<string, ComponentType<VariantProps>>> = {
  hero: {
    banner: HeroBanner,
    split: HeroSplit,
    video: HeroVideo,
    minimal: HeroMinimal,
  },
  about: {
    classic: AboutClassic,
    split: AboutSplit,
    minimal: AboutMinimal,
  },
  stats: {
    cards: StatsCards,
    counters: StatsCounters,
    minimal: StatsMinimal,
  },
  testimonials: {
    cards: TestimonialsCards,
    carousel: TestimonialsCarousel,
    grid: TestimonialsGrid,
  },
  admissions: {
    cta: AdmissionsCTA,
    form: AdmissionsForm,
    minimal: AdmissionsMinimal,
  },
  gallery: {
    grid: GalleryGrid,
    masonry: GalleryMasonry,
  },
  contact: {
    split: ContactSplit,
    stacked: ContactStacked,
  },
  faculty: {
    grid: FacultyGrid,
    cards: FacultyCards,
  },
  news: {
    cards: NewsCards,
    list: NewsList,
  },
  events: {
    cards: EventsCards,
    timeline: EventsTimeline,
  },
  courses: {
    grid: CoursesGrid,
    list: CoursesList,
    tabs: CoursesTabs,
  },
  results: {
    showcase: ResultsShowcase,
    grid: ResultsGrid,
    timeline: ResultsTimeline,
  },
  fee_structure: {
    table: FeeTable,
    cards: FeeCards,
    minimal: FeeMinimal,
  },
  accreditation: {
    badges: AccreditationBadges,
    cards: AccreditationCards,
    minimal: AccreditationMinimal,
  },
  infrastructure: {
    grid: InfraGrid,
    carousel: InfraCarousel,
    minimal: InfraMinimal,
  },
  placements: {
    showcase: PlacementsShowcase,
    grid: PlacementsGrid,
    minimal: PlacementsMinimal,
  },
  leadership: {
    featured: LeadershipFeatured,
    grid: LeadershipGrid,
    minimal: LeadershipMinimal,
  },
  downloads: {
    grid: DownloadsGrid,
    list: DownloadsList,
  },
  faq: {
    accordion: FaqAccordion,
    categorized: FaqCategorized,
    minimal: FaqMinimal,
  },
  transport: {
    cards: TransportCards,
    list: TransportList,
  },
  student_life: {
    grid: StudentLifeGrid,
    masonry: StudentLifeMasonry,
    minimal: StudentLifeMinimal,
  },
  safety: {
    grid: SafetyGrid,
    minimal: SafetyMinimal,
  },
  alumni: {
    cards: AlumniCards,
    carousel: AlumniCarousel,
    minimal: AlumniMinimal,
  },
  virtual_tour: {
    hero: VirtualTourHero,
    gallery: VirtualTourGallery,
  },
  cta_banner: {
    full: CtaBannerFull,
    contained: CtaBannerContained,
    minimal: CtaBannerMinimal,
  },
}

// ==================== Lookup helper ====================

/**
 * Resolve the React component for a given section type and variant name.
 * Falls back to the first available variant for that section type if the
 * requested variant is not found.
 */
export function getVariantComponent(
  sectionType: string,
  variantName: string,
): ComponentType<VariantProps> | undefined {
  const variants = VARIANT_MAP[sectionType]
  if (!variants) return undefined
  return variants[variantName] ?? Object.values(variants)[0]
}
