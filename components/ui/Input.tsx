import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="text-sm font-semibold text-slate-700 mb-1.5 block">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "w-full bg-white border border-[#E2EAF4] rounded-xl px-4 py-3 text-slate-800 placeholder:text-slate-400 text-sm font-medium outline-none transition-all duration-200",
            error ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100" : "focus:border-blue-400 focus:ring-4 focus:ring-blue-100",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500 mt-1">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
