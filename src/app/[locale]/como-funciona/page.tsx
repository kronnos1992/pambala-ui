import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ChevronRight, Search, CreditCard, Truck, Shield, Clock, Headphones, CheckCircle } from 'lucide-react'

const steps = [
  { icon: Search },
  { icon: CreditCard },
  { icon: Truck },
]

const benefits = [
  { icon: Shield },
  { icon: Clock },
  { icon: Headphones },
  { icon: CheckCircle },
]

const faq = [
  { index: 1 },
  { index: 2 },
  { index: 3 },
  { index: 4 },
  { index: 5 },
]

export default async function ComoFuncionaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations('howItWorks')
  const tr = await getTranslations('routes')

  return (
    <div>
      <div className="bg-gradient-to-br from-emerald-600 to-green-500 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
          <nav className="flex items-center gap-1.5 text-sm text-emerald-100 mb-6">
            <Link href="/" className="hover:text-white transition-colors">{tr('home')}</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>{tr('howItWorks')}</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{t('heroTitle')}</h1>
          <p className="text-emerald-100 text-lg max-w-2xl">
            {t('heroDescription')}
          </p>
        </div>
      </div>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-4">
            {t('stepsTitle')}
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-lg mx-auto">
            {t('stepsSubtitle')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 text-white shadow-lg">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {i + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t(`step${i + 1}Title`)}</h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">{t(`step${i + 1}Description`)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-[#111827]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            {t('benefitsTitle')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <div key={i} className="rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t(`benefit${i + 1}Title`)}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{t(`benefit${i + 1}Description`)}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">
            {t('faqTitle')}
          </h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <details key={i} className="group rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 transition-colors">
                  {t(`faq${item.index}Question`)}
                  <span className="ml-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </span>
                </summary>
                <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">
                  {t(`faq${item.index}Answer`)}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-emerald-600 to-green-500 text-white text-center">
        <div className="mx-auto max-w-xl px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">{t('ctaTitle')}</h2>
          <p className="text-emerald-100 mb-6">{t('ctaSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register">
              <button className="h-12 px-8 rounded-xl bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-gray-100 transition-colors w-full sm:w-auto">
                {t('createFreeAccount')}
              </button>
            </Link>
            <Link href="/produtos">
              <button className="h-12 px-8 rounded-xl border-2 border-white text-white font-semibold hover:bg-white/10 transition-colors w-full sm:w-auto">
                {t('exploreProducts')}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}