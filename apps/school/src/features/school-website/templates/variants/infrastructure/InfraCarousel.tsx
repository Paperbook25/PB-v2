import { useState } from 'react'
import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface Facility {
  name: string
  description: string
  image: string
}

export function InfraCarousel({ section, theme }: VariantProps) {
  const sectionTitle = section.title || 'Our Infrastructure'
  const facilities = field<Facility[]>(section.content, 'facilities', [])

  const fallbackFacilities: Facility[] = [
    { name: 'Science Laboratories', description: 'State-of-the-art physics, chemistry, and biology labs.', image: '' },
    { name: 'Library & Resource Center', description: 'Over 20,000 books, journals, and digital resources.', image: '' },
    { name: 'Sports Complex', description: 'Multi-sport facility with cricket ground and basketball courts.', image: '' },
    { name: 'Smart Classrooms', description: 'Interactive smart boards and projectors in every classroom.', image: '' },
  ]

  const displayFacilities = facilities.length > 0 ? facilities : fallbackFacilities
  const [currentIndex, setCurrentIndex] = useState(0)
  const current = displayFacilities[currentIndex]

  const prev = () => setCurrentIndex((i) => (i === 0 ? displayFacilities.length - 1 : i - 1))
  const next = () => setCurrentIndex((i) => (i === displayFacilities.length - 1 ? 0 : i + 1))

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {sectionTitle}
        </h2>

        {/* Carousel */}
        <div className={`relative mt-10 overflow-hidden ${radiusClass(theme.cornerRadius)}`}>
          {/* Image / placeholder */}
          {current.image ? (
            <img
              src={current.image}
              alt={current.name}
              className="h-[28rem] w-full object-cover"
            />
          ) : (
            <div
              className="flex h-[28rem] items-center justify-center text-6xl text-white/30"
              style={{ backgroundColor: theme.defaultPrimaryColor }}
            >
              {current.name.charAt(0)}
            </div>
          )}

          {/* Overlay text */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-8 pb-8 pt-24">
            <h3 className="text-2xl font-bold text-white">{current.name}</h3>
            <p className="mt-2 max-w-xl text-sm text-white/80">{current.description}</p>
          </div>

          {/* Prev/Next arrows */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow transition-colors hover:bg-white"
            aria-label="Previous facility"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-800 shadow transition-colors hover:bg-white"
            aria-label="Next facility"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {displayFacilities.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-white' : 'bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
