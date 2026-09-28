import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/kit/lib/utils';

/**
 * Kit button. Colours follow the nearest [data-tone] (the block card).
 *   tone  – solid block colour (primary action: "Start quiz", "Show answer")
 *   ink   – near-black (Next / Finish)
 *   soft  – tinted block colour (secondary: "Retake", "Review again")
 *   ghost – text only ("← Back")
 *   plain – light grey chip (toolbar buttons)
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap outline-none transition-[background,opacity,transform] select-none focus-visible:ring-3 focus-visible:ring-ring/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-35',
  {
    variants: {
      variant: {
        tone: 'bg-tone text-white hover:bg-tone-strong',
        ink: 'bg-ink text-white hover:bg-black',
        soft: 'bg-tone-tint text-ink hover:bg-tone-line/60',
        ghost: 'bg-transparent text-ink-3 hover:text-ink',
        plain: 'bg-subtle text-ink hover:bg-line',
      },
      size: {
        sm: 'rounded-full px-3 py-2 text-sm',
        md: 'rounded-full px-[18px] py-[11px] text-[15px]',
        lg: 'rounded-full px-6 py-[13px] text-base',
        block: 'w-full rounded-full p-[14px] text-base',
      },
    },
    defaultVariants: { variant: 'tone', size: 'md' },
  },
);

export type ButtonProps = ButtonPrimitive.Props & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <ButtonPrimitive className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
