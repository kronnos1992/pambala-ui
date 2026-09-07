import nacl from 'tweetnacl'

/**
 * Cliente E2E para frontend (Next.js)
 * Gerencia toda criptografia/descriptografia transparentemente
 */
export class E2EClient {
  private keyPair: nacl.BoxKeyPair | null = null
  private serverPublicKey: string | null = null
  private sessionId: string | null = null
  private apiUrl: string

  constructor(apiUrl: string = 'http://localhost:3001/api') {
    this.apiUrl = apiUrl
    this.loadFromStorage()
  }

  /**
   * Carrega session ID do localStorage (se existir)
   */
  private loadFromStorage() {
    if (typeof window === 'undefined') return

    const saved = localStorage.getItem('e2e_session_id')
    if (saved) {
      this.sessionId = saved
    }
  }

  /**
   * Inicializa o cliente E2E (chamado UMA VEZ na app startup)
   */
  async init(): Promise<string> {
    try {
      console.log('🔐 Initializing E2E Client...')

      // 1. Obter public key do servidor
      const keyResponse = await fetch(`${this.apiUrl}/security/public-key`)
      if (!keyResponse.ok) {
        throw new Error('Failed to fetch server public key')
      }
      const keyData = await keyResponse.json()
      this.serverPublicKey = keyData.publicKey

      // 2. Gerar keypair do cliente
      this.keyPair = nacl.box.keyPair()

      // 3. Fazer handshake
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

      // 4. Guardar no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('e2e_session_id', this.sessionId as string)
      }

      console.log(
        `✅ E2E Client initialized successfully (Session: ${this.sessionId?.slice(0, 8)}...)`
      )
return this.sessionId ?? ''
    } catch (error) {
      console.error('❌ E2E Init error:', error)
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('e2e_session_id')
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
export const e2eClient = new E2EClient()
