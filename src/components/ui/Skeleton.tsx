'use client'

import { cn } from '@/lib/utils/cn'
import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'circular' | 'rounded'
}

export function Skeleton({ className, variant = 'default' }: SkeletonProps) {
  const variants = {
    default: 'rounded-md',
    circular: 'rounded-full',
    rounded: 'rounded-xl',
  }

  return (
    <motion.div
      className={cn(
        'bg-slate-200 dark:bg-slate-700',
        variants[variant],
        className
      )}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  )
}

export function SkeletonTaskCard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700"
    >
      <div className="flex items-start gap-3">
        <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-1" />
        <div className="flex-1">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-3" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function SkeletonTaskList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <SkeletonTaskCard />
        </motion.div>
      ))}
    </div>
  )
}

export function SkeletonDashboard() {
  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Hero skeleton */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 p-8">
        <Skeleton className="h-4 w-40 bg-slate-300 dark:bg-slate-600" />
        <Skeleton className="h-10 w-64 mt-2 bg-slate-300 dark:bg-slate-600" />
        <Skeleton className="h-5 w-80 mt-2 bg-slate-300 dark:bg-slate-600" />
        
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/20 dark:bg-slate-900/20 rounded-xl p-4">
              <Skeleton className="h-4 w-16 bg-slate-300/50 dark:bg-slate-600/50" />
              <Skeleton className="h-7 w-12 mt-2 bg-slate-300/50 dark:bg-slate-600/50" />
            </div>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tasks section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-9 w-28 rounded-lg" />
            </div>
            <SkeletonTaskList count={3} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress widget */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-3 w-full rounded-full mb-4" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
          </div>

          {/* Activity feed */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <Skeleton className="h-6 w-36 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function SkeletonProfile() {
  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-32 rounded-lg mt-6" />
      </div>
    </motion.div>
  )
}

// Tasks page skeleton
export function SkeletonTasksPage() {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      {/* Search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>

      {/* Tasks grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <SkeletonTaskCard />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
