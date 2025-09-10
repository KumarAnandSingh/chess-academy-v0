import * as React from "react"
import { cn } from "../../lib/utils"

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, ...props }, ref) => {
    return (
      <form
        className={cn("space-y-6", className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Form.displayName = "Form"

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  error?: string
  required?: boolean
  description?: string
}

const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, error, required, description, children, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", className)} ref={ref} {...props}>
        {label && (
          <label className="block text-sm font-medium text-foreground mobile:text-base">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mobile:text-base">
            {description}
          </p>
        )}
        {children}
        {error && (
          <p className="text-sm text-destructive animate-fade-in mobile:text-base">
            {error}
          </p>
        )}
      </div>
    )
  }
)
FormField.displayName = "FormField"

export interface FormHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
}

const FormHeader = React.forwardRef<HTMLDivElement, FormHeaderProps>(
  ({ className, title, subtitle, ...props }, ref) => {
    return (
      <div className={cn("text-center space-y-2 mb-6", className)} ref={ref} {...props}>
        <h1 className="text-2xl font-bold text-foreground mobile:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground mobile:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    )
  }
)
FormHeader.displayName = "FormHeader"

export interface FormFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const FormFooter = React.forwardRef<HTMLDivElement, FormFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div 
        className={cn(
          "flex flex-col space-y-4 pt-4 border-t border-border mobile:space-y-6",
          className
        )} 
        ref={ref} 
        {...props}
      >
        {children}
      </div>
    )
  }
)
FormFooter.displayName = "FormFooter"

export { Form, FormField, FormHeader, FormFooter }