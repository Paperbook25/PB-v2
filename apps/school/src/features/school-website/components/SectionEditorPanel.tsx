import { useState, useEffect, useRef, useCallback } from 'react'
import type { WebsiteSection, SectionType } from '../types/school-website.types'
import { SECTION_TYPES } from '../types/school-website.types'
import { Check, Loader2 } from 'lucide-react'
import { MediaUploader } from './MediaUploader'

interface SectionEditorPanelProps {
  section: WebsiteSection
  onUpdate: (content: Record<string, unknown>, title?: string) => void
}

function useAutoSave(
  section: WebsiteSection,
  onUpdate: (content: Record<string, unknown>, title?: string) => void,
) {
  const [fields, setFields] = useState<Record<string, unknown>>(section.content as Record<string, unknown> || {})
  const [title, setTitle] = useState(section.title || '')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fieldsRef = useRef(fields)
  const titleRef = useRef(title)
  fieldsRef.current = fields
  titleRef.current = title

  // Reset when section changes
  useEffect(() => {
    setFields(section.content as Record<string, unknown> || {})
    setTitle(section.title || '')
    setSaveStatus('idle')
  }, [section.id, section.content, section.title])

  const triggerSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setSaveStatus('saving')
      onUpdate(fieldsRef.current, titleRef.current || undefined)
      setTimeout(() => setSaveStatus('saved'), 300)
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 800)
  }, [onUpdate])

  const updateFields = useCallback((newFields: Record<string, unknown>) => {
    setFields(newFields)
    triggerSave()
  }, [triggerSave])

  const updateTitle = useCallback((newTitle: string) => {
    setTitle(newTitle)
    triggerSave()
  }, [triggerSave])

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  return { fields, setFields: updateFields, title, setTitle: updateTitle, saveStatus }
}

function TextField({ label, value, onChange, multiline = false, hint }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; hint?: string
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
      )}
    </div>
  )
}

function CheckboxField({ label, value, onChange, hint }: {
  label: string; value: boolean; onChange: (v: boolean) => void; hint?: string
}) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={value}
        onChange={e => onChange(e.target.checked)}
        className="rounded mt-0.5"
      />
      <div>
        <span className="text-sm text-gray-700">{label}</span>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    </label>
  )
}

function ImageField({ label, value, onChange, hint }: {
  label: string; value: string; onChange: (v: string) => void; hint?: string
}) {
  const [showUploader, setShowUploader] = useState(false)
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      <div className="flex gap-2 items-start">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Paste URL or upload a file"
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <MediaUploader
          compact
          onUpload={(url) => {
            onChange(url)
            setShowUploader(false)
          }}
        />
      </div>
      {!showUploader && value && (
        <img src={value} alt="Preview" className="mt-2 h-20 w-auto rounded border object-cover" onError={e => (e.currentTarget.style.display = 'none')} onLoad={e => (e.currentTarget.style.display = 'block')} />
      )}
      {showUploader && (
        <div className="mt-2">
          <MediaUploader
            onUpload={(url) => {
              onChange(url)
              setShowUploader(false)
            }}
            onClose={() => setShowUploader(false)}
          />
        </div>
      )}
    </div>
  )
}

/** Checks if a field key looks like it references an image */
function isImageKey(key: string): boolean {
  const lower = key.toLowerCase()
  return /image|photo|avatar|logo|cover|background|banner|thumbnail|icon/i.test(lower) &&
    !lower.includes('alt') && !lower.includes('text')
}

// ==================== Section Editors ====================

