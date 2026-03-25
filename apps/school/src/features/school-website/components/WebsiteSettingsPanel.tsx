import { useState, useEffect } from 'react'
import { useWebsiteSettings, useUpdateSettings } from '../api/school-website.api'
import { Check, Loader2 } from 'lucide-react'
import {
  getTemplatesByInstitution,
  TEMPLATE_REGISTRY,
  type InstitutionType,
  type TemplateConfig,
} from '../templates/registry'

const INSTITUTION_TABS: { value: InstitutionType; label: string }[] = [
  { value: 'school', label: 'School' },
  { value: 'college', label: 'College' },
  { value: 'coaching', label: 'Coaching' },
]

// Map legacy template values to new template IDs
const LEGACY_MAP: Record<string, string> = {
  classic: 'school-classic',
  modern: 'school-modern',
  minimal: 'school-minimal',
}

function resolveTemplateId(value: string): string {
  return LEGACY_MAP[value] || value
}

function getInstitutionFromTemplate(templateId: string): InstitutionType {
  const config = TEMPLATE_REGISTRY.find((t) => t.id === templateId)
  return config?.institutionType || 'school'
}

const FONTS = [
  { value: 'Inter', label: 'Inter (Clean & Modern)' },
  { value: 'Georgia', label: 'Georgia (Classic & Formal)' },
  { value: 'Merriweather', label: 'Merriweather (Easy to Read)' },
  { value: 'Open Sans', label: 'Open Sans (Friendly)' },
  { value: 'Roboto', label: 'Roboto (Professional)' },
  { value: 'Lato', label: 'Lato (Balanced)' },
  { value: 'Playfair Display', label: 'Playfair Display (Elegant)' },
  { value: 'Montserrat', label: 'Montserrat (Bold)' },
  { value: 'Nunito', label: 'Nunito (Playful)' },
  { value: 'Poppins', label: 'Poppins (Geometric)' },
  { value: 'Space Grotesk', label: 'Space Grotesk (Futuristic)' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro (Neutral)' },
]

export function WebsiteSettingsPanel() {
  const { data: settings, isLoading } = useWebsiteSettings()
  const updateSettings = useUpdateSettings()

  const [template, setTemplate] = useState('school-modern')
  const [institutionType, setInstitutionType] = useState<InstitutionType>('school')
  const [primaryColor, setPrimaryColor] = useState('#1e40af')
  const [accentColor, setAccentColor] = useState('#f59e0b')
  const [fontFamily, setFontFamily] = useState('Inter')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({})
  const [logoUrl, setLogoUrl] = useState('')
  const [faviconUrl, setFaviconUrl] = useState('')
  const [whatsappEnabled, setWhatsappEnabled] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappDefaultMessage, setWhatsappDefaultMessage] = useState('')
  const [announcementEnabled, setAnnouncementEnabled] = useState(false)
  const [announcementText, setAnnouncementText] = useState('')
  const [announcementLink, setAnnouncementLink] = useState('')
  const [gaTrackingId, setGaTrackingId] = useState('')

  useEffect(() => {
    if (settings) {
      const resolved = resolveTemplateId(settings.template)
      setTemplate(resolved)
      setInstitutionType(getInstitutionFromTemplate(resolved))
      setPrimaryColor(settings.primaryColor)
      setAccentColor(settings.accentColor)
      setFontFamily(settings.fontFamily)
      setMetaTitle(settings.metaTitle || '')
      setMetaDescription(settings.metaDescription || '')
      setSocialLinks((settings.socialLinks as Record<string, string>) || {})
      setLogoUrl((settings as any)?.logoUrl || '')
      setFaviconUrl((settings as any)?.faviconUrl || '')
      setWhatsappNumber((settings as any)?.whatsappNumber || '')
      setWhatsappEnabled(!!(settings as any)?.whatsappNumber)
      setWhatsappDefaultMessage((settings as any)?.whatsappDefaultMessage || '')
      setAnnouncementEnabled((settings as any)?.announcementEnabled || false)
      setAnnouncementText((settings as any)?.announcementText || '')
      setAnnouncementLink((settings as any)?.announcementLink || '')
      setGaTrackingId((settings as any)?.gaTrackingId || '')
    }
  }, [settings])

  const handleSelectTemplate = (config: TemplateConfig) => {
    setTemplate(config.id)
    setInstitutionType(config.institutionType)
    // Apply template defaults for colors and font
    setPrimaryColor(config.theme.defaultPrimaryColor)
    setAccentColor(config.theme.defaultAccentColor)
    setFontFamily(config.theme.defaultFont)
  }

  const handleSave = () => {
    updateSettings.mutate({
      template: template as any,
      primaryColor,
      accentColor,
      fontFamily,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      socialLinks,
      logoUrl,
      faviconUrl,
      whatsappNumber: whatsappEnabled ? whatsappNumber : null,
      whatsappDefaultMessage: whatsappEnabled ? whatsappDefaultMessage : null,
      announcementEnabled,
      announcementText: announcementEnabled ? announcementText : null,
      announcementLink: announcementEnabled ? announcementLink : null,
      gaTrackingId: gaTrackingId || null,
    } as any)
  }

  const filteredTemplates = getTemplatesByInstitution(institutionType)

  if (isLoading) return <div className="p-6 text-gray-500">Loading settings...</div>

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Institution Type Tabs */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Institution Type</h3>
        <p className="text-xs text-gray-400 mb-3">Select your institution type to see relevant templates</p>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {INSTITUTION_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setInstitutionType(tab.value)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition ${
                institutionType === tab.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Template Picker — 2x2 grid */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Website Style</h3>
        <p className="text-xs text-gray-400 mb-3">Choose how your website looks overall</p>
        <div className="grid grid-cols-2 gap-3">
          {filteredTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTemplate(t)}
              className={`p-4 border-2 rounded-xl text-left transition ${
                template === t.id
                  ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Colored preview strip using template's defaultPrimaryColor */}
              <div
                className="h-2 w-full rounded-full mb-3"
                style={{
                  background: `linear-gradient(to right, ${t.theme.defaultPrimaryColor}, ${t.theme.defaultAccentColor})`,
                }}
              />
              <div className="font-medium text-sm text-gray-900">{t.label}</div>
              <div className="text-xs text-gray-500 mt-1">{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Logo & Favicon */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Logo & Favicon</h3>
        <p className="text-xs text-gray-400 mb-3">Your school's logo appears on the website header and footer</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Logo URL</label>
            {logoUrl && <img src={logoUrl} alt="Logo preview" className="h-16 w-16 object-contain border rounded-lg p-1" />}
            <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://... or paste image URL" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-gray-600">Favicon URL</label>
            {faviconUrl && <img src={faviconUrl} alt="Favicon preview" className="h-8 w-8 object-contain border rounded-lg p-1" />}
            <input type="text" value={faviconUrl} onChange={e => setFaviconUrl(e.target.value)} placeholder="https://... (32x32 recommended)" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Brand Colors</h3>
        <p className="text-xs text-gray-400 mb-3">Match your website to your institution's brand</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm text-gray-600">Main Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-9 w-9 rounded-lg cursor-pointer border" />
              <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="flex-1 px-2.5 py-1.5 text-sm border rounded-lg" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-gray-600">Accent Color</label>
            <div className="flex items-center gap-2">
              <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="h-9 w-9 rounded-lg cursor-pointer border" />
              <input type="text" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="flex-1 px-2.5 py-1.5 text-sm border rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Font */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Text Style</h3>
        <p className="text-xs text-gray-400 mb-3">Choose the font used across your website</p>
        <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
          {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {/* SEO */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Search & Sharing</h3>
        <p className="text-xs text-gray-400 mb-3">How your institution appears on Google and when shared on social media</p>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Website Title</label>
            <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="e.g. Delhi Public School - Excellence in Education" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Short Description</label>
            <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} rows={3} placeholder="A brief description that appears in search results..." className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Social Media Links</h3>
        <p className="text-xs text-gray-400 mb-3">Add your social media pages (leave blank to hide)</p>
        <div className="space-y-3">
          {[
            { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/your-page' },
            { key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/your-page' },
            { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/your-page' },
            { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@your-page' },
          ].map(platform => (
            <div key={platform.key} className="space-y-1">
              <label className="text-sm text-gray-600">{platform.label}</label>
              <input
                type="text"
                value={socialLinks[platform.key] || ''}
                onChange={e => setSocialLinks({ ...socialLinks, [platform.key]: e.target.value })}
                placeholder={platform.placeholder}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp Chat */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">WhatsApp Chat</h3>
        <p className="text-xs text-gray-400 mb-3">Show a floating WhatsApp chat button on your website</p>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={whatsappEnabled}
              onChange={e => setWhatsappEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Enable WhatsApp chat button</span>
          </label>
          {whatsappEnabled && (
            <>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Phone Number</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 bg-gray-50 border rounded-lg px-3 py-2">+91</span>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={e => setWhatsappNumber(e.target.value)}
                    placeholder="9876543210"
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Default Message (optional)</label>
                <textarea
                  value={whatsappDefaultMessage}
                  onChange={e => setWhatsappDefaultMessage(e.target.value)}
                  rows={2}
                  placeholder="Hi! I'm interested in learning more about your school."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Announcement Bar */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Announcement Bar</h3>
        <p className="text-xs text-gray-400 mb-3">Show an announcement banner at the top of your website</p>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={announcementEnabled}
              onChange={e => setAnnouncementEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show announcement bar</span>
          </label>
          {announcementEnabled && (
            <>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Announcement Text</label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={e => setAnnouncementText(e.target.value)}
                  placeholder="e.g. Admissions open for 2026-27! Apply now."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-600">Link URL (optional)</label>
                <input
                  type="text"
                  value={announcementLink}
                  onChange={e => setAnnouncementLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Google Analytics */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Google Analytics</h3>
        <p className="text-xs text-gray-400 mb-3">Track website visitors with Google Analytics 4</p>
        <div className="space-y-1">
          <label className="text-sm text-gray-600">GA4 Tracking ID</label>
          <input
            type="text"
            value={gaTrackingId}
            onChange={e => setGaTrackingId(e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={updateSettings.isPending}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
      >
        {updateSettings.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : updateSettings.isSuccess ? (
          <>
            <Check className="h-4 w-4" />
            Saved!
          </>
        ) : (
          'Save Settings'
        )}
      </button>
    </div>
  )
}
