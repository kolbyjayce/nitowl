import { app, BrowserWindow, Menu, type MenuItemConstructorOptions } from 'electron'

const isMac = process.platform === 'darwin'

function openSettings(): void {
  const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
  win?.webContents.send('open-settings')
}

const settingsItem: MenuItemConstructorOptions = {
  label: 'Settings…',
  accelerator: 'CommandOrControl+,',
  click: openSettings
}

export function buildMenu(): void {
  const template: MenuItemConstructorOptions[] = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              settingsItem,
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          } satisfies MenuItemConstructorOptions
        ]
      : [
          {
            label: 'File',
            submenu: [settingsItem, { type: 'separator' }, { role: 'quit' }]
          } satisfies MenuItemConstructorOptions
        ]),
    { role: 'editMenu' },
    { role: 'viewMenu' },
    { role: 'windowMenu' }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
