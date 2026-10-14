import { useState } from 'react'
import { ClipboardCopy, Check, Loader2 } from 'lucide-react'
import { Logo } from '@renderer/components/logo'
import { Button } from '@renderer/components/ui/button'
import { Card, CardContent } from '@renderer/components/ui/card'

function GitHubIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

type Stage = 'idle' | 'pending' | 'error'

function LoginView({ onAuthenticated }: { onAuthenticated: () => void }): React.JSX.Element {
  const [stage, setStage] = useState<Stage>('idle')
  const [userCode, setUserCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startLogin = async (): Promise<void> => {
    try {
      setStage('pending')
      setError(null)

      const { userCode, verificationUri } = await window.api.auth.login()
      setUserCode(userCode)

      // Give the user time to see and copy the code before the browser opens
      await new Promise((r) => setTimeout(r, 1500))
      window.api.auth.openBrowser(verificationUri)

      // Wait for the user to complete auth on github.com/login/device
      const result = await window.api.auth.wait()

      if (result.authenticated) {
        onAuthenticated()
      } else {
        setStage('error')
        setError('Authorization timed out. Please try again.')
      }
    } catch {
      setStage('error')
      setError('Something went wrong. Please try again.')
    }
  }

  const copyCode = async (): Promise<void> => {
    if (!userCode) return
    await navigator.clipboard.writeText(userCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <Logo variant="solid" className="size-12" />
          <h1 className="text-xl font-semibold">sign in to nitowl</h1>
          <p className="text-center text-tab text-muted-foreground">
            connect your github account to get started
          </p>
        </div>

        {stage === 'idle' && (
          <Button className="w-full" onClick={startLogin}>
            <GitHubIcon className="size-4" />
            continue with github
          </Button>
        )}

        {stage === 'pending' && userCode && (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center gap-4">
              <p className="text-center text-tab text-muted-foreground">
                enter this code on github
              </p>
              <button
                onClick={copyCode}
                className="flex items-center gap-3 rounded-lg border bg-muted px-5 py-3 font-mono text-xl font-bold tracking-widest transition-colors hover:bg-accent"
              >
                {userCode}
                {copied ? (
                  <Check className="size-4 text-success" />
                ) : (
                  <ClipboardCopy className="size-4 text-muted-foreground" />
                )}
              </button>
              <div className="flex items-center gap-2 text-tab text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                waiting for authorization...
              </div>
            </CardContent>
          </Card>
        )}

        {stage === 'pending' && !userCode && (
          <div className="flex items-center gap-2 text-tab text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            connecting to github...
          </div>
        )}

        {stage === 'error' && (
          <div className="flex w-full flex-col items-center gap-4">
            <p className="text-tab text-destructive">{error}</p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setStage('idle')
                setUserCode(null)
                setError(null)
              }}
            >
              try again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export { LoginView }
