import solid from '@renderer/assets/owl-solid.png'
import outline from '@renderer/assets/owl-outline.png'
import { cn } from '@renderer/lib/utils'

/**
 * The NitOwl mark. The PNGs are used as alpha masks, so the owl takes its color
 * from `currentColor` (text-foreground by default) and themes for free.
 */
function Logo({
  variant = 'solid',
  className,
  ...props
}: React.ComponentProps<'span'> & { variant?: 'solid' | 'outline' }): React.JSX.Element {
  const mask = `url(${variant === 'solid' ? solid : outline})`
  return (
    <span
      role="img"
      aria-label="NitOwl"
      className={cn('inline-block size-6 shrink-0 bg-current', className)}
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center'
      }}
      {...props}
    />
  )
}

export { Logo }
