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

  /** Start the device flow. Returns the user code and verification URI for the renderer to display. */
  async startDeviceFlow(): Promise<{ userCode: string; verificationUri: string }> {
    const generation = ++this._flowGeneration
    if (this._pollTimer) clearTimeout(this._pollTimer)
    this._pollTimer = null

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

    const poll = async (): Promise<void> => {
      if (generation !== this._flowGeneration || Date.now() > deadline)
        return

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

      const data = (await res.json()) as PollResponse

      if (generation !== this._flowGeneration)
        return

      if (data.access_token) {
        this._token = data.access_token
        this.saveToken(data.access_token)
        return
      }

      if (data.error === 'authorization_pending') {
        if (generation !== this._flowGeneration)
          return
        this._pollTimer = setTimeout(poll, interval * 1000)
        return
      }

      if (data.error === 'slow_down') {
        if (generation !== this._flowGeneration)
          return
        this._pollTimer = setTimeout(poll, (interval + 5) * 1000)
        return
      }

      // expired_token, access_denied, or other terminal error — stop polling
    }
    if (generation === this._flowGeneration) {
      this._pollTimer = setTimeout(poll, interval * 1000)
    }
  }

  /** Fetch the authenticated user's profile from GitHub. */
  async getUser(): Promise<GitHubUser | null> {
    if (!this._token) return null

    const res = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${this._token}`,
        Accept: 'application/vnd.github+json'
      }
    })

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
    if (this._pollTimer) clearTimeout(this._pollTimer)
    this._pollTimer = null

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
