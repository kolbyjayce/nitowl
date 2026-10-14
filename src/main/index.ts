import { app, shell, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { join } from 'path'
import { electronApp, is } from '@electron-toolkit/utils'
import { buildMenu } from './menu'
import { toggleDevTools, watchShortcuts } from './shortcuts'
import { Auth } from './services/auth'
import icon from '../../resources/icon.png?asset'

// Without this the app menu, About panel and dock use package.json's "nitowl" (or "Electron" in dev).
app.setName('NitOwl')

const overlayFor =(dark: boolean): { color: string; symbolColor: string; height: number } => ({
  color: dark ? '#121317' : '#f6f5f1',
  symbolColor: dark ? '#f3f2ee' : '#1b1d23',
  height: 48
})

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 720,
    minHeight: 480,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#121317' : '#f6f5f1',
    // Windowless: no native title bar, content runs edge to edge.
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    ...(process.platform === 'darwin'
      ? { trafficLightPosition: { x: 16, y: 16 } }
      : { titleBarOverlay: overlayFor(nativeTheme.shouldUseDarkColors) }),
    ...(process.platform !== 'darwin' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.nitowl.app')

  // DevTools (F12 / Ctrl+Shift+I / Cmd+Opt+I) and Settings (Ctrl/Cmd+,) in every build;
  // ignore CommandOrControl + R in production.
  app.on('browser-window-created', (_, window) => {
    watchShortcuts(window)
  })

  ipcMain.on('devtools:toggle', (event) => toggleDevTools(event.sender))

  // Keep the Windows/Linux window controls overlay in step with the app theme.
  ipcMain.on('title-bar-theme', (event, theme: 'light' | 'dark') => {
    if (process.platform === 'darwin') return
    BrowserWindow.fromWebContents(event.sender)?.setTitleBarOverlay(overlayFor(theme === 'dark'))
  })

  const auth = new Auth()

  ipcMain.handle('auth:status', () => ({
    authenticated: auth.isAuthenticated
  }))

  ipcMain.handle('auth:user', async () => {
    return auth.getUser()
  })

  ipcMain.handle('auth:login', async () => {
    const { userCode, verificationUri } = await auth.startDeviceFlow()
    return { userCode, verificationUri }
  })

  ipcMain.handle('auth:open-browser', (_, url: string) => {
    let parsed: URL
    try {
      parsed = new URL(String(url))
    } catch (e) {
      return
    }

    if (parsed.protocol !== 'https:' || parsed.hostname !== 'github.com')
      return

    return shell.openExternal(parsed.toString())
  })

  ipcMain.handle('auth:wait', async () => {
    // Resolves on success, terminal failure (access_denied, expired_token, network error),
    // or when the flow is superseded/cancelled.
    return auth.waitForFlow()
  })

  ipcMain.handle('auth:logout', () => {
    auth.logout()
    return { authenticated: false }
  })

  buildMenu()

  if (process.platform === 'darwin') app.dock?.setIcon(icon)

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
