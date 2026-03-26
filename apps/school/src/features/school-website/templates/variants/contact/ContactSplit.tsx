import { useState } from 'react'
import DOMPurify from 'dompurify'
import type { VariantProps } from '../../section-variants'
import { spacingClass, radiusClass, field } from '../shared'
import { useFormTracking } from '../../../components/FormTracker'
import { useLanguage } from '../../../i18n/LanguageContext'

export function ContactSplit({ section, theme }: VariantProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' })
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const { trackField, trackSubmit, getTrackingProps } = useFormTracking('contact')
  const showMap = field<boolean>(section.content, 'showMap', false)
  const showForm = field<boolean>(section.content, 'showForm', true)
  const mapEmbed = field(section.content, 'mapEmbed', '')
  const title = section.title || 'Contact Us'
  const description = field(
    section.content,
    'additionalInfo',
    'We would love to hear from you. Reach out to us with any questions about admissions, academics, or campus life.',
  )
  const address = field(section.content, 'address', '123 School Road, City, State 123456')
  const phone = field(section.content, 'phone', '+91 98765 43210')
  const email = field(section.content, 'email', 'info@school.edu')
  const whatsapp = field(section.content, 'whatsapp', '')
  const officeHours = field(section.content, 'officeHours', 'Mon - Sat: 8:00 AM - 4:00 PM')

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
        setFormData({ name: '', email: '', phone: '', message: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch {
      setSubmitStatus('error')
    }
  }

  const primaryColor = theme.defaultPrimaryColor
  const accentColor = theme.defaultAccentColor

  const iconCircleStyle = {
    backgroundColor: `${primaryColor}15`,
    color: primaryColor,
  }

  return (
    <section className={`bg-gray-50 ${spacingClass(theme.sectionSpacing)}`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left column — Info */}
          <div className="flex flex-col justify-center">
            <span
              className="inline-block w-fit rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
              style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
            >
              Get in Touch
            </span>

            <h2
              className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
              style={{ color: primaryColor }}
            >
              {title}
            </h2>

            <p className="mt-4 text-lg leading-relaxed text-gray-500">
              {description}
            </p>

            {/* Contact items */}
            <div className="mt-10 space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={iconCircleStyle}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Address</p>
                  <p className="mt-0.5 text-sm text-gray-500">{address}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={iconCircleStyle}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Phone</p>
                  <p className="mt-0.5 text-sm text-gray-500">{phone}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={iconCircleStyle}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Email</p>
                  <p className="mt-0.5 text-sm text-gray-500">{email}</p>
                </div>
              </div>

              {/* WhatsApp (conditional) */}
              {whatsapp && (
                <div className="flex items-start gap-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                    style={iconCircleStyle}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">WhatsApp</p>
                    <p className="mt-0.5 text-sm text-gray-500">{whatsapp}</p>
                  </div>
                </div>
              )}

              {/* Office Hours */}
              <div className="flex items-start gap-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                  style={iconCircleStyle}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Office Hours</p>
                  <p className="mt-0.5 text-sm text-gray-500">{officeHours}</p>
                </div>
              </div>
            </div>

            {/* Map embed */}
            {showMap && mapEmbed && (
              <div
                className={`mt-10 aspect-video overflow-hidden ${radiusClass(theme.cornerRadius)} shadow-md`}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(mapEmbed, { ADD_TAGS: ['iframe'], ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'loading'] }) }}
              />
            )}
          </div>

          {/* Right column — Form */}
          {showForm && (
            <div className="flex items-start lg:items-center">
              <div className="w-full rounded-2xl bg-white p-8 shadow-xl sm:p-10">
                <h3
                  className="text-xl font-bold"
                  style={{ color: primaryColor }}
                >
                  Send us a Message
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Fill in the details below and we will get back to you.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  {/* Name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      {t('contact.name')}
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      {...getTrackingProps('name')}
                      className={`w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400 focus:bg-white ${radiusClass(theme.cornerRadius)}`}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      {t('contact.email')}
                    </label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      {...getTrackingProps('email')}
                      className={`w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400 focus:bg-white ${radiusClass(theme.cornerRadius)}`}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      {t('contact.phone')}
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      {...getTrackingProps('phone')}
                      className={`w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400 focus:bg-white ${radiusClass(theme.cornerRadius)}`}
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      {t('contact.message')}
                    </label>
                    <textarea
                      placeholder="Tell us how we can help..."
                      rows={4}
                      value={formData.message}
                      onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      {...getTrackingProps('message')}
                      className={`w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-colors focus:border-gray-400 focus:bg-white ${radiusClass(theme.cornerRadius)}`}
                      required
                    />
                  </div>

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

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitStatus === 'sending'}
                    className={`w-full px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg disabled:opacity-70 ${radiusClass(theme.cornerRadius)}`}
                    style={{ backgroundColor: accentColor }}
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

                  <p className="text-center text-xs text-gray-400">
                    We typically respond within 24 hours.
                  </p>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
