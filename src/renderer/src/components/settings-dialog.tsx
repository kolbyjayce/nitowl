import { useRef, useState } from 'react'
import { Bug, LogOut } from 'lucide-react'
import type { GitHubUser } from '../../../preload/index.d'
import { ThemeSwitcher } from '@renderer/components/theme-switcher'
import { Button } from '@renderer/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@renderer/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { Gallery } from '@renderer/gallery'

const { platform, versions } = window.electron.process
const devToolsKeys = platform === 'darwin' ? ['F12', '⌘⌥I'] : ['F12', 'Ctrl+Shift+I']

const SECTIONS = ['account', 'appearance', 'developer', 'components'] as const

function Section({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-mono text-meta font-medium tracking-widest text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  )
}

function AccountSection({
  user,
  onSignOut
}: {
  user: GitHubUser | null
  onSignOut: () => Promise<void>
}): React.JSX.Element {
  const [signingOut, setSigningOut] = useState(false)

  return (
    <Section title="github">
      {!user && (
        <p className="text-tab text-muted-foreground">
          signed in, but couldn&apos;t load your github profile
        </p>
      )}
      {user && (
        <div className="flex items-center gap-4 rounded-xl border bg-background p-4">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="size-12 rounded-full border border-border"
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            {user.name && <span className="truncate text-body font-medium">{user.name}</span>}
            <span className="truncate font-mono text-tab text-muted-foreground">{user.login}</span>
            {user.email && (
              <span className="truncate font-mono text-meta text-subtle-foreground">
                {user.email}
              </span>
            )}
          </div>
        </div>
      )}
      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        disabled={signingOut}
        onClick={async () => {
          setSigningOut(true)
          try {
            await onSignOut()
          } finally {
            setSigningOut(false)
          }
        }}
      >
        <LogOut /> sign out
      </Button>
    </Section>
  )
}

function DeveloperSection(): React.JSX.Element {
  const rows: [string, string | undefined][] = [
    ['electron', versions.electron],
    ['chrome', versions.chrome],
    ['node', versions.node],
    ['platform', platform]
  ]

  return (
    <div className="flex flex-col gap-8">
      <Section title="devtools">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => window.api.toggleDevTools()}>
            <Bug /> toggle developer tools
          </Button>
          <span className="flex items-center gap-1.5 text-tab text-muted-foreground">
            {devToolsKeys.map((key, i) => (
              <span key={key} className="flex items-center gap-1.5">
                {i > 0 && 'or'}
                <kbd className="rounded-sm border bg-background px-1.5 py-0.5 text-meta">{key}</kbd>
              </span>
            ))}
          </span>
        </div>
      </Section>
      <Section title="versions">
        <dl className="grid w-fit grid-cols-[auto_auto] gap-x-6 gap-y-1.5 font-mono text-tab">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="select-text">{value ?? '—'}</dd>
            </div>
          ))}
        </dl>
      </Section>
    </div>
  )
}

function SettingsDialog({
  open,
  onOpenChange,
  user,
  onSignOut
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: GitHubUser | null
  onSignOut: () => Promise<void>
}): React.JSX.Element {
  // Remember what had focus before opening. Read during render because Radix moves focus
  // into the dialog as soon as it mounts, before any effect here would run.
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)
  if (open && !wasOpenRef.current) {
    const active = document.activeElement
    returnFocusRef.current =
      active instanceof HTMLElement && active !== document.body ? active : null
  }
  wasOpenRef.current = open

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        onCloseAutoFocus={(event) => {
          // Opened from the native menu or a shortcut: nothing was focused, so fall back to the
          // app root instead of dropping focus on <body>.
          event.preventDefault()
          const target = returnFocusRef.current
          returnFocusRef.current = null
          if (target?.isConnected) {
            target.focus()
            return
          }
          const root = document.getElementById('root')
          if (root) {
            if (!root.hasAttribute('tabindex')) root.tabIndex = -1
            root.focus({ preventScroll: true })
          }
        }}
        className="flex h-[min(560px,85vh)] flex-col gap-0 p-0 sm:max-w-3xl"
      >
        <div className="flex h-14 shrink-0 items-center border-b px-6">
          <DialogTitle className="font-mono text-tab font-bold">settings</DialogTitle>
        </div>
        <Tabs
          defaultValue="account"
          orientation="vertical"
          className="min-h-0 flex-1 flex-row gap-0"
        >
          <TabsList className="w-44 shrink-0 flex-col items-stretch gap-1 border-r p-3">
            {SECTIONS.map((section) => (
              <TabsTrigger
                key={section}
                value={section}
                className="justify-start border-transparent data-[state=inactive]:hover:bg-muted"
              >
                {section}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="min-w-0 flex-1 overflow-y-auto p-6">
            <TabsContent value="account">
              <AccountSection user={user} onSignOut={onSignOut} />
            </TabsContent>
            <TabsContent value="appearance">
              <Section title="theme">
                <ThemeSwitcher />
              </Section>
            </TabsContent>
            <TabsContent value="developer">
              <DeveloperSection />
            </TabsContent>
            <TabsContent value="components">
              <Gallery />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export { SettingsDialog }
