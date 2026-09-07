import axios from 'axios'
import { e2eClient } from './e2e-client'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
  : 'http://localhost:3001'

/**
 * Request Interceptor: Autentica + Criptografa
 */
api.interceptors.request.use(async (config) => {
  // 1. Adicionar Auth Token
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('pambala-auth')
      if (raw) {
        const parsed = JSON.parse(raw)
        const token = parsed?.state?.token
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      }
    } catch {}
  }

  // 2. Adicionar Session ID do E2E
  const sessionId = e2eClient.getSessionId()
  if (sessionId) {
    config.headers['X-Session-ID'] = sessionId
  }

  // 3. Criptografar body se houver dados (exceto multipart/upload)
  if (
    config.data &&
    typeof config.data === 'object' &&
    !(config.data instanceof FormData)
  ) {
    try {
      const { encrypted, nonce } = e2eClient.encrypt(config.data)
      config.data = { encrypted, nonce }
    } catch (error) {
      console.error('Request encryption error:', error)
    }
  }

  return config
})

/**
 * Response Interceptor: Descriptografa + Trata erros
 */
api.interceptors.response.use(
  (response) => {
    // Descriptografar resposta se ela tiver encrypted payload
    if (response.data?.encrypted && response.data?.nonce) {
      try {
        const decrypted = e2eClient.decrypt(response.data.encrypted, response.data.nonce)
        response.data = decrypted
      } catch (error) {
        console.error('Response decryption error:', error)
        throw error
      }
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || ''
      const isAuthRoute = url.includes('/auth/login') || url.includes('/auth/register')

      if (!isAuthRoute && typeof window !== 'undefined') {
        localStorage.removeItem('pambala-auth')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
