import { API_BASE_URL } from './api'

export type SocialProvider = 'google' | 'facebook' | 'linkedin'

export function startSocialLogin(provider: SocialProvider) {
  if (typeof window === 'undefined') return
  // Navegação intencional para o servidor de API (fluxo OAuth do provider), não para uma página Next.js interna
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.href = `${API_BASE_URL}/api/auth/${provider}`
}