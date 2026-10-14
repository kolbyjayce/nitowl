import { Monitor, Moon, Sun } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@renderer/components/ui/toggle-group'
import { useTheme, type Theme } from '@renderer/lib/theme'

const OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'light', icon: Sun },
  { value: 'dark', label: 'dark', icon: Moon },
  { value: 'system', label: 'system', icon: Monitor }
]

export function ThemeSwitcher(): React.JSX.Element {
  const { theme, setTheme } = useTheme()
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={theme}
      // Radix emits '' when the active item is clicked again; keep the selection.
      onValueChange={(value) => value && setTheme(value as Theme)}
      aria-label="Theme"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => (
        <ToggleGroupItem
          key={value}
          value={value}
          aria-label={`${label} theme`}
          className="gap-1.5 px-3 font-mono text-label"
        >
          <Icon />
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