function HeroEditor({ fields, setFields }: { fields: Record<string, unknown>; setFields: (f: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <TextField label="Main Heading" value={String(fields.headline || '')} onChange={v => setFields({ ...fields, headline: v })} hint="The big text visitors see first" />
      <TextField label="Description" value={String(fields.subtitle || '')} onChange={v => setFields({ ...fields, subtitle: v })} multiline hint="A short description below the heading" />
      <ImageField label="Background Image" value={String(fields.backgroundImage || '')} onChange={v => setFields({ ...fields, backgroundImage: v })} hint="Upload or paste a link to an image" />
      <TextField label="Button Text" value={String(fields.ctaText || '')} onChange={v => setFields({ ...fields, ctaText: v })} hint="Text shown on the button (e.g. Apply Now)" />
      <TextField label="Button Link" value={String(fields.ctaLink || '')} onChange={v => setFields({ ...fields, ctaLink: v })} hint="Where the button takes visitors (e.g. /apply)" />
    </div>
  )
}

function AboutEditor({ fields, setFields }: { fields: Record<string, unknown>; setFields: (f: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <TextField label="Description" value={String(fields.body || '')} onChange={v => setFields({ ...fields, body: v })} multiline hint="Tell visitors about your school" />
      <ImageField label="Image" value={String(fields.image || '')} onChange={v => setFields({ ...fields, image: v })} hint="Upload or paste a link to a photo of your school" />
      <TextField label="Our Mission" value={String(fields.mission || '')} onChange={v => setFields({ ...fields, mission: v })} multiline hint="What your school aims to achieve" />
      <TextField label="Our Vision" value={String(fields.vision || '')} onChange={v => setFields({ ...fields, vision: v })} multiline hint="Where your school is headed" />
    </div>
  )
}

function StatsEditor({ fields, setFields }: { fields: Record<string, unknown>; setFields: (f: Record<string, unknown>) => void }) {
  const items = (fields.items as Array<{ label: string; value: string; icon: string }>) || []

  const updateItem = (index: number, key: string, value: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [key]: value }
    setFields({ ...fields, items: updated })
  }

  const addItem = () => setFields({ ...fields, items: [...items, { label: '', value: '', icon: '' }] })
  const removeItem = (i: number) => setFields({ ...fields, items: items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Add key numbers that highlight your school's achievements</p>
      {items.map((item, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Highlight #{i + 1}</span>
            <button onClick={() => removeItem(i)} className="text-red-500 text-xs hover:underline">Remove</button>
          </div>
          <TextField label="Name" value={item.label} onChange={v => updateItem(i, 'label', v)} hint="e.g. Students, Teachers, Years" />
          <TextField label="Number" value={item.value} onChange={v => updateItem(i, 'value', v)} hint="e.g. 2,500+, 150+, 98.5%" />
        </div>
      ))}
      <button onClick={addItem} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add another highlight</button>
    </div>
  )
}

function AdmissionsEditor({ fields, setFields }: { fields: Record<string, unknown>; setFields: (f: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <TextField label="Description" value={String(fields.body || '')} onChange={v => setFields({ ...fields, body: v })} multiline hint="Information about admissions process" />
      <TextField label="Button Text" value={String(fields.ctaText || '')} onChange={v => setFields({ ...fields, ctaText: v })} hint="e.g. Apply Now, Learn More" />
      <TextField label="Button Link" value={String(fields.ctaLink || '')} onChange={v => setFields({ ...fields, ctaLink: v })} hint="Where the button takes visitors" />
      <CheckboxField label="Show Application Form" value={Boolean(fields.showApplicationForm)} onChange={v => setFields({ ...fields, showApplicationForm: v })} hint="Display the online application form on this page" />
    </div>
  )
}

function TestimonialsEditor({ fields, setFields }: { fields: Record<string, unknown>; setFields: (f: Record<string, unknown>) => void }) {
  const items = (fields.items as Array<{ name: string; role: string; quote: string; avatar: string }>) || []

  const updateItem = (index: number, key: string, value: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [key]: value }
    setFields({ ...fields, items: updated })
  }

  const addItem = () => setFields({ ...fields, items: [...items, { name: '', role: '', quote: '', avatar: '' }] })
  const removeItem = (i: number) => setFields({ ...fields, items: items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Add reviews from parents or students about your school</p>
      {items.map((item, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Review #{i + 1}</span>
            <button onClick={() => removeItem(i)} className="text-red-500 text-xs hover:underline">Remove</button>
          </div>
          <TextField label="Person's Name" value={item.name} onChange={v => updateItem(i, 'name', v)} />
          <TextField label="Who they are" value={item.role} onChange={v => updateItem(i, 'role', v)} hint="e.g. Parent, Class 8" />
          <TextField label="What they said" value={item.quote} onChange={v => updateItem(i, 'quote', v)} multiline />
          <ImageField label="Photo" value={item.avatar} onChange={v => updateItem(i, 'avatar', v)} hint="Upload or paste a link to their photo" />
        </div>
      ))}
      <button onClick={addItem} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add another review</button>
    </div>
  )
}

function GalleryEditor({ fields, setFields }: { fields: Record<string, unknown>; setFields: (f: Record<string, unknown>) => void }) {
  const images = (fields.images as Array<{ url: string; caption: string }>) || []
  const layout = String(fields.layout || 'grid')

  const updateImage = (index: number, key: string, value: string) => {
    const updated = [...images]
    updated[index] = { ...updated[index], [key]: value }
    setFields({ ...fields, images: updated })
  }

  const addImage = () => setFields({ ...fields, images: [...images, { url: '', caption: '' }] })
  const removeImage = (i: number) => setFields({ ...fields, images: images.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Display Style</label>
        <select value={layout} onChange={e => setFields({ ...fields, layout: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
          <option value="grid">Grid (equal size)</option>
          <option value="masonry">Masonry (mixed sizes)</option>
        </select>
      </div>
      {images.map((img, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Photo #{i + 1}</span>
            <button onClick={() => removeImage(i)} className="text-red-500 text-xs hover:underline">Remove</button>
          </div>
          <ImageField label="Image" value={img.url} onChange={v => updateImage(i, 'url', v)} hint="Upload or paste a link to the image" />
          <TextField label="Caption" value={img.caption} onChange={v => updateImage(i, 'caption', v)} hint="Brief description of the photo" />
        </div>
      ))}
      <button onClick={addImage} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add another photo</button>
    </div>
  )
}

function EventsEditor({ fields, setFields }: { fields: Record<string, unknown>; setFields: (f: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Events are automatically pulled from your school calendar</p>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Number of events to show</label>
        <input
          type="number"
          value={Number(fields.showCount || 5)}
          onChange={e => setFields({ ...fields, showCount: Number(e.target.value) })}
          className="w-full px-3 py-2 border rounded-lg text-sm"
          min={1} max={20}
        />
      </div>
      <CheckboxField label="Include past events" value={Boolean(fields.showPast)} onChange={v => setFields({ ...fields, showPast: v })} hint="Show events that have already happened" />
    </div>
  )
}

function NewsEditor({ fields, setFields }: { fields: Record<string, unknown>; setFields: (f: Record<string, unknown>) => void }) {
  const items = (fields.items as Array<{ title: string; body: string; date: string; image: string }>) || []

  const updateItem = (index: number, key: string, value: string) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [key]: value }
    setFields({ ...fields, items: updated })
  }

  const addItem = () => setFields({ ...fields, items: [...items, { title: '', body: '', date: new Date().toISOString().split('T')[0], image: '' }] })
  const removeItem = (i: number) => setFields({ ...fields, items: items.filter((_, idx) => idx !== i) })

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Share news and announcements with visitors</p>
      {items.map((item, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">Article #{i + 1}</span>
            <button onClick={() => removeItem(i)} className="text-red-500 text-xs hover:underline">Remove</button>
          </div>
          <TextField label="Title" value={item.title} onChange={v => updateItem(i, 'title', v)} />
          <TextField label="Content" value={item.body} onChange={v => updateItem(i, 'body', v)} multiline />
          <TextField label="Date" value={item.date} onChange={v => updateItem(i, 'date', v)} hint="When this was published" />
          <ImageField label="Image" value={item.image} onChange={v => updateItem(i, 'image', v)} hint="Upload or paste a link to an image" />
        </div>
      ))}
      <button onClick={addItem} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add another article</button>
    </div>
  )
}

function ContactEditor({ fields, setFields }: { fields: Record<string, unknown>; setFields: (f: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <CheckboxField label="Show contact form" value={Boolean(fields.showForm)} onChange={v => setFields({ ...fields, showForm: v })} hint="Let visitors send you a message" />
      <CheckboxField label="Show map" value={Boolean(fields.showMap)} onChange={v => setFields({ ...fields, showMap: v })} hint="Display a map with your location" />
      <TextField label="Map Embed Code" value={String(fields.mapEmbed || '')} onChange={v => setFields({ ...fields, mapEmbed: v })} multiline hint="Paste the embed code from Google Maps" />
      <TextField label="Address & Contact Info" value={String(fields.additionalInfo || '')} onChange={v => setFields({ ...fields, additionalInfo: v })} multiline hint="Your school's address, phone, and email" />
    </div>
  )
}

function FacultyEditor({ fields, setFields }: { fields: Record<string, unknown>; setFields: (f: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">Teacher information is automatically pulled from your school records</p>
      <TextField label="Description" value={String(fields.description || '')} onChange={v => setFields({ ...fields, description: v })} multiline hint="An introduction about your teaching staff" />
      <CheckboxField label="Show all teachers" value={Boolean(fields.showAll)} onChange={v => setFields({ ...fields, showAll: v })} hint="Display the full list of teaching staff" />
    </div>
  )
}

function CustomHtmlEditor({ fields, setFields }: { fields: Record<string, unknown>; setFields: (f: Record<string, unknown>) => void }) {
  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-400">For advanced users — add custom HTML content</p>
      <TextField label="HTML Content" value={String(fields.html || '')} onChange={v => setFields({ ...fields, html: v })} multiline />
    </div>
  )
}

// Generic editor for new section types — shows JSON fields as text inputs
function GenericItemsEditor({ fields, setFields }: { fields: Record<string, unknown>; setFields: (f: Record<string, unknown>) => void }) {
  if (!fields || typeof fields !== 'object') {
    return <div className="text-sm text-gray-400">No content to edit. Add content by saving data in JSON format.</div>
  }
  return (
    <div className="space-y-4">
      {Object.entries(fields).map(([key, value]) => {
        if (key == null || typeof key !== 'string') return null
        if (key === 'items' || key === 'badges' || key === 'facilities' || key === 'routes' ||
            key === 'leaders' || key === 'toppers' || key === 'highlights' || key === 'rows' ||
            key === 'companies' || key === 'stats' || key === 'activities' || key === 'features' ||
            key === 'alumni' || key === 'emergencyContacts' || key === 'questions') {
          return (
            <div key={key}>
              <label className="text-xs font-medium text-gray-500 uppercase">{key} (JSON)</label>
              <textarea
                className="w-full mt-1 p-2 border rounded-md text-sm font-mono min-h-[120px]"
                value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                onChange={e => {
                  try { setFields({ ...fields, [key]: JSON.parse(e.target.value) }) }
                  catch { setFields({ ...fields, [key]: e.target.value }) }
                }}
              />
            </div>
          )
        }
        if (typeof value === 'boolean') {
          return (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!value} onChange={e => setFields({ ...fields, [key]: e.target.checked })} />
              {String(key).replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
            </label>
          )
        }
        if (Array.isArray(value)) {
          return (
            <div key={key}>
              <label className="text-xs font-medium text-gray-500 uppercase">{key} (JSON array)</label>
              <textarea
                className="w-full mt-1 p-2 border rounded-md text-sm font-mono min-h-[80px]"
                value={JSON.stringify(value, null, 2)}
                onChange={e => {
                  try { setFields({ ...fields, [key]: JSON.parse(e.target.value) }) }
                  catch { /* keep current */ }
                }}
              />
            </div>
          )
        }
        const prettyLabel = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())
        if (isImageKey(key)) {
          return (
            <ImageField
              key={key}
              label={prettyLabel}
              value={String(value || '')}
              onChange={v => setFields({ ...fields, [key]: v })}
              hint="Upload or paste a URL"
            />
          )
        }
        return (
          <TextField
            key={key}
            label={prettyLabel}
            value={String(value || '')}
            onChange={v => setFields({ ...fields, [key]: v })}
            multiline={String(value || '').length > 100}
          />
        )
      })}
    </div>
  )
}

type EditorProps = { fields: Record<string, unknown>; setFields: (f: Record<string, unknown>) => void }

function SelectField({ label, value, onChange, options, hint }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; hint?: string
}) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ==================== Dedicated Section Editors ====================

function CoursesEditor({ fields, setFields }: EditorProps) {
  const items = (fields.items as Array<any>) || []

  const updateItem = (idx: number, key: string, value: any) => {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [key]: value }
    setFields({ ...fields, items: updated })
  }

  const addItem = () => {
    setFields({ ...fields, items: [...items, { name: '', description: '', duration: '', eligibility: '', fees: '', category: 'Primary', image: '' }] })
  }

  const removeItem = (idx: number) => {
    setFields({ ...fields, items: items.filter((_: any, i: number) => i !== idx) })
  }

  return (
    <div className="space-y-4">
      <TextField label="Description" value={String(fields.description || '')} onChange={v => setFields({ ...fields, description: v })} multiline />
      <CheckboxField label="Show Fees" value={!!fields.showFees} onChange={v => setFields({ ...fields, showFees: v })} />
      <SelectField
        label="Layout"
        value={String(fields.layout || 'grid')}
        onChange={v => setFields({ ...fields, layout: v })}
        options={[{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' }, { value: 'tabs', label: 'Tabs' }]}
      />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Programs / Courses</h4>
        {items.map((item: any, i: number) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Course #{i + 1}</span>
              <button onClick={() => removeItem(i)} className="text-red-500 text-xs hover:underline">Remove</button>
            </div>
            <TextField label="Course Name" value={item.name || ''} onChange={v => updateItem(i, 'name', v)} />
            <TextField label="Description" value={item.description || ''} onChange={v => updateItem(i, 'description', v)} multiline />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Duration" value={item.duration || ''} onChange={v => updateItem(i, 'duration', v)} />
              <TextField label="Fees" value={item.fees || ''} onChange={v => updateItem(i, 'fees', v)} />
            </div>
            <TextField label="Eligibility" value={item.eligibility || ''} onChange={v => updateItem(i, 'eligibility', v)} />
            <SelectField
              label="Category"
              value={item.category || 'Primary'}
              onChange={v => updateItem(i, 'category', v)}
              options={[
                { value: 'Foundation', label: 'Foundation' },
                { value: 'Primary', label: 'Primary' },
                { value: 'Middle', label: 'Middle' },
                { value: 'Secondary', label: 'Secondary' },
                { value: 'Senior Secondary', label: 'Senior Secondary' },
                { value: 'UG', label: 'UG' },
                { value: 'PG', label: 'PG' },
                { value: 'Diploma', label: 'Diploma' },
              ]}
            />
            <ImageField label="Image" value={item.image || ''} onChange={v => updateItem(i, 'image', v)} />
          </div>
        ))}
        <button onClick={addItem} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add another course</button>
      </div>
    </div>
  )
}

function ResultsEditor({ fields, setFields }: EditorProps) {
  const highlights = (fields.highlights as Array<any>) || []
  const toppers = (fields.toppers as Array<any>) || []

  const updateHighlight = (idx: number, key: string, value: any) => {
    const updated = [...highlights]
    updated[idx] = { ...updated[idx], [key]: value }
    setFields({ ...fields, highlights: updated })
  }

  const addHighlight = () => {
    setFields({ ...fields, highlights: [...highlights, { label: '', value: '', year: '' }] })
  }

  const removeHighlight = (idx: number) => {
    setFields({ ...fields, highlights: highlights.filter((_: any, i: number) => i !== idx) })
  }

  const updateTopper = (idx: number, key: string, value: any) => {
    const updated = [...toppers]
    updated[idx] = { ...updated[idx], [key]: value }
    setFields({ ...fields, toppers: updated })
  }

  const addTopper = () => {
    setFields({ ...fields, toppers: [...toppers, { name: '', score: '', exam: '', rank: '', year: '', photo: '' }] })
  }

  const removeTopper = (idx: number) => {
    setFields({ ...fields, toppers: toppers.filter((_: any, i: number) => i !== idx) })
  }

  return (
    <div className="space-y-4">
      <TextField label="Description" value={String(fields.description || '')} onChange={v => setFields({ ...fields, description: v })} multiline />
      <CheckboxField label="Show Year Filter" value={!!fields.showYearFilter} onChange={v => setFields({ ...fields, showYearFilter: v })} />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Highlights</h4>
        {highlights.map((item: any, i: number) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Highlight #{i + 1}</span>
              <button onClick={() => removeHighlight(i)} className="text-red-500 text-xs hover:underline">Remove</button>
            </div>
            <TextField label="Label" value={item.label || ''} onChange={v => updateHighlight(i, 'label', v)} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Value" value={item.value || ''} onChange={v => updateHighlight(i, 'value', v)} />
              <TextField label="Year" value={item.year || ''} onChange={v => updateHighlight(i, 'year', v)} />
            </div>
          </div>
        ))}
        <button onClick={addHighlight} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add another highlight</button>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Toppers</h4>
        {toppers.map((item: any, i: number) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Topper #{i + 1}</span>
              <button onClick={() => removeTopper(i)} className="text-red-500 text-xs hover:underline">Remove</button>
            </div>
            <TextField label="Name" value={item.name || ''} onChange={v => updateTopper(i, 'name', v)} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Score" value={item.score || ''} onChange={v => updateTopper(i, 'score', v)} />
              <TextField label="Rank" value={item.rank || ''} onChange={v => updateTopper(i, 'rank', v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Exam" value={item.exam || ''} onChange={v => updateTopper(i, 'exam', v)} />
              <TextField label="Year" value={item.year || ''} onChange={v => updateTopper(i, 'year', v)} />
            </div>
            <ImageField label="Photo" value={item.photo || ''} onChange={v => updateTopper(i, 'photo', v)} />
          </div>
        ))}
        <button onClick={addTopper} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add another topper</button>
      </div>
    </div>
  )
}

function FeeStructureEditor({ fields, setFields }: EditorProps) {
  const rows = (fields.rows as Array<any>) || []
  const paymentModes = (fields.paymentModes as Array<string>) || []

  const updateRow = (idx: number, key: string, value: any) => {
    const updated = [...rows]
    updated[idx] = { ...updated[idx], [key]: value }
    setFields({ ...fields, rows: updated })
  }

  const addRow = () => {
    setFields({ ...fields, rows: [...rows, { category: '', tuitionFee: '', otherFees: '', totalFee: '', installments: '' }] })
  }

  const removeRow = (idx: number) => {
    setFields({ ...fields, rows: rows.filter((_: any, i: number) => i !== idx) })
  }

  const updatePaymentMode = (idx: number, value: string) => {
    const updated = [...paymentModes]
    updated[idx] = value
    setFields({ ...fields, paymentModes: updated })
  }

  const addPaymentMode = () => {
    setFields({ ...fields, paymentModes: [...paymentModes, ''] })
  }

  const removePaymentMode = (idx: number) => {
    setFields({ ...fields, paymentModes: paymentModes.filter((_: string, i: number) => i !== idx) })
  }

  return (
    <div className="space-y-4">
      <TextField label="Description" value={String(fields.description || '')} onChange={v => setFields({ ...fields, description: v })} multiline />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Fee Rows</h4>
        {rows.map((item: any, i: number) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Row #{i + 1}</span>
              <button onClick={() => removeRow(i)} className="text-red-500 text-xs hover:underline">Remove</button>
            </div>
            <TextField label="Category" value={item.category || ''} onChange={v => updateRow(i, 'category', v)} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Tuition Fee" value={item.tuitionFee || ''} onChange={v => updateRow(i, 'tuitionFee', v)} />
              <TextField label="Other Fees" value={item.otherFees || ''} onChange={v => updateRow(i, 'otherFees', v)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Total Fee" value={item.totalFee || ''} onChange={v => updateRow(i, 'totalFee', v)} />
              <TextField label="Installments" value={item.installments || ''} onChange={v => updateRow(i, 'installments', v)} />
            </div>
          </div>
        ))}
        <button onClick={addRow} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add another fee row</button>
      </div>

      <TextField label="Scholarship Info" value={String(fields.scholarshipInfo || '')} onChange={v => setFields({ ...fields, scholarshipInfo: v })} multiline />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Payment Modes</h4>
        {paymentModes.map((mode: string, i: number) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={mode}
              onChange={e => updatePaymentMode(i, e.target.value)}
              placeholder="e.g. Online, Cheque, Cash"
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <button onClick={() => removePaymentMode(i)} className="text-red-500 text-xs hover:underline">Remove</button>
          </div>
        ))}
        <button onClick={addPaymentMode} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add payment mode</button>
      </div>

      <TextField label="Disclaimer Text" value={String(fields.disclaimerText || '')} onChange={v => setFields({ ...fields, disclaimerText: v })} multiline />
    </div>
  )
}

function FaqEditor({ fields, setFields }: EditorProps) {
  const items = (fields.questions as Array<any>) || (fields.items as Array<any>) || []
  const itemsKey = fields.questions ? 'questions' : 'items'

  const updateItem = (idx: number, key: string, value: any) => {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [key]: value }
    setFields({ ...fields, [itemsKey]: updated })
  }

  const addItem = () => {
    setFields({ ...fields, [itemsKey]: [...items, { question: '', answer: '', category: 'General' }] })
  }

  const removeItem = (idx: number) => {
    setFields({ ...fields, [itemsKey]: items.filter((_: any, i: number) => i !== idx) })
  }

  return (
    <div className="space-y-4">
      <TextField label="Description" value={String(fields.description || '')} onChange={v => setFields({ ...fields, description: v })} multiline />
      <CheckboxField label="Show Categories" value={!!fields.showCategories} onChange={v => setFields({ ...fields, showCategories: v })} />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">FAQ Items</h4>
        {items.map((item: any, i: number) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">FAQ #{i + 1}</span>
              <button onClick={() => removeItem(i)} className="text-red-500 text-xs hover:underline">Remove</button>
            </div>
            <TextField label="Question" value={item.question || ''} onChange={v => updateItem(i, 'question', v)} />
            <TextField label="Answer" value={item.answer || ''} onChange={v => updateItem(i, 'answer', v)} multiline />
            <SelectField
              label="Category"
              value={item.category || 'General'}
              onChange={v => updateItem(i, 'category', v)}
              options={[
                { value: 'Admissions', label: 'Admissions' },
                { value: 'Fees', label: 'Fees' },
                { value: 'Academics', label: 'Academics' },
                { value: 'Transport', label: 'Transport' },
                { value: 'General', label: 'General' },
                { value: 'Activities', label: 'Activities' },
              ]}
            />
          </div>
        ))}
        <button onClick={addItem} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add another FAQ</button>
      </div>
    </div>
  )
}

function LeadershipEditor({ fields, setFields }: EditorProps) {
  const items = (fields.leaders as Array<any>) || (fields.items as Array<any>) || []
  const itemsKey = fields.leaders ? 'leaders' : 'items'

  const updateItem = (idx: number, key: string, value: any) => {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [key]: value }
    setFields({ ...fields, [itemsKey]: updated })
  }

  const addItem = () => {
    setFields({ ...fields, [itemsKey]: [...items, { name: '', designation: '', qualifications: '', photo: '', message: '' }] })
  }

  const removeItem = (idx: number) => {
    setFields({ ...fields, [itemsKey]: items.filter((_: any, i: number) => i !== idx) })
  }

  return (
    <div className="space-y-4">
      <TextField label="Description" value={String(fields.description || '')} onChange={v => setFields({ ...fields, description: v })} multiline />
      <SelectField
        label="Layout"
        value={String(fields.layout || 'grid')}
        onChange={v => setFields({ ...fields, layout: v })}
        options={[{ value: 'featured', label: 'Featured' }, { value: 'grid', label: 'Grid' }]}
      />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Leaders</h4>
        {items.map((item: any, i: number) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Leader #{i + 1}</span>
              <button onClick={() => removeItem(i)} className="text-red-500 text-xs hover:underline">Remove</button>
            </div>
            <TextField label="Name" value={item.name || ''} onChange={v => updateItem(i, 'name', v)} />
            <TextField label="Designation" value={item.designation || ''} onChange={v => updateItem(i, 'designation', v)} />
            <TextField label="Qualifications" value={item.qualifications || ''} onChange={v => updateItem(i, 'qualifications', v)} />
            <TextField label="Message" value={item.message || ''} onChange={v => updateItem(i, 'message', v)} multiline />
            <ImageField label="Photo" value={item.photo || ''} onChange={v => updateItem(i, 'photo', v)} />
          </div>
        ))}
        <button onClick={addItem} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add another leader</button>
      </div>
    </div>
  )
}

