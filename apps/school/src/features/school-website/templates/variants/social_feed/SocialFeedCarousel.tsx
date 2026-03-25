import type React from 'react'
import { useRef } from 'react'
import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, cardClass, field } from '../shared'

function InstagramSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  )
}

function FacebookSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  )
}

function TwitterSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function YoutubeSvg({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

interface PlatformCard {
  name: string
  url: string
  color: string
  icon: React.ReactNode
  description: string
}

export function SocialFeedCarousel({ section, theme }: VariantProps) {
  const instagramUrl = field(section.content, 'instagramUrl', '')
  const facebookUrl = field(section.content, 'facebookUrl', '')
  const twitterUrl = field(section.content, 'twitterUrl', '')
  const youtubeChannelUrl = field(section.content, 'youtubeChannelUrl', '')
  const showFollowButtons = field(section.content, 'showFollowButtons', true)
  const title = section.title || 'Follow Us on Social Media'

  const scrollRef = useRef<HTMLDivElement>(null)

  const platforms: PlatformCard[] = [
    {
      name: 'Instagram',
      url: instagramUrl,
      color: '#E4405F',
      icon: <InstagramSvg className="w-8 h-8" />,
      description: 'Follow us for photos and stories from campus life.',
    },
    {
      name: 'Facebook',
      url: facebookUrl,
      color: '#1877F2',
      icon: <FacebookSvg className="w-8 h-8" />,
      description: 'Like our page for news, events, and community updates.',
    },
    {
      name: 'Twitter / X',
      url: twitterUrl,
      color: '#000000',
      icon: <TwitterSvg className="w-8 h-8" />,
      description: 'Follow us for quick updates and announcements.',
    },
    {
      name: 'YouTube',
      url: youtubeChannelUrl,
      color: '#FF0000',
      icon: <YoutubeSvg className="w-8 h-8" />,
      description: 'Subscribe for videos, virtual tours, and event recordings.',
    },
  ].filter(p => p.url)

  if (platforms.length === 0) {
    return null
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 320
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2
              className="text-3xl font-bold sm:text-4xl"
              style={{ color: theme.defaultPrimaryColor }}
            >
              {title}
            </h2>
            <p className="mt-3 text-gray-500">
              Stay connected with us across social media platforms
            </p>
          </div>

          {platforms.length > 2 && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scroll('left')}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors"
                aria-label="Scroll left"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={() => scroll('right')}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-400 transition-colors"
                aria-label="Scroll right"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {platforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${cardClass(theme.cardStyle, theme.cornerRadius)} flex-shrink-0 w-72 p-6 flex flex-col items-center text-center gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group snap-start`}
            >
              <div
                className={`w-16 h-16 ${radiusClass(theme.cornerRadius)} flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110`}
                style={{ backgroundColor: platform.color }}
              >
                {platform.icon}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {platform.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {platform.description}
                </p>
              </div>

              {showFollowButtons && (
                <span
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white ${radiusClass(theme.cornerRadius)} transition-opacity group-hover:opacity-90`}
                  style={{ backgroundColor: platform.color }}
                >
                  Follow Us
                  <svg className="ml-1.5 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
