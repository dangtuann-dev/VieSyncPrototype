import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: `bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-[0_8px_24px_rgba(59,130,246,0.35)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.45)] border-none`,
      secondary: `border-2 border-blue-200 hover:border-blue-400 text-blue-600 hover:text-blue-700 bg-white hover:bg-blue-50 shadow-sm`,
      ghost: `text-slate-600 hover:text-blue-600 hover:bg-blue-50 border-transparent shadow-none`,
      danger: `bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300`
    }
    
    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base'
    }

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none disabled:transform-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