function AccreditationEditor({ fields, setFields }: EditorProps) {
  const items = (fields.badges as Array<any>) || (fields.items as Array<any>) || []
  const itemsKey = fields.badges ? 'badges' : 'items'

  const updateItem = (idx: number, key: string, value: any) => {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [key]: value }
    setFields({ ...fields, [itemsKey]: updated })
  }

  const addItem = () => {
    setFields({ ...fields, [itemsKey]: [...items, { name: '', certNumber: '', verificationUrl: '', validUntil: '', logo: '' }] })
  }

  const removeItem = (idx: number) => {
    setFields({ ...fields, [itemsKey]: items.filter((_: any, i: number) => i !== idx) })
  }

  return (
    <div className="space-y-4">
      <TextField label="Description" value={String(fields.description || '')} onChange={v => setFields({ ...fields, description: v })} multiline />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Accreditation Badges</h4>
        {items.map((item: any, i: number) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Badge #{i + 1}</span>
              <button onClick={() => removeItem(i)} className="text-red-500 text-xs hover:underline">Remove</button>
            </div>
            <TextField label="Name" value={item.name || ''} onChange={v => updateItem(i, 'name', v)} />
            <TextField label="Certificate Number" value={item.certNumber || ''} onChange={v => updateItem(i, 'certNumber', v)} />
            <TextField label="Verification URL" value={item.verificationUrl || ''} onChange={v => updateItem(i, 'verificationUrl', v)} />
            <TextField label="Valid Until" value={item.validUntil || ''} onChange={v => updateItem(i, 'validUntil', v)} hint="e.g. 2027-03-31" />
            <ImageField label="Logo" value={item.logo || ''} onChange={v => updateItem(i, 'logo', v)} />
          </div>
        ))}
        <button onClick={addItem} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add another badge</button>
      </div>
    </div>
  )
}

