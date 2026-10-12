import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@renderer/lib/utils'

const labelVariants = cva('font-mono text-label font-medium', {
  variants: {
    state: {
      locked: 'text-locked-foreground',
      active: 'text-foreground',
      current: 'text-active',
      approved: 'text-success',
      flagged: 'text-flagged'
    }
  },
  defaultVariants: { state: 'locked' }
})

const dotVariants = cva('relative grid size-[15px] place-items-center rounded-full', {
  variants: {
    state: {
      locked: 'bg-locked-foreground',
      active: 'bg-foreground',
      current: 'bg-active',
      approved: 'bg-success',
      flagged: 'bg-flagged'
    }
  },
  defaultVariants: { state: 'locked' }
})

const haloVariants = cva('absolute size-[34px] rounded-full border-[1.5px]', {
  variants: {
    state: {
      active: 'border-active',
      current: 'border-dashed border-active',
      flagged: 'border-flagged'
    }
  }
})

export type GraphNodeState = NonNullable<VariantProps<typeof labelVariants>['state']>

/** A function in the call graph. Locked → Active → Current → Approved / Flagged. */
export function GraphNode({
  state = 'locked',
  label,
  className
}: {
  state?: GraphNodeState
  label: string
  className?: string
}): React.JSX.Element {
  const halo = state === 'active' || state === 'current' || state === 'flagged'
  return (
    <div
      className={cn('flex w-[140px] flex-col items-center gap-3.5', className)}
      data-state={state}
    >
      <div className="grid size-[34px] place-items-center">
        {halo && <span className={haloVariants({ state })} />}
        <span className={dotVariants({ state })}>
          {state === 'approved' && (
            <span className="font-mono text-[9px] leading-none font-bold text-success-foreground">
              ✓
            </span>
          )}
        </span>
      </div>
      <span className={labelVariants({ state })}>{label}</span>
    </div>
  )
}
