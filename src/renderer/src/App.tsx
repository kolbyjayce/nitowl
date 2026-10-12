import { useEffect, useState } from 'react'
import { SettingsView } from '@renderer/components/settings-view'
import { TitleBar } from '@renderer/components/title-bar'

function App(): React.JSX.Element {
  const [view, setView] = useState<'app' | 'settings'>('app')

  // The native menu (NitOwl → Settings…, File → Settings…) drives navigation.
  useEffect(() => window.api.onNavigate((to) => setView(to)), [])

  if (view === 'settings') return <SettingsView onBack={() => setView('app')} />

  return (
    <div className="flex min-h-screen flex-col">
      <TitleBar />
      <main className="flex-1" />
    </div>
  )
}

export default App