function InfrastructureEditor({ fields, setFields }: EditorProps) {
  const items = (fields.facilities as Array<any>) || (fields.items as Array<any>) || []
  const itemsKey = fields.facilities ? 'facilities' : 'items'

  const updateItem = (idx: number, key: string, value: any) => {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [key]: value }
    setFields({ ...fields, [itemsKey]: updated })
  }

  const addItem = () => {
    setFields({ ...fields, [itemsKey]: [...items, { name: '', description: '', icon: '', image: '' }] })
  }

  const removeItem = (idx: number) => {
    setFields({ ...fields, [itemsKey]: items.filter((_: any, i: number) => i !== idx) })
  }

  return (
    <div className="space-y-4">
      <TextField label="Description" value={String(fields.description || '')} onChange={v => setFields({ ...fields, description: v })} multiline />
      <SelectField
        label="Layout"
        value={String(fields.layout || 'grid')}
        onChange={v => setFields({ ...fields, layout: v })}
        options={[{ value: 'grid', label: 'Grid' }, { value: 'carousel', label: 'Carousel' }]}
      />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Facilities</h4>
        {items.map((item: any, i: number) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">Facility #{i + 1}</span>
              <button onClick={() => removeItem(i)} className="text-red-500 text-xs hover:underline">Remove</button>
            </div>
            <TextField label="Name" value={item.name || ''} onChange={v => updateItem(i, 'name', v)} />
            <TextField label="Description" value={item.description || ''} onChange={v => updateItem(i, 'description', v)} multiline />
            <TextField label="Icon" value={item.icon || ''} onChange={v => updateItem(i, 'icon', v)} hint="Icon name or emoji" />
            <ImageField label="Image" value={item.image || ''} onChange={v => updateItem(i, 'image', v)} />
          </div>
        ))}
        <button onClick={addItem} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add another facility</button>
      </div>
    </div>
  )
}

