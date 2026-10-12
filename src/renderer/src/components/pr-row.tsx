import { cva, type VariantProps } from 'class-variance-authority'
import { Badge } from '@renderer/components/ui/badge'
import { cn } from '@renderer/lib/utils'

const rowVariants = cva(
  'flex w-full items-center gap-4 rounded-xl border bg-card py-[18px] pr-5 pl-[22px] text-left transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40',
  {
    variants: {
      state: {
        'your-turn': '',
        queued: '',
        'not-started': '',
        done: ''
      },
      interactive: { true: 'hover:bg-muted', false: '' }
    },
    defaultVariants: { state: 'your-turn', interactive: true }
  }
)

const pipVariants = cva('size-[9px] shrink-0 rounded-full', {
  variants: {
    state: {
      'your-turn': 'bg-active',
      queued: 'bg-muted-foreground',
      'not-started': 'bg-subtle-foreground',
      done: 'bg-success'
    }
  }
})

const titleTone = {
  'your-turn': 'text-foreground',
  queued: 'text-foreground',
  'not-started': 'text-muted-foreground',
  done: 'text-muted-foreground'
} as const

const badgeVariant = {
  'your-turn': 'active',
  queued: 'outline',
  'not-started': 'outline',
  done: 'success'
} as const

export type PrRowState = NonNullable<VariantProps<typeof rowVariants>['state']>

/** A pull request in the inbox. */
export function PrRow({
  state = 'your-turn',
  num,
  title,
  meta,
  badge,
  className,
  ...props
}: Omit<React.ComponentProps<'button'>, 'title'> & {
  state?: PrRowState
  num: string
  title: string
  meta: string
  badge: string
}): React.JSX.Element {
  return (
    <button type="button" className={cn(rowVariants({ state }), className)} {...props}>
      <span className={pipVariants({ state })} />
      <span className="flex min-w-0 flex-1 flex-col gap-[5px]">
        <span className={cn('flex items-center gap-2.5 truncate', titleTone[state])}>
          <span className="font-mono text-tab font-bold">{num}</span>
          <span className="text-body font-medium">{title}</span>
        </span>
        <span
          className={cn(
            'truncate font-mono text-meta font-medium',
            state === 'not-started' ? 'text-subtle-foreground' : 'text-muted-foreground'
          )}
        >
          {meta}
        </span>
      </span>
      <Badge variant={badgeVariant[state]}>{badge}</Badge>
    </button>
  )
}
