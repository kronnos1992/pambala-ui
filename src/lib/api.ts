import axios, { InternalAxiosRequestConfig } from 'axios'
import { e2eClient } from './e2e-client'

type E2ERetryConfig = InternalAxiosRequestConfig & {
  _e2eOriginal?: unknown
  _e2eRetried?: boolean
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://pambala-api.monait.workers.dev/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
  : 'https://pambala-api.monait.workers.dev'

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
      ;(config as E2ERetryConfig)._e2eOriginal = config.data
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

    // Self-heal E2E: se a sessão foi perdida no servidor (restart/expiry),
    // re-faz o handshake e repete o pedido uma vez, de forma transparente.
    // Válido para GETs (respostas cifradas com 400 "Invalid session") e
    // para writes cujo body foi rejeitado por sessão inválida.
    const retryConfig = error.config as E2ERetryConfig | undefined
    if (
      retryConfig &&
      !retryConfig._e2eRetried &&
      error.response?.status === 400 &&
      typeof error.response?.data?.error === 'string' &&
      /invalid session|session expired|decryption failed/i.test(
        error.response.data.error
      )
    ) {
      retryConfig._e2eRetried = true
      if (retryConfig._e2eOriginal) {
        retryConfig.data = retryConfig._e2eOriginal
      }
      return e2eClient
        .init()
        .then(() => api(retryConfig))
        .catch(() => Promise.reject(error))
    }

    return Promise.reject(error)
  }
)

export default api
