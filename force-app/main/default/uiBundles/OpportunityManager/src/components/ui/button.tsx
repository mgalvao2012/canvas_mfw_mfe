import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';

import { cn } from '../../lib/utils';

// SLDS 2 button blueprints: brand (default), neutral (outline), icon-border (outline + icon size).
const buttonVariants = cva(
  "focus-visible:ring-ring/40 aria-invalid:border-destructive rounded-full border bg-clip-padding text-[0.8125rem] font-normal leading-none focus-visible:ring-3 aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg:not([class*='size-'])]:size-3.5 inline-flex items-center justify-center whitespace-nowrap transition-colors disabled:pointer-events-none disabled:border-border disabled:bg-surface-alt disabled:text-muted-foreground [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none",
  {
    variants: {
      variant: {
        default:
          'border-primary bg-primary text-primary-foreground hover:border-brand-hover hover:bg-brand-hover active:bg-brand-hover',
        outline:
          'border-border-strong bg-background text-link hover:bg-surface-alt hover:text-brand-hover aria-expanded:bg-surface-alt',
        secondary:
          'border-border-strong bg-surface-alt text-link hover:bg-border hover:text-brand-hover aria-expanded:bg-border',
        ghost:
          'border-transparent text-muted-foreground hover:bg-surface-alt hover:text-link aria-expanded:bg-surface-alt',
        destructive:
          'border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30',
        link: 'border-transparent text-link underline-offset-4 hover:text-brand-hover hover:underline',
      },
      size: {
        default:
          'h-8 gap-1.5 px-4 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        xs: "h-6 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-3 text-xs has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3",
        lg: 'h-10 gap-1.5 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4',
        icon: 'size-8 text-muted-foreground hover:text-link',
        'icon-xs': "size-6 [&_svg:not([class*='size-'])]:size-3",
        'icon-sm': "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...(props as any)}
    />
  );
}

export { Button, buttonVariants };
