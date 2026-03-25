import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'
import type { GalleryImage } from '../../../types/school-website.types'

export function GalleryGrid({ section, theme }: VariantProps) {
  const images = field<GalleryImage[]>(section.content, 'images', [])
  const title = section.title || 'Gallery'

  const fallbackImages: GalleryImage[] = Array.from({ length: 6 }, (_, i) => ({
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

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {displayImages.map((img, idx) => (
            <div
              key={idx}
              className={`group relative overflow-hidden ${radiusClass(theme.cornerRadius)}`}
            >
              {img.url ? (
                <img
                  src={img.url}
                  alt={img.caption || `Gallery image ${idx + 1}`}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div
                  className="flex aspect-[4/3] items-center justify-center text-white/50"
                  style={{ backgroundColor: theme.defaultPrimaryColor }}
                >
                  <span className="text-xs">{img.caption || 'Photo'}</span>
                </div>
              )}
              {img.caption && img.url && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                  <p className="text-sm text-white">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
