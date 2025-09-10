import * as React from "react"
import { cn } from "../../lib/utils"

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "primary" | "secondary" | "muted"
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", variant = "primary", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
      xl: "w-12 h-12"
    }

    const variantClasses = {
      primary: "text-primary",
      secondary: "text-secondary-foreground", 
      muted: "text-muted-foreground"
    }

    return (
      <div
        className={cn(
          "inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]",
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        ref={ref}
        role="status"
        aria-label="Loading..."
        {...props}
      >
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

export { LoadingSpinner }