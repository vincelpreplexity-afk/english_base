'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-stone-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`h-9 w-full rounded-lg border px-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition-colors ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-400/20'
              : 'border-stone-200 focus:border-accent focus:ring-2 focus:ring-accent/15'
          } disabled:bg-stone-50 disabled:text-stone-400 ${className}`}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-stone-500">{hint}</p>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
