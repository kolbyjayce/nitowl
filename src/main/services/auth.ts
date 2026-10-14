import { safeStorage } from 'electron'
import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs'

const CLIENT_ID = 'Ov23liTtZOSjJ6o3chwb'
const DEVICE_CODE_URL = 'https://github.com/login/device/code'
const ACCESS_TOKEN_URL = 'https://github.com/login/oauth/access_token'
const SCOPE = 'repo'

interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

interface TokenResponse {
  access_token: string
  token_type: string
  scope: string
}

interface PollResponse {
  access_token?: string
  token_type?: string
  scope?: string
  error?: string
}

export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  email: string | null
}

export class Auth {
  private _token: string | null = null
  private _pollTimer: ReturnType<typeof setTimeout> | null = null
  private _flowGeneration = 0
  private _flowError: string | null = null
  private _waiters: Array<() => void> = []

  private get tokenPath(): string {
    return join(app.getPath('userData'), '.gh-token')
  }

  constructor() {
    this._token = this.loadToken()
  }

  get isAuthenticated(): boolean {
    return this._token !== null
  }

  get token(): string | null {
    return this._token
  }

  /** Last terminal device-flow failure (access_denied, expired_token, network error), if any. */
  get flowError(): string | null {
    return this._flowError
  }

  /** Resolves once the current flow succeeds, fails terminally, or is superseded/cancelled. */
  waitForFlow(): Promise<{ authenticated: boolean; error: string | null }> {
    if (this._token !== null || this._flowError !== null || this._pollTimer === null) {
      return Promise.resolve({ authenticated: this.isAuthenticated, error: this._flowError })
    }
    return new Promise((resolve) => {
      this._waiters.push(() => resolve({ authenticated: this.isAuthenticated, error: this._flowError }))
    })
  }

  private settleWaiters(): void {
    const waiters = this._waiters
    this._waiters = []
    for (const w of waiters) w()
  }

  private failFlow(generation: number, error: string): void {
    if (generation !== this._flowGeneration) return
    this._flowError = error
    this._pollTimer = null
    this.settleWaiters()
  }

  /** Start the device flow. Returns the user code and verification URI for the renderer to display. */
  async startDeviceFlow(): Promise<{ userCode: string; verificationUri: string }> {
    const generation = ++this._flowGeneration
    if (this._pollTimer) clearTimeout(this._pollTimer)
    this._pollTimer = null
    this._flowError = null
    this.settleWaiters()

    const res = await fetch(DEVICE_CODE_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ client_id: CLIENT_ID, scope: SCOPE })
    })

    if (!res.ok) throw new Error(`Device code request failed: ${res.status}`)

    const data = (await res.json()) as DeviceCodeResponse

    // A newer flow or logout may have started while the request was in flight.
    if (generation !== this._flowGeneration) {
      return { userCode: data.user_code, verificationUri: data.verification_uri }
    }

    // Start polling for the token in the background
    this.pollForToken(data.device_code, data.interval, data.expires_in, generation)

    return {
      userCode: data.user_code,
      verificationUri: data.verification_uri
    }
  }

  /** Poll GitHub until the user authorizes or the code expires. Resolves via the stored token. */
  private pollForToken(
    deviceCode: string,
    interval: number,
    expiresIn: number,
    generation: number,
  ): void {
    const deadline = Date.now() + expiresIn * 1000
    let currentInterval = interval

    const poll = async (): Promise<void> => {
      if (generation !== this._flowGeneration) return
      if (Date.now() > deadline) return this.failFlow(generation, 'expired_token')

      let data: PollResponse
      try {
        const res = await fetch(ACCESS_TOKEN_URL, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            client_id: CLIENT_ID,
            device_code: deviceCode,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
          })
        })
        data = (await res.json()) as PollResponse
      } catch {
        // Transient network/parse failure: retry at the current interval until the deadline.
        if (generation === this._flowGeneration) {
          this._pollTimer = setTimeout(poll, currentInterval * 1000)
        }
        return
      }

      if (generation !== this._flowGeneration) return

      if (data.access_token) {
        this._token = data.access_token
        this._pollTimer = null
        try {
          this.saveToken(data.access_token)
        } catch {
          // Token stays in memory for this session, but it won't survive a restart.
          this._flowError = 'token_not_persisted'
        }
        this.settleWaiters()
        return
      }

      if (data.error === 'authorization_pending') {
        this._pollTimer = setTimeout(poll, currentInterval * 1000)
        return
      }

      if (data.error === 'slow_down') {
        currentInterval += 5
        this._pollTimer = setTimeout(poll, currentInterval * 1000)
        return
      }

      // expired_token, access_denied, or other terminal error — stop polling
      this.failFlow(generation, data.error ?? 'unknown_error')
    }
    if (generation === this._flowGeneration) {
      this._pollTimer = setTimeout(poll, interval * 1000)
    }
  }

  /** Fetch the authenticated user's profile from GitHub. */
  async getUser(): Promise<GitHubUser | null> {
    const token = this._token
    if (!token) return null

    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json'
      }
    })

    if (res.status === 401) {
      // Token was revoked or expired; only clear it if a newer login hasn't replaced it meanwhile.
      if (this._token === token) this.logout()
      return null
    }

    if (!res.ok) return null

    const data = await res.json()
    return {
      login: data.login,
      name: data.name,
      avatar_url: data.avatar_url,
      email: data.email
    }
  }

  logout(): void {
    this._flowGeneration++
    this._token = null
    this._flowError = null
    if (this._pollTimer) clearTimeout(this._pollTimer)
    this._pollTimer = null
    this.settleWaiters()

    if (existsSync(this.tokenPath)) unlinkSync(this.tokenPath)
  }

  private saveToken(token: string): void {
    const encrypted = safeStorage.encryptString(token)
    writeFileSync(this.tokenPath, encrypted)
  }

  private loadToken(): string | null {
    if (!existsSync(this.tokenPath)) return null
    if (!safeStorage.isEncryptionAvailable()) return null

    try {
      const encrypted = readFileSync(this.tokenPath)
      return safeStorage.decryptString(encrypted)
    } catch {
      return null
    }
  }
}
