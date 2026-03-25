import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'
import type { GalleryImage } from '../../../types/school-website.types'

export function GalleryMasonry({ section, theme }: VariantProps) {
  const images = field<GalleryImage[]>(section.content, 'images', [])
  const title = section.title || 'Gallery'

  const fallbackImages: GalleryImage[] = Array.from({ length: 8 }, (_, i) => ({
    url: '',
    caption: `Photo ${i + 1}`,
  }))

  const displayImages = images.length > 0 ? images : fallbackImages

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        {/* CSS columns masonry */}
        <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {displayImages.map((img, idx) => {
            // Alternate aspect ratios for visual variety
            const tall = idx % 3 === 0
            return (
              <div
                key={idx}
                className={`group relative mb-4 break-inside-avoid overflow-hidden ${radiusClass(theme.cornerRadius)}`}
              >
                {img.url ? (
                  <img
                    src={img.url}
                    alt={img.caption || `Gallery image ${idx + 1}`}
                    className={`w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      tall ? 'aspect-[3/4]' : 'aspect-[4/3]'
                    }`}
                  />
                ) : (
                  <div
                    className={`flex items-center justify-center text-white/50 ${
                      tall ? 'aspect-[3/4]' : 'aspect-[4/3]'
                    }`}
                    style={{ backgroundColor: theme.defaultPrimaryColor }}
                  >
                    <span className="text-xs">{img.caption || 'Photo'}</span>
                  </div>
                )}
                {img.caption && img.url && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="text-sm text-white">{img.caption}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
