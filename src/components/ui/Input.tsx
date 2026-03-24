import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
    error?: string | string[]
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, id, ...props }, ref) => {
    const generatedId = React.useId()
    const inputId = id || generatedId

    
    const errors = error 
      ? Array.isArray(error) 
        ? error 
        : [error]
      : []
    const hasError = errors.length > 0

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            id={inputId}
            className={cn(
              'w-full px-4 py-2.5 rounded-lg border transition-all duration-200',
              'text-slate-900 dark:text-slate-100 font-medium text-base',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal',
              'bg-white dark:bg-slate-700',
              hasError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200 pr-10'
                : 'border-slate-300 dark:border-slate-600 focus:border-violet-500 dark:focus:border-violet-400 focus:ring-violet-200 dark:focus:ring-violet-800 hover:border-slate-400 dark:hover:border-slate-500',
              'disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed',
              className
            )}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${inputId}-error` : undefined}
            ref={ref}
            {...props}
          />
          {hasError && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}
        </div>
        {hasError && (
          <div id={`${inputId}-error`} className="mt-1.5 space-y-1">
            {errors.map((err, index) => (
              <div
                key={index}
                className="flex items-start gap-1.5 text-sm text-red-600 animate-in fade-in slide-in-from-top-1 duration-200"
              >
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span>{err}</span>
              </div>
            ))}
          </div>
        )}
        {helperText && !hasError && (
          <p className="mt-1 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
