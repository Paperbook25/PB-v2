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
