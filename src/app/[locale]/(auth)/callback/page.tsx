import { setRequestLocale } from 'next-intl/server'
import CallbackClient from '@/components/auth/callback-client'

export default async function CallbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ token?: string; error?: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const sp = await searchParams

  return <CallbackClient token={sp.token} error={sp.error} />
}
