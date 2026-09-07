'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ChevronRight, Mail, Phone, MapPin, MessageCircle, Send, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'

export default function ContactoPage() {
  const t = useTranslations('contact')
  const tr = useTranslations('routes')
  const [form, setForm] = React.useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      toast(t('sendSuccess'), 'success')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast(t('sendError'), 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-emerald-600 to-green-500 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
          <nav className="flex items-center gap-1.5 text-sm text-emerald-100 mb-6">
            <Link href="/" className="hover:text-white transition-colors">{tr('home')}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>{tr('contact')}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('heroTitle')}</h1>
          <p className="text-emerald-100 text-lg max-w-2xl">
            {t('heroDescription')}
          </p>
        </div>
      </div>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('contactInfoTitle')}</h2>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('whatsappTitle')}</h3>
                  <p className="text-sm text-gray-500 mb-1">{t('whatsappSubtitle')}</p>
                  <a
                    href="https://wa.me/244900000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    +244 900 000 000
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('emailTitle')}</h3>
                  <p className="text-sm text-gray-500 mb-1">{t('emailSubtitle')}</p>
                  <a href="mailto:info@pambala.ao" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    info@pambala.ao
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('phoneTitle')}</h3>
                  <p className="text-sm text-gray-500 mb-1">{t('phoneSubtitle')}</p>
                  <a href="tel:+244900000000" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                    +244 900 000 000
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('addressTitle')}</h3>
                  <p className="text-sm text-gray-500">
                    Rua Major Kanhangulo, 123<br />
                    Ingombota, Luanda<br />
                    Angola
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('hoursTitle')}</h3>
                  <p className="text-sm text-gray-500">
                    {t('hoursWeek')}<br />
                    {t('hoursSaturday')}<br />
                    {t('hoursSunday')}
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/244900000000?text=Ola! Preciso de ajuda com o Pambala."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('whatsappCta')}
                </Button>
              </a>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-xl border border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('messageTitle')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label={t('nameLabel')}
                      placeholder={t('namePlaceholder')}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                    <Input
                      label={t('emailLabel')}
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  <Input
                    label={t('subjectLabel')}
                    placeholder={t('subjectPlaceholder')}
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('messageLabel')}</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={6}
                      placeholder={t('messagePlaceholder')}
                      className="w-full rounded-lg border border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                      required
                    />
                  </div>
                  <Button type="submit" size="lg" disabled={loading}>
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? t('sending') : t('sendMessage')}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}