import * as React from "react"
import { cn } from "../../lib/utils"

interface FocusVisibleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const FocusVisible = React.forwardRef<HTMLDivElement, FocusVisibleProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
FocusVisible.displayName = "FocusVisible"

export { FocusVisible }