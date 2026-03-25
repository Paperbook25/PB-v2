import { useState } from 'react'
import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'

interface TourMedia {
  url: string
  thumbnail: string
  title: string
  type: 'video' | '360' | 'tour'
}

export function VirtualTourHero({ section, theme }: VariantProps) {
  const mediaItems = field<TourMedia[]>(section.content, 'media', [])
  const title = section.title || 'Virtual Tour'

  const fallbackItems: TourMedia[] = [
    { url: '', thumbnail: '', title: 'Campus Overview', type: 'video' },
    { url: '', thumbnail: '', title: 'Science Labs', type: '360' },
    { url: '', thumbnail: '', title: 'Sports Complex', type: 'video' },
    { url: '', thumbnail: '', title: 'Library', type: 'tour' },
    { url: '', thumbnail: '', title: 'Auditorium', type: '360' },
  ]

  const displayItems = mediaItems.length > 0 ? mediaItems : fallbackItems
  const [activeIndex, setActiveIndex] = useState(0)
  const primary = displayItems[activeIndex]
  const thumbnails = displayItems.filter((_, i) => i !== activeIndex).slice(0, 4)

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        <div className="mt-12 flex flex-col gap-4 lg:flex-row">
          {/* Primary media — 70% */}
          <div className={`relative w-full overflow-hidden lg:w-[70%] ${radiusClass(theme.cornerRadius)}`}>
            {primary?.url ? (
              <iframe
                src={primary.url}
                title={primary.title}
                className="aspect-video w-full"
                allowFullScreen
              />
            ) : (
              <div
                className="flex aspect-video items-center justify-center text-white/50"
                style={{ backgroundColor: theme.defaultPrimaryColor }}
              >
                <div className="text-center">
                  {/* Play icon */}
                  <svg className="mx-auto h-16 w-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <p className="mt-2 text-sm">{primary?.title || 'Video'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnail grid — 30% */}
          <div className="grid w-full grid-cols-2 gap-3 lg:w-[30%]">
            {thumbnails.map((item, idx) => {
              const originalIndex = displayItems.indexOf(item)
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(originalIndex)}
                  className={`group relative overflow-hidden ${radiusClass(theme.cornerRadius)}`}
                >
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="aspect-video w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex aspect-video items-center justify-center text-white/40"
                      style={{ backgroundColor: `${theme.defaultPrimaryColor}cc` }}
                    >
                      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
                    <p className="truncate text-xs font-medium text-white">{item.title}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
