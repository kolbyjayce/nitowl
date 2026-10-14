import { useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
import type { GitHubUser } from '../../preload/index.d'
import { SettingsDialog } from '@renderer/components/settings-dialog'
import { LoginView } from '@renderer/components/login-view'
import { Logo } from '@renderer/components/logo'
import { TitleBar } from '@renderer/components/title-bar'
import { Button } from '@renderer/components/ui/button'

// macOS reaches settings through the app menu (NitOwl → Settings…, Cmd+,).
const isMac = window.electron.process.platform === 'darwin'

function App():React.JSX.Element {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [user, setUser] = useState<GitHubUser | null>(null)

  // Check auth status on mount
  useEffect(() => {
    window.api.auth.status().then(({ authenticated }) => {
      setAuthenticated(authenticated)
      if (authenticated) {
        window.api.auth.user().then((u) => setUser(u))
      }
    })
  }, [])

  // The native menu (NitOwl → Settings…, File → Settings…) and Ctrl/Cmd+, open settings.
  useEffect(() => window.api.onOpenSettings(() => setSettingsOpen(true)), [])

  const signOut = async (): Promise<void> => {
    await window.api.auth.logout()
    setSettingsOpen(false)
    setUser(null)
    setAuthenticated(false)
  }

  // Loading state while checking auth
  if (authenticated === null)
    return (
      <div className="min-h-screen bg-background">
        <p>loading...</p>
      </div>
    )

  // Not authenticated — show login
  if (!authenticated)
    return (
      <LoginView
        onAuthenticated={() => {
          setAuthenticated(true)
          window.api.auth.user().then((u) => setUser(u))
        }}
      />
    )

  return (
    <div className="flex min-h-screen flex-col">
      <TitleBar>
        <Logo className="size-5" />
        <span className="font-mono text-tab font-bold">NitOwl</span>
        {!isMac && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="ml-auto"
            aria-label="settings"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings />
          </Button>
        )}
      </TitleBar>
      <main className="flex flex-1 items-center justify-center">
        {user && (
          <div className="flex flex-col items-center gap-4">
            <img
              src={user.avatar_url}
              alt={user.login}
              className="size-16 rounded-full border border-border"
            />
            <div className="flex flex-col items-center gap-1">
              {user.name && <span className="text-body font-medium">{user.name}</span>}
              <span className="font-mono text-tab text-muted-foreground">{user.login}</span>
            </div>
          </div>
        )}
      </main>
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        user={user}
        onSignOut={signOut}
      />
    </div>
  )
}

export default App
