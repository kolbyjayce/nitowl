import { ElectronAPI } from '@electron-toolkit/preload'

type View = 'app' | 'settings'

interface Api {
  /** Subscribe to menu-driven navigation. Returns an unsubscribe function. */
  onNavigate: (callback: (to: View) => void) => () => void
  /** Keep the Windows/Linux window controls overlay in sync with the app theme. */
  setTitleBarTheme: (theme: 'light' | 'dark') => void
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
