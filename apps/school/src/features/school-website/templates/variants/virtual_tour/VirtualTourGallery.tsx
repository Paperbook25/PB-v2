import { useState } from 'react'
import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface TourMedia {
  url: string
  thumbnail: string
  title: string
  type: 'video' | '360' | 'tour'
}

export function VirtualTourGallery({ section, theme }: VariantProps) {
  const mediaItems = field<TourMedia[]>(section.content, 'media', [])
  const title = section.title || 'Virtual Tour'

  const fallbackItems: TourMedia[] = [
    { url: '', thumbnail: '', title: 'Campus Overview', type: 'video' },
    { url: '', thumbnail: '', title: 'Science Labs', type: '360' },
    { url: '', thumbnail: '', title: 'Sports Complex', type: 'video' },
    { url: '', thumbnail: '', title: 'Library', type: 'tour' },
    { url: '', thumbnail: '', title: 'Auditorium', type: '360' },
    { url: '', thumbnail: '', title: 'Playground', type: 'video' },
  ]

  const displayItems = mediaItems.length > 0 ? mediaItems : fallbackItems
  const [modalIndex, setModalIndex] = useState<number | null>(null)

  const typeBadgeColor = (type: string) => {
    switch (type) {
      case '360': return '#e65100'
      case 'tour': return '#2e7d32'
      default: return theme.defaultAccentColor
    }
  }

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        {/* Grid */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setModalIndex(idx)}
              className={`group relative overflow-hidden text-left ${radiusClass(theme.cornerRadius)}`}
            >
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="aspect-video w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <div
                  className="flex aspect-video items-center justify-center text-white/30"
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  <span className="text-xs">{item.title}</span>
                </div>
              )}

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
                  <svg className="h-6 w-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Type badge */}
              <span
                className={`absolute right-2 top-2 px-2 py-0.5 text-xs font-semibold uppercase text-white ${radiusClass(theme.cornerRadius)}`}
                style={{ backgroundColor: typeBadgeColor(item.type) }}
              >
                {item.type}
              </span>

              {/* Title */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                <p className="text-sm font-medium text-white">{item.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setModalIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`relative w-full max-w-4xl overflow-hidden bg-black ${radiusClass(theme.cornerRadius)}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModalIndex(null)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/40"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {displayItems[modalIndex]?.url ? (
              <iframe
                src={displayItems[modalIndex].url}
                title={displayItems[modalIndex].title}
                className="aspect-video w-full"
                allowFullScreen
              />
            ) : (
              <div className="flex aspect-video items-center justify-center text-white/50">
                <div className="text-center">
                  <svg className="mx-auto h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <p className="mt-2">{displayItems[modalIndex]?.title}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
