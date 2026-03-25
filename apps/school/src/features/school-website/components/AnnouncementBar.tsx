import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

interface AnnouncementBarProps {
  text: string
  link?: string
  accentColor: string
}

function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0 // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36)
}

export function AnnouncementBar({ text, link, accentColor }: AnnouncementBarProps) {
  const dismissKey = `pb-announcement-dismissed-${hashString(text)}`
  const [isDismissed, setIsDismissed] = useState(true) // start hidden to avoid flash
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(dismissKey)
    if (!dismissed) {
      setIsDismissed(false)
      // Trigger slide-down animation after mount
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    }
  }, [dismissKey])

  const handleDismiss = () => {
    setIsVisible(false)
    // Wait for animation to complete before hiding
    setTimeout(() => {
      setIsDismissed(true)
      localStorage.setItem(dismissKey, '1')
    }, 300)
  }

  if (isDismissed) return null

  const content = (
    <span className="text-white text-xs sm:text-sm font-medium">
      {text}
    </span>
  )

  return (
    <div
      className="w-full relative z-50 transition-all duration-300 ease-out overflow-hidden"
      style={{
        backgroundColor: accentColor,
        maxHeight: isVisible ? '48px' : '0px',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-2 relative">
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline underline-offset-2"
          >
            {content}
          </a>
        ) : (
          content
        )}

        <button
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="absolute right-4 sm:right-6 lg:right-8 p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
