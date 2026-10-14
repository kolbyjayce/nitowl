import { Logo } from '@renderer/components/logo'
import { cn } from '@renderer/lib/utils'

const platform = window.electron.process.platform

/**
 * The window has no native title bar, so this strip is the drag region.
 * It leaves room for the macOS traffic lights (left) or the Windows/Linux
 * window controls overlay (right).
 */
function TitleBar({ className, children }: React.ComponentProps<'header'>): React.JSX.Element {
  return (
    <header
      className={cn(
        'drag flex h-12 shrink-0 items-center gap-2.5 select-none',
        platform === 'darwin' ? 'pl-28' : 'pl-5 pr-36',
        className
      )}
    >
      {children ?? (
        <>
          <Logo className="size-5" />
          <span className="font-mono text-tab font-bold">NitOwl</span>
        </>
      )}
    </header>
  )
}

export { TitleBar }
