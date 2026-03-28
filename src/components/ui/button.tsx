import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "locale-chip inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold tracking-wide outline-none ring-offset-app-bg disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        accent:
          "bg-app-primary text-app-qr-text shadow-[var(--app-shadow-button-primary)] hover:bg-app-primary-hover",
        outline:
          "border border-app-border bg-app-secondary-soft text-app-text-soft hover:border-app-secondary hover:bg-app-surface-3 hover:text-app-text",
        ghost: "bg-transparent text-app-text-soft hover:bg-app-surface-3 hover:text-app-text",
        surface:
          "border border-app-border bg-app-surface-2 text-app-text shadow-[var(--app-shadow-surface)] hover:border-app-border-strong hover:bg-app-surface-3",
        destructive:
          "border border-app-danger bg-app-danger-soft text-app-danger hover:bg-app-surface-3",
      },
      size: {
        default: "min-h-11 px-5 py-2.5",
        sm: "min-h-9 px-3 py-2 text-xs",
        lg: "min-h-12 px-6 py-3 text-sm",
        icon: "size-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "accent",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
