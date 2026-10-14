import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

interface GitHubUser {
  login: string
  name: string | null
  avatar_url: string
  email: string | null
}

// Custom APIs for renderer
const api = {
  onOpenSettings: (callback: () => void): (() => void) => {
    const listener = (): void => callback()
    ipcRenderer.on('open-settings', listener)
    return () => ipcRenderer.removeListener('open-settings', listener)
  },
  setTitleBarTheme: (theme: 'light' | 'dark'): void => ipcRenderer.send('title-bar-theme', theme),
  toggleDevTools: (): void => ipcRenderer.send('devtools:toggle'),

  auth: {
    status: (): Promise<{ authenticated: boolean }> => ipcRenderer.invoke('auth:status'),
    user: (): Promise<GitHubUser | null> => ipcRenderer.invoke('auth:user'),
    login: (): Promise<{ userCode: string; verificationUri: string }> =>
      ipcRenderer.invoke('auth:login'),
    openBrowser: (url: string): Promise<void> => ipcRenderer.invoke('auth:open-browser', url),
    wait: (): Promise<{ authenticated: boolean; error: string | null }> => ipcRenderer.invoke('auth:wait'),
    logout: (): Promise<{ authenticated: boolean }> => ipcRenderer.invoke('auth:logout')
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
