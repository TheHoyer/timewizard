// Plan limits
export const PLAN_LIMITS = {
  FREE: {
    maxTasks: 50,
    maxCategories: 3,
    historyDays: 7,
    features: {
      googleCalendar: false,
      aiScheduling: false,
      export: false,
      pushNotifications: false,
      smsNotifications: false,
    },
  },
  PRO: {
    maxTasks: Infinity,
    maxCategories: Infinity,
    historyDays: 90,
    features: {
      googleCalendar: true,
      aiScheduling: true,
      export: true,
      pushNotifications: true,
      smsNotifications: true,
    },
  },
  BUSINESS: {
    maxTasks: Infinity,
    maxCategories: Infinity,
    historyDays: Infinity,
    features: {
      googleCalendar: true,
      aiScheduling: true,
      export: true,
      pushNotifications: true,
      smsNotifications: true,
      teamWorkspaces: true,
      slackIntegration: true,
      api: true,
    },
  },
} as const

// Priority colors
export const PRIORITY_COLORS = {
  1: { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-600' },
  2: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-600' },
  3: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-600' },
  4: { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-600' },
  5: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-600' },
} as const

// Priority labels
export const PRIORITY_LABELS = {
  1: 'Bardzo niski',
  2: 'Niski',
  3: 'Średni',
  4: 'Wysoki',
  5: 'Krytyczny',
} as const

// Task status labels
export const STATUS_LABELS = {
  PENDING: 'Do zrobienia',
  IN_PROGRESS: 'W trakcie',
  COMPLETED: 'Ukończone',
  CANCELLED: 'Anulowane',
} as const

// Task status colors
export const STATUS_COLORS = {
  PENDING: { bg: 'bg-slate-100 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-300', dot: 'bg-slate-400' },
  IN_PROGRESS: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
  COMPLETED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
  CANCELLED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
} as const

// Day of week labels
export const DAY_LABELS = {
  0: 'Niedziela',
  1: 'Poniedziałek',
  2: 'Wtorek',
  3: 'Środa',
  4: 'Czwartek',
  5: 'Piątek',
  6: 'Sobota',
} as const

// Block type labels
export const BLOCK_TYPE_LABELS = {
  WORK: 'Praca',
  PERSONAL: 'Osobiste',
  FOCUS: 'Skupienie',
} as const