function DownloadsEditor({ fields, setFields }: EditorProps) {
  const items = (fields.items as Array<any>) || []

  const updateItem = (idx: number, key: string, value: any) => {
    const updated = [...items]
    updated[idx] = { ...updated[idx], [key]: value }
    setFields({ ...fields, items: updated })
  }

  const addItem = () => {
    setFields({ ...fields, items: [...items, { title: '', description: '', fileUrl: '', fileType: 'pdf', fileSize: '', category: '' }] })
  }

  const removeItem = (idx: number) => {
    setFields({ ...fields, items: items.filter((_: any, i: number) => i !== idx) })
  }

  return (
    <div className="space-y-4">
      <TextField label="Description" value={String(fields.description || '')} onChange={v => setFields({ ...fields, description: v })} multiline />
      <CheckboxField label="Show Categories" value={!!fields.showCategories} onChange={v => setFields({ ...fields, showCategories: v })} />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700">Downloadable Files</h4>
        {items.map((item: any, i: number) => (
          <div key={i} className="border rounded-lg p-4 space-y-3 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">File #{i + 1}</span>
              <button onClick={() => removeItem(i)} className="text-red-500 text-xs hover:underline">Remove</button>
            </div>
            <TextField label="Title" value={item.title || ''} onChange={v => updateItem(i, 'title', v)} />
            <TextField label="Description" value={item.description || ''} onChange={v => updateItem(i, 'description', v)} multiline />
            <TextField label="File URL" value={item.fileUrl || ''} onChange={v => updateItem(i, 'fileUrl', v)} hint="Link to the downloadable file" />
            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="File Type"
                value={item.fileType || 'pdf'}
                onChange={v => updateItem(i, 'fileType', v)}
                options={[
                  { value: 'pdf', label: 'PDF' },
                  { value: 'doc', label: 'Document' },
                  { value: 'image', label: 'Image' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <TextField label="File Size" value={item.fileSize || ''} onChange={v => updateItem(i, 'fileSize', v)} hint="e.g. 2.5 MB" />
            </div>
            <TextField label="Category" value={item.category || ''} onChange={v => updateItem(i, 'category', v)} hint="e.g. Forms, Circulars, Reports" />
          </div>
        ))}
        <button onClick={addItem} className="text-sm text-blue-600 hover:text-blue-700 font-medium">+ Add another file</button>
      </div>
    </div>
  )
}

const EDITOR_MAP: Record<SectionType, React.FC<{ fields: Record<string, unknown>; setFields: (f: Record<string, unknown>) => void }>> = {
  hero: HeroEditor,
  about: AboutEditor,
  stats: StatsEditor,
  admissions: AdmissionsEditor,
  faculty: FacultyEditor,
  gallery: GalleryEditor,
  testimonials: TestimonialsEditor,
  events: EventsEditor,
  news: NewsEditor,
  contact: ContactEditor,
  custom_html: CustomHtmlEditor,
  // Dedicated editors for key section types
  courses: CoursesEditor,
  results: ResultsEditor,
  fee_structure: FeeStructureEditor,
  accreditation: AccreditationEditor,
  infrastructure: InfrastructureEditor,
  leadership: LeadershipEditor,
  downloads: DownloadsEditor,
  faq: FaqEditor,
  // Remaining section types use generic editor
  placements: GenericItemsEditor,
  transport: GenericItemsEditor,
  student_life: GenericItemsEditor,
  safety: GenericItemsEditor,
  alumni: GenericItemsEditor,
  virtual_tour: GenericItemsEditor,
  cta_banner: GenericItemsEditor,
}

export function SectionEditorPanel({ section, onUpdate }: SectionEditorPanelProps) {
  const { fields, setFields, title, setTitle, saveStatus } = useAutoSave(section, onUpdate)

  const Editor = EDITOR_MAP[section.type as SectionType]
  const sectionMeta = SECTION_TYPES.find(st => st.value === section.type)

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{sectionMeta?.label || (section.type || 'Section').replace('_', ' ')}</h3>
          {sectionMeta && <p className="text-xs text-gray-400 mt-0.5">{sectionMeta.description}</p>}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <Check className="h-3 w-3 text-green-500" />
              <span className="text-green-600">Saved</span>
            </>
          )}
        </div>
      </div>

      <TextField
        label="Section Title"
        value={title}
        onChange={setTitle}
        hint="The heading shown above this section (optional)"
      />

      {Editor ? <Editor fields={fields} setFields={setFields} /> : (
        <p className="text-gray-500 text-sm">No editor available for this section type.</p>
      )}
    </div>
  )
}
