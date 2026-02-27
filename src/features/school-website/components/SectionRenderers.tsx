import type {
  WebsiteSection, HeroContent, AboutContent, StatsContent, AdmissionsContent,
  GalleryContent, TestimonialsContent, EventsContent, NewsContent,
  ContactContent, CustomHtmlContent, FacultyContent,
} from '../types/school-website.types'

function getContent<T>(section: WebsiteSection): T {
  return section.content as unknown as T
}

// ==================== Hero ====================
function HeroRenderer({ section, template }: { section: WebsiteSection; template: string }) {
  const c = getContent<HeroContent>(section)
  const isModern = template === 'modern'
  const isMinimal = template === 'minimal'
  return (
    <div className={`relative py-24 px-6 text-center ${isMinimal ? 'bg-gray-50' : 'bg-gradient-to-br from-blue-900 to-blue-700'}`}>
      {c.backgroundImage && (
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${c.backgroundImage})` }} />
      )}
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className={`font-bold mb-4 ${isMinimal ? 'text-4xl text-gray-900' : isModern ? 'text-5xl text-white' : 'text-4xl text-white font-serif'}`}>
          {c.headline || 'Welcome'}
        </h1>
        <p className={`text-lg mb-8 ${isMinimal ? 'text-gray-600' : 'text-blue-100'}`}>
          {c.subtitle || ''}
        </p>
        {c.ctaText && (
          <a href={c.ctaLink || '#'} className={`inline-block px-8 py-3 font-semibold rounded-lg transition ${isMinimal ? 'bg-gray-900 text-white hover:bg-gray-800' : isModern ? 'bg-white text-blue-900 hover:bg-blue-50 rounded-full' : 'bg-amber-500 text-white hover:bg-amber-600'}`}>
            {c.ctaText}
          </a>
        )}
      </div>
    </div>
  )
}

// ==================== About ====================
function AboutRenderer({ section, template }: { section: WebsiteSection; template: string }) {
  const c = getContent<AboutContent>(section)
  const isMinimal = template === 'minimal'
  return (
    <div className={`py-16 px-6 ${isMinimal ? 'max-w-3xl' : 'max-w-6xl'} mx-auto`}>
      <h2 className={`text-3xl font-bold mb-8 ${isMinimal ? 'font-light' : template === 'classic' ? 'font-serif' : ''} text-gray-900`}>
        {section.title || 'About Us'}
      </h2>
      <div className={`grid ${c.image ? 'md:grid-cols-2' : 'grid-cols-1'} gap-8`}>
        <div>
          <p className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">{c.body || ''}</p>
          {c.mission && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">Our Mission</h3>
              <p className="text-gray-600">{c.mission}</p>
            </div>
          )}
          {c.vision && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Our Vision</h3>
              <p className="text-gray-600">{c.vision}</p>
            </div>
          )}
        </div>
        {c.image && (
          <div className="rounded-lg overflow-hidden">
            <img src={c.image} alt="About" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== Stats ====================
function StatsRenderer({ section, template }: { section: WebsiteSection; template: string }) {
  const c = getContent<StatsContent>(section)
  const isModern = template === 'modern'
  return (
    <div className={`py-16 px-6 ${isModern ? 'bg-blue-50' : 'bg-gray-100'}`}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">{section.title || 'By The Numbers'}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(c.items || []).map((item, i) => (
            <div key={i} className={`text-center p-6 ${isModern ? 'bg-white rounded-2xl shadow-sm' : 'bg-white rounded-lg shadow'}`}>
              <div className="text-3xl font-bold text-blue-600 mb-2">{item.value}</div>
              <div className="text-gray-600 text-sm">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==================== Admissions ====================
function AdmissionsRenderer({ section }: { section: WebsiteSection }) {
  const c = getContent<AdmissionsContent>(section)
  return (
    <div className="py-16 px-6 bg-blue-900 text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">{section.title || 'Admissions'}</h2>
        <p className="text-blue-100 mb-8 whitespace-pre-wrap">{c.body || ''}</p>
        {c.ctaText && (
          <a href={c.ctaLink || '/apply'} className="inline-block px-8 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition">
            {c.ctaText}
          </a>
        )}
      </div>
    </div>
  )
}

// ==================== Faculty ====================
function FacultyRenderer({ section }: { section: WebsiteSection }) {
  const c = getContent<FacultyContent>(section)
  return (
    <div className="py-16 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">{section.title || 'Our Faculty'}</h2>
      {c.description && <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">{c.description}</p>}
      <p className="text-center text-gray-500 italic">Faculty data is loaded dynamically from PaperBook.</p>
    </div>
  )
}

// ==================== Gallery ====================
function GalleryRenderer({ section }: { section: WebsiteSection }) {
  const c = getContent<GalleryContent>(section)
  return (
    <div className="py-16 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">{section.title || 'Gallery'}</h2>
      <div className={`grid gap-4 ${c.layout === 'masonry' ? 'columns-2 md:columns-3' : 'grid-cols-2 md:grid-cols-3'}`}>
        {(c.images || []).map((img, i) => (
          <div key={i} className="relative group overflow-hidden rounded-lg">
            <img src={img.url} alt={img.caption || ''} className="w-full h-48 object-cover" />
            {img.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-sm p-2 opacity-0 group-hover:opacity-100 transition">
                {img.caption}
              </div>
            )}
          </div>
        ))}
        {(!c.images || c.images.length === 0) && (
          <p className="col-span-3 text-center text-gray-400 py-12">No images added yet.</p>
        )}
      </div>
    </div>
  )
}

// ==================== Testimonials ====================
function TestimonialsRenderer({ section, template }: { section: WebsiteSection; template: string }) {
  const c = getContent<TestimonialsContent>(section)
  const isModern = template === 'modern'
  return (
    <div className={`py-16 px-6 ${isModern ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">{section.title || 'Testimonials'}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(c.items || []).map((item, i) => (
            <div key={i} className={`p-6 ${isModern ? 'bg-white rounded-2xl shadow-sm' : 'bg-gray-50 rounded-lg border'}`}>
              <p className="text-gray-700 mb-4 italic">"{item.quote}"</p>
              <div className="flex items-center gap-3">
                {item.avatar && <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full" />}
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{item.name}</div>
                  <div className="text-gray-500 text-xs">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==================== Events ====================
function EventsRenderer({ section }: { section: WebsiteSection }) {
  return (
    <div className="py-16 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">{section.title || 'Upcoming Events'}</h2>
      <p className="text-center text-gray-500 italic">Events are loaded dynamically from PaperBook calendar.</p>
    </div>
  )
}

// ==================== News ====================
function NewsRenderer({ section }: { section: WebsiteSection }) {
  const c = getContent<NewsContent>(section)
  return (
    <div className="py-16 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">{section.title || 'Latest News'}</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(c.items || []).map((item, i) => (
          <div key={i} className="bg-white rounded-lg border overflow-hidden">
            {item.image && <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />}
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-1">{item.date}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-3">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==================== Contact ====================
function ContactRenderer({ section }: { section: WebsiteSection }) {
  const c = getContent<ContactContent>(section)
  return (
    <div className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">{section.title || 'Contact Us'}</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            {c.additionalInfo && (
              <p className="text-gray-700 whitespace-pre-wrap mb-6">{c.additionalInfo}</p>
            )}
            {c.showForm && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold mb-4">Send us a message</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Name" className="w-full px-3 py-2 border rounded-md" />
                  <input type="email" placeholder="Email" className="w-full px-3 py-2 border rounded-md" />
                  <textarea placeholder="Message" rows={4} className="w-full px-3 py-2 border rounded-md" />
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Send</button>
                </div>
              </div>
            )}
          </div>
          {c.showMap && c.mapEmbed && (
            <div className="rounded-lg overflow-hidden" dangerouslySetInnerHTML={{ __html: c.mapEmbed }} />
          )}
        </div>
      </div>
    </div>
  )
}

// ==================== Custom HTML ====================
function CustomHtmlRenderer({ section }: { section: WebsiteSection }) {
  const c = getContent<CustomHtmlContent>(section)
  return (
    <div className="py-8 px-6 max-w-6xl mx-auto" dangerouslySetInnerHTML={{ __html: c.html || '' }} />
  )
}

// ==================== Main Renderer ====================

export function SectionRenderer({ section, template = 'classic' }: { section: WebsiteSection; template?: string }) {
  switch (section.type) {
    case 'hero': return <HeroRenderer section={section} template={template} />
    case 'about': return <AboutRenderer section={section} template={template} />
    case 'stats': return <StatsRenderer section={section} template={template} />
    case 'admissions': return <AdmissionsRenderer section={section} />
    case 'faculty': return <FacultyRenderer section={section} />
    case 'gallery': return <GalleryRenderer section={section} />
    case 'testimonials': return <TestimonialsRenderer section={section} template={template} />
    case 'events': return <EventsRenderer section={section} />
    case 'news': return <NewsRenderer section={section} />
    case 'contact': return <ContactRenderer section={section} />
    case 'custom_html': return <CustomHtmlRenderer section={section} />
    default: return <div className="py-8 px-6 text-center text-gray-400">Unknown section type: {section.type}</div>
  }
}
