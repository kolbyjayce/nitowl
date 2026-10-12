import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  onNavigate: (callback: (to: 'app' | 'settings') => void): (() => void) => {
    const listener = (_: Electron.IpcRendererEvent, to: 'app' | 'settings'): void => callback(to)
    ipcRenderer.on('navigate', listener)
    return () => ipcRenderer.removeListener('navigate', listener)
  },
  setTitleBarTheme: (theme: 'light' | 'dark'): void => ipcRenderer.send('title-bar-theme', theme)
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
