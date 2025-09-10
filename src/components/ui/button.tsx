import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 tracking-tight",
  {
    variants: {
      variant: {
        primary: "bg-accent text-white hover:bg-accent-600 active:bg-accent-700 shadow-card hover:shadow-dropdown transform hover:scale-[1.02] active:scale-[0.98]",
        secondary: "bg-dark-elevated text-light-text hover:bg-dark-overlay border border-border-default hover:border-strong shadow-subtle",
        outline: "border border-border-default bg-transparent text-light-text hover:bg-dark-surface hover:border-accent hover:text-accent shadow-subtle",
        ghost: "text-light-text hover:bg-dark-surface hover:text-accent transition-colors",
        destructive: "bg-danger text-white hover:bg-danger/90 active:bg-danger/80 shadow-card",
        link: "text-accent underline-offset-4 hover:underline p-0 h-auto font-normal",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-sm min-w-[44px]",
        default: "h-10 px-4 text-base rounded-md min-w-[44px]",
        lg: "h-12 px-6 text-lg rounded-lg min-w-[44px]",
        xl: "h-14 px-8 text-xl rounded-xl min-w-[44px]",
        icon: "h-10 w-10 rounded-md",
        "icon-sm": "h-8 w-8 rounded-sm",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }