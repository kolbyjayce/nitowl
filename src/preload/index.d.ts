import { ElectronAPI } from '@electron-toolkit/preload'

export interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  email: string | null
}

interface AuthApi {
  status: () => Promise<{ authenticated: boolean }>
  user: () => Promise<GitHubUser | null>
  login: () => Promise<{ userCode: string; verificationUri: string }>
  openBrowser: (url: string) => Promise<void>
  wait: () => Promise<{ authenticated: boolean }>
  logout: () => Promise<{ authenticated: boolean }>
}

interface Api {
  /** Subscribe to Settings requests (menu or Ctrl/Cmd+,). Returns an unsubscribe function. */
  onOpenSettings: (callback: () => void) => () => void
  /** Keep the Windows/Linux window controls overlay in sync with the app theme. */
  setTitleBarTheme: (theme: 'light' | 'dark') => void
  /** Open or close Chromium DevTools for this window. */
  toggleDevTools: () => void
  /** GitHub OAuth device-flow authentication. */
  auth: AuthApi
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
