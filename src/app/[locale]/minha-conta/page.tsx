'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/i18n/navigation'
import { ChevronRight, User, Package, MapPin, Heart, LogOut, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { useAuthStore } from '@/store/auth-store'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/utils'
import { fetchOrders, updateProfile, type UiOrder, getStatusLabel, getStatusColor } from '@/lib/api-helpers'

export default function MinhaContaPage() {
  const t = useTranslations('myAccount')
  const tc = useTranslations('common')
  const tr = useTranslations('routes')
  const router = useRouter()
  const { user, setUser, logout } = useAuthStore()
  const [activeTab, setActiveTab] = React.useState('profile')
  const [form, setForm] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  })
  const [aiConsent, setAiConsent] = React.useState(user?.aiValidationConsent ?? false)
  const [orders, setOrders] = React.useState<UiOrder[]>([])
  const [loadingOrders, setLoadingOrders] = React.useState(true)

  React.useEffect(() => {
    fetchOrders({ limit: 10 })
      .then((data) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoadingOrders(false))
  }, [])

  const tabs = [
    { id: 'profile', label: t('tabs.profile'), icon: User },
    { id: 'orders', label: t('tabs.orders'), icon: Package },
    { id: 'addresses', label: t('tabs.addresses'), icon: MapPin },
    { id: 'favorites', label: t('tabs.favorites'), icon: Heart },
  ]

  const handleSaveProfile = async () => {
    try {
      const updated = await updateProfile({ name: form.name, phone: form.phone, aiValidationConsent: aiConsent })
      setUser({
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        role: user?.role || 'buyer',
        avatar: updated.avatar,
        aiValidationConsent: aiConsent,
      })
      toast(t('profileUpdated'), 'success')
    } catch {
      toast(t('profileUpdateError'), 'error')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-emerald-600 transition-colors">{tr('home')}</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-900 dark:text-white font-medium">{tr('myAccount')}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 sticky top-24">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <Avatar fallback={user?.name || 'U'} size="lg" />
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{user?.name || t('fallbackName')}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'email@email.com'}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      activeTab === tab.id
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                )
              })}
              <hr className="my-2 border-gray-100" />
              <button
                onClick={() => { logout(); router.push('/'); }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t('logout')}
              </button>
            </nav>
          </div>
        </aside>

        <div className="md:col-span-3">
          {activeTab === 'profile' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('profileTitle')}</h2>
              <div className="flex items-center gap-4 mb-6">
                <Avatar fallback={user?.name || 'U'} size="lg" className="h-20 w-20 text-xl" />
                <button className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  <Camera className="h-4 w-4" />
                  {t('changePhoto')}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <Input
                  label={t('formName')}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                <Input
                  label={t('formEmail')}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  disabled
                />
                <Input
                  label={t('formPhone')}
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <label className="mt-6 flex cursor-pointer select-none items-start gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <input
                  type="checkbox"
                  checked={aiConsent}
                  onChange={(e) => setAiConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600"
                />
                <span>
                  <span className="block text-sm font-medium text-gray-900 dark:text-white">{t('consentTitle')}</span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('consentText')}</span>
                </span>
              </label>
              <Button className="mt-6" onClick={handleSaveProfile}>{t('saveChanges')}</Button>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('myOrders')}</h2>
              {loadingOrders ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 animate-pulse">
                      <div className="flex justify-between">
                        <div>
                          <div className="h-4 bg-gray-100 rounded w-24 mb-2" />
                          <div className="h-3 bg-gray-100 rounded w-48" />
                        </div>
                        <div className="h-4 bg-gray-100 rounded w-20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/minha-conta/pedidos/${order.id}`}
                    className="block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 dark:text-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{order.id}</p>
                        <p className="text-sm text-gray-500">{t('orderMeta', { date: order.date, count: order.items })}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('pt-AO', { style: 'decimal' }).format(order.total)} {tc('currency')}</p>
                        <span className={cn('inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold', getStatusColor(order.status))}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-gray-500 text-sm">{t('noOrders')}</p>
              )}
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('addressesTitle')}</h2>
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">{t('noAddresses')}</p>
                <Button variant="outline" size="sm">{t('addAddress')}</Button>
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('favoritesTitle')}</h2>
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                <Heart className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">{t('noFavorites')}</p>
                <Link href="/produtos"><Button variant="outline" size="sm">{t('exploreProducts')}</Button></Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}