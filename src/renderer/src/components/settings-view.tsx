import { useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { TitleBar } from '@renderer/components/title-bar'
import { ThemeSwitcher } from '@renderer/components/theme-switcher'
import { Button } from '@renderer/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@renderer/components/ui/tabs'
import { Gallery } from '@renderer/gallery'

function SettingsView({ onBack }: { onBack: () => void }): React.JSX.Element {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      // Radix overlays (e.g. the Components dropdown) preventDefault when Escape dismisses them
      if (e.key === 'Escape' && !e.defaultPrevented) onBack()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onBack])

  return (
    <div className="flex min-h-screen flex-col">
      <TitleBar>
        <Button variant="ghost" size="sm" className="no-drag" onClick={onBack}>
          <ArrowLeft /> back
        </Button>
        <span className="font-mono text-tab font-bold">settings</span>
      </TitleBar>
      <main className="mx-auto w-full max-w-3xl px-8 pt-4 pb-10">
        <Tabs defaultValue="appearance">
          <TabsList>
            <TabsTrigger value="appearance">appearance</TabsTrigger>
            <TabsTrigger value="components">components</TabsTrigger>
          </TabsList>
          <TabsContent value="appearance">
            <ThemeSwitcher />
          </TabsContent>
          <TabsContent value="components">
            <Gallery />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export { SettingsView }
