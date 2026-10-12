import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@renderer/lib/utils'

const ringTabVariants = cva(
  'inline-flex items-center gap-2 rounded-md px-3.5 py-[9px] font-mono transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
  {
    variants: {
      state: {
        locked: 'border border-border text-subtle-foreground',
        active: 'bg-active text-active-foreground',
        done: 'bg-success-tint text-success'
      }
    },
    defaultVariants: { state: 'locked' }
  }
)

/** One ring of the review. Locked until the previous ring is approved. */
export function RingTab({
  state = 'locked',
  ring,
  count,
  className,
  ...props
}: Omit<React.ComponentProps<'button'>, 'children'> &
  VariantProps<typeof ringTabVariants> & { ring: string; count: string }): React.JSX.Element {
  return (
    <button
      type="button"
      disabled={state === 'locked'}
      className={cn(ringTabVariants({ state }), className)}
      {...props}
    >
      <span className="text-tab font-bold">{ring}</span>
      <span className={cn('text-label font-medium', state === 'active' && 'opacity-80')}>
        {count}
      </span>
    </button>
  )
}
