import { useEffect } from 'react'

interface SeoHeadProps {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogUrl?: string
  jsonLd?: object
  faviconUrl?: string
  gaTrackingId?: string
}

export function SeoHead({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  jsonLd,
  faviconUrl,
  gaTrackingId,
}: SeoHeadProps) {
  useEffect(() => {
    if (title) document.title = title

    function setMeta(nameOrProperty: string, content: string, isProperty?: boolean) {
      const attr = isProperty ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${nameOrProperty}"]`) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute(attr, nameOrProperty)
        document.head.appendChild(el)
      }
      el.content = content
    }

    if (description) setMeta('description', description)

    if (ogTitle) setMeta('og:title', ogTitle, true)
    if (ogDescription) setMeta('og:description', ogDescription, true)
    if (ogImage) setMeta('og:image', ogImage, true)
    if (ogUrl) setMeta('og:url', ogUrl, true)
    setMeta('og:type', 'website', true)

    // Twitter card tags
    setMeta('twitter:card', 'summary_large_image')
    if (ogTitle) setMeta('twitter:title', ogTitle)
    if (ogDescription) setMeta('twitter:description', ogDescription)
    if (ogImage) setMeta('twitter:image', ogImage)

    // JSON-LD structured data
    if (jsonLd) {
      let script = document.querySelector('#pb-jsonld') as HTMLScriptElement | null
      if (!script) {
        script = document.createElement('script')
        script.id = 'pb-jsonld'
        script.type = 'application/ld+json'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(jsonLd)
    }

    // Favicon
    if (faviconUrl) {
      let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = faviconUrl
    }

    // Google Analytics 4
    if (gaTrackingId && gaTrackingId.startsWith('G-')) {
      const scriptSrc = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaTrackingId)}`
      if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
        const gtagScript = document.createElement('script')
        gtagScript.async = true
        gtagScript.src = scriptSrc
        document.head.appendChild(gtagScript)

        const inlineScript = document.createElement('script')
        inlineScript.id = 'pb-ga-init'
        inlineScript.textContent = [
          'window.dataLayer = window.dataLayer || [];',
          'function gtag(){dataLayer.push(arguments);}',
          "gtag('js', new Date());",
          `gtag('config', '${gaTrackingId}');`,
        ].join('\n')
        document.head.appendChild(inlineScript)
      }
    }

    return () => {
      document.querySelector('#pb-jsonld')?.remove()
    }
  }, [title, description, ogTitle, ogDescription, ogImage, ogUrl, jsonLd, faviconUrl, gaTrackingId])

  return null
}
