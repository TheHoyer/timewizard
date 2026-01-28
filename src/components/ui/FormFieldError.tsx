'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface FormFieldErrorProps {
  errors?: string[]
  className?: string
}

/**
 * Komponent wyświetlający listę błędów walidacji dla pola formularza
 * z ładną animacją i ikonami
 */
export function FormFieldError({ errors, className }: FormFieldErrorProps) {
  if (!errors || errors.length === 0) return null

  return (
    <div className={cn('mt-1.5 space-y-1', className)}>
      {errors.map((error, index) => (
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
          <span>{error}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * Komponent wyświetlający ogólny błąd formularza (np. błąd serwera)
 */
export interface FormErrorProps {
  message?: string
  className?: string
}

export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null

  return (
    <div
      className={cn(
        'p-4 rounded-lg bg-red-50 border border-red-200 animate-in fade-in slide-in-from-top-2 duration-300',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-3 h-3 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-red-800">Wystąpił błąd</p>
          <p className="text-sm text-red-600 mt-0.5">{message}</p>
        </div>
      </div>
    </div>
  )
}

/**
 * Komponent wyświetlający komunikat sukcesu
 */
export interface FormSuccessProps {
  message?: string
  className?: string
}

export function FormSuccess({ message, className }: FormSuccessProps) {
  if (!message) return null

  return (
    <div
      className={cn(
        'p-4 rounded-lg bg-green-50 border border-green-200 animate-in fade-in slide-in-from-top-2 duration-300',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-3 h-3 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-green-800">Sukces!</p>
          <p className="text-sm text-green-600 mt-0.5">{message}</p>
        </div>
      </div>
    </div>
  )
}
