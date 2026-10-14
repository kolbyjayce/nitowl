import type { BrowserWindow, WebContents } from 'electron'
import { is } from '@electron-toolkit/utils'

export function toggleDevTools(webContents: WebContents): void {
  if (webContents.isDevToolsOpened()) webContents.closeDevTools()
  else webContents.openDevTools({ mode: 'detach' })
}

/**
 * Window keyboard shortcuts. Replaces `optimizer.watchWindowShortcuts` from
 * `@electron-toolkit/utils`, which only binds F12 in dev and swallows
 * Ctrl+Shift+I in production. The window has no menu bar on Windows/Linux, so
 * menu accelerators can't be relied on either; DevTools and Settings are bound
 * here for every platform and build.
 */
export function watchShortcuts(window: BrowserWindow): void {
  const { webContents } = window
  webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return
    const mod = input.control || input.meta

    // F12, Ctrl+Shift+I (Windows/Linux), Cmd+Opt+I (macOS)
    const devTools =
      input.code === 'F12' ||
      (input.code === 'KeyI' && ((input.control && input.shift) || (input.meta && input.alt)))
    if (devTools) {
      toggleDevTools(webContents)
      event.preventDefault()
      return
    }

    // Opening is idempotent, so a double fire with the macOS menu accelerator is harmless.
    if (input.code === 'Comma' && mod) {
      webContents.send('open-settings')
      event.preventDefault()
      return
    }

    // Keep the toolkit's defaults: no reload in production, no zoom.
    if (!is.dev && input.code === 'KeyR' && mod) event.preventDefault()
    if (input.code === 'Minus' && mod) event.preventDefault()
    if (input.code === 'Equal' && input.shift && mod) event.preventDefault()
  })
}
