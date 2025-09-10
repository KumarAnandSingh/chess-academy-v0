import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 tracking-wide font-secondary",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-accent text-white hover:bg-accent-600 shadow-subtle",
        secondary:
          "border-transparent bg-dark-elevated text-light-text hover:bg-dark-overlay shadow-subtle",
        outline: 
          "border border-border-default text-light-text hover:border-accent hover:text-accent hover:bg-accent/5",
        success:
          "border-transparent bg-success text-white hover:bg-success/90 shadow-subtle",
        warning:
          "border-transparent bg-warning text-white hover:bg-warning/90 shadow-subtle",
        danger:
          "border-transparent bg-danger text-white hover:bg-danger/90 shadow-subtle",
        subtle:
          "border-transparent bg-accent-subtle text-accent hover:bg-accent/20",
      },
      size: {
        sm: "px-2 py-1 text-xs",
        default: "px-3 py-1 text-sm", 
        lg: "px-4 py-2 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }