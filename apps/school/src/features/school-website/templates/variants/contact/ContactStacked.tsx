import { useState } from 'react'
import DOMPurify from 'dompurify'
import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, cardClass, field } from '../shared'
import { useFormTracking } from '../../../components/FormTracker'
import { useLanguage } from '../../../i18n/LanguageContext'

export function ContactStacked({ section, theme }: VariantProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const { trackSubmit, getTrackingProps } = useFormTracking('contact')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return
    setSubmitStatus('sending')
    try {
      const res = await fetch('/api/public/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          pageSlug: window.location.pathname.split('/').pop() || 'home',
        }),
      })
      if (res.ok) {
        trackSubmit()
        setSubmitStatus('sent')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch {
      setSubmitStatus('error')
    }
  }
  const showMap = field<boolean>(section.content, 'showMap', false)
  const showForm = field<boolean>(section.content, 'showForm', true)
  const mapEmbed = field(section.content, 'mapEmbed', '')
  const additionalInfo = field(section.content, 'additionalInfo', '')
  const title = section.title || 'Contact Us'

  return (
    <section className={spacingClass(theme.sectionSpacing)}>
      <div className="mx-auto max-w-3xl px-6">
        <h2
          className="text-center text-3xl font-bold sm:text-4xl"
          style={{ color: theme.defaultPrimaryColor }}
        >
          {title}
        </h2>

        {/* Info */}
        <div className="mt-10 text-center">
          {additionalInfo ? (
            <p className="text-lg text-gray-600">{additionalInfo}</p>
          ) : (
            <div className="flex flex-wrap justify-center gap-8 text-gray-600">
              <div>
                <p className="text-sm font-semibold text-gray-900">Address</p>
                <p className="mt-1 text-sm">123 School Road, City</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Phone</p>
                <p className="mt-1 text-sm">+91 98765 43210</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Email</p>
                <p className="mt-1 text-sm">info@school.edu</p>
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className={`mt-10 p-8 ${cardClass(theme.cardStyle, theme.cornerRadius)}`}>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder={t('contact.name')}
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  {...getTrackingProps('name')}
                  className={`w-full border border-gray-300 px-4 py-2.5 text-sm outline-none ${radiusClass(theme.cornerRadius)}`}
                  required
                />
                <input
                  type="email"
                  placeholder={t('contact.email')}
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  {...getTrackingProps('email')}
                  className={`w-full border border-gray-300 px-4 py-2.5 text-sm outline-none ${radiusClass(theme.cornerRadius)}`}
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Subject"
                value={formData.subject}
                onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                {...getTrackingProps('subject')}
                className={`w-full border border-gray-300 px-4 py-2.5 text-sm outline-none ${radiusClass(theme.cornerRadius)}`}
              />
              <textarea
                placeholder={t('contact.message')}
                rows={5}
                value={formData.message}
                onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                {...getTrackingProps('message')}
                className={`w-full border border-gray-300 px-4 py-2.5 text-sm outline-none ${radiusClass(theme.cornerRadius)}`}
                required
              />

              {/* Status messages */}
              {submitStatus === 'sent' && (
                <p className="text-sm text-green-600 text-center font-medium">
                  {t('contact.success')}
                </p>
              )}
              {submitStatus === 'error' && (
                <p className="text-sm text-red-600 text-center font-medium">
                  Something went wrong. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={submitStatus === 'sending'}
                className={`w-full px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-70 ${radiusClass(theme.cornerRadius)}`}
                style={{ backgroundColor: theme.defaultPrimaryColor }}
              >
                {submitStatus === 'sending' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </span>
                ) : t('contact.send')}
              </button>
            </div>
          </form>
        )}

        {/* Map */}
        {showMap && mapEmbed && (
          <div
            className={`mt-10 aspect-video overflow-hidden ${radiusClass(theme.cornerRadius)}`}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(mapEmbed, { ADD_TAGS: ['iframe'], ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'loading'] }) }}
          />
        )}
      </div>
    </section>
  )
}
