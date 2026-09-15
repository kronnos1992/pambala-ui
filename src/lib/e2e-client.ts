import nacl from 'tweetnacl'

/**
 * Cliente E2E para frontend (Next.js)
 * Gerencia toda criptografia/descriptografia transparentemente
 */
export class E2EClient {
  private keyPair: nacl.BoxKeyPair | null = null
  private serverPublicKey: string | null = null
  private sessionId: string | null = null
  private initPromise: Promise<string> | null = null
  private apiUrl: string

  constructor(
    apiUrl: string = process.env.NEXT_PUBLIC_API_URL ||
      'https://pambala-api.monait.workers.dev/api'
  ) {
    this.apiUrl = apiUrl
    this.loadFromStorage()
  }

  /**
   * Carrega session ID e keypair persistidos do localStorage (se existirem).
   * O keypair é persistido para garantir que encrypção/descriptografação
   * continuam consistentes entre recargas e handshakes concorrentes.
   */
  private loadFromStorage() {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem('e2e_session_id')
      if (saved) this.sessionId = saved

      const secretB64 = localStorage.getItem('e2e_client_secret_key')
      const publicB64 = localStorage.getItem('e2e_client_public_key')
      if (secretB64 && publicB64) {
        this.keyPair = {
          publicKey: Buffer.from(publicB64, 'base64'),
          secretKey: Buffer.from(secretB64, 'base64'),
        }
      }

      const serverB64 = localStorage.getItem('e2e_server_public_key')
      if (serverB64) this.serverPublicKey = serverB64
    } catch {
      // storage corrompido: ignora e volta a gerar na próxima init
      this.keyPair = null
      this.serverPublicKey = null
      this.sessionId = null
    }
  }

  private persist() {
    if (typeof window === 'undefined') return
    try {
      if (this.keyPair) {
        localStorage.setItem('e2e_client_secret_key', Buffer.from(this.keyPair.secretKey).toString('base64'))
        localStorage.setItem('e2e_client_public_key', Buffer.from(this.keyPair.publicKey).toString('base64'))
      }
      if (this.serverPublicKey) {
        localStorage.setItem('e2e_server_public_key', this.serverPublicKey)
      }
      localStorage.setItem('e2e_session_id', this.sessionId ?? '')
    } catch {
      // quota/privacidade: não crítico
    }
  }

  /**
   * Inicializa o cliente E2E.
   * - Idempotente e segura contra chamadas concorrentes (ex: StrictMode
   *   double-mount): apenas um handshake é realizado.
   * - Reutiliza o MESMO keypair persistido, para que qualquer sessão
   *   associada a esse clientPublicKey continue a cifrar/decifrar.
   */
  async init(): Promise<string> {
    if (this.initPromise) return this.initPromise

    this.initPromise = this.doInit().finally(() => {
      this.initPromise = null
    })

    return this.initPromise
  }

  private async doInit(): Promise<string> {
    try {
      console.log('🔐 Initializing E2E Client...')

      // 1. Obter public key do servidor
      const keyResponse = await fetch(`${this.apiUrl}/security/public-key`)
      if (!keyResponse.ok) {
        throw new Error('Failed to fetch server public key')
      }
      const keyData = await keyResponse.json()
      this.serverPublicKey = keyData.publicKey

      // 2. Reutilizar keypair persistido (ou gerar uma única vez)
      if (!this.keyPair) {
        this.keyPair = nacl.box.keyPair()
      }

      // 3. Fazer handshake com o mesmo clientPublicKey
      const handshakeResponse = await fetch(`${this.apiUrl}/security/handshake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientPublicKey: Buffer.from(this.keyPair.publicKey).toString('base64'),
        }),
      })

      if (!handshakeResponse.ok) {
        throw new Error('Handshake failed')
      }

      const handshakeData = await handshakeResponse.json()
      this.sessionId = handshakeData.sessionId ?? ''

      // 4. Persistir (session + keypair)
      this.persist()

      console.log(
        `✅ E2E Client initialized successfully (Session: ${this.sessionId?.slice(0, 8)}...)`
      )
      return this.sessionId ?? ''
    } catch (error) {
      console.error('❌ E2E Init error:', error)
      this.sessionId = null
      throw error
    }
  }

  /**
   * Criptografa dados ANTES de enviar para servidor
   */
  encrypt(plaintext: any): { encrypted: string; nonce: string } {
    if (!this.keyPair || !this.serverPublicKey) {
      throw new Error('E2E Client not initialized. Call init() first.')
    }

    try {
      const nonce = nacl.randomBytes(24)
      const serverKey = Buffer.from(this.serverPublicKey, 'base64')

      const encrypted = nacl.box(
        Buffer.from(JSON.stringify(plaintext)),
        nonce,
        serverKey,
        this.keyPair.secretKey
      )

      return {
        encrypted: Buffer.from(encrypted).toString('base64'),
        nonce: Buffer.from(nonce).toString('base64'),
      }
    } catch (error: any) {
      console.error('Encryption error:', error)
      throw new Error(`Encryption failed: ${error.message}`)
    }
  }

  /**
   * Descriptografa dados recebidos do servidor
   */
  decrypt(encryptedB64: string, nonceB64: string): any {
    if (!this.keyPair || !this.serverPublicKey) {
      throw new Error('E2E Client not initialized. Call init() first.')
    }

    try {
      const encrypted = Buffer.from(encryptedB64, 'base64')
      const nonce = Buffer.from(nonceB64, 'base64')
      const serverKey = Buffer.from(this.serverPublicKey, 'base64')

      const decrypted = nacl.box.open(
        encrypted,
        nonce,
        serverKey,
        this.keyPair.secretKey
      )

      if (!decrypted) {
        throw new Error('Decryption returned null')
      }

      return JSON.parse(Buffer.from(decrypted).toString('utf-8'))
    } catch (error: any) {
      console.error('Decryption error:', error)
      throw new Error(`Decryption failed: ${error.message}`)
    }
  }

  /**
   * Retorna session ID
   */
  getSessionId(): string {
    if (!this.sessionId) {
      if (typeof window !== 'undefined') {
        this.sessionId = localStorage.getItem('e2e_session_id') || ''
      }
    }
    return this.sessionId || ''
  }

  /**
   * Limpa session (logout)
   */
  clear() {
    this.sessionId = null
    this.keyPair = null
    this.serverPublicKey = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('e2e_session_id')
      localStorage.removeItem('e2e_client_secret_key')
      localStorage.removeItem('e2e_client_public_key')
      localStorage.removeItem('e2e_server_public_key')
    }
  }

  /**
   * Retorna status do cliente
   */
  getStatus() {
    return {
      initialized: !!(this.keyPair && this.serverPublicKey && this.sessionId),
      sessionId: this.sessionId?.slice(0, 8) + '...' || 'None',
      hasKeyPair: !!this.keyPair,
      hasServerKey: !!this.serverPublicKey,
    }
  }
}

// Instância global
export const e2eClient = new E2EClient(
  process.env.NEXT_PUBLIC_API_URL || 'https://pambala-api.monait.workers.dev/api'
)
