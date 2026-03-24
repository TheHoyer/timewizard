'use client'

import { useSession, signOut } from 'next-auth/react'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils/cn'
import Image from 'next/image'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between px-4 lg:px-6 py-4">
        
        <div className="flex-1 max-w-md ml-10 lg:ml-0">
          <input
            type="text"
            placeholder="Szukaj zadań..."
            className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800 focus:border-violet-500"
          />
        </div>

        
        <div className="flex items-center gap-4">
          
          <ThemeToggle />

          
          <button className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <BellIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          
          <Menu as="div" className="relative">
            <MenuButton className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || ''}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : (
                <UserCircleIcon className="w-8 h-8 text-slate-600 dark:text-slate-400" />
              )}
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {session?.user?.name || 'Użytkownik'}
              </span>
            </MenuButton>

            <MenuItems className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{session?.user?.email}</p>
              </div>

              <MenuItem>
                {({ focus }) => (
                  <Link
                    href="/settings/profile"
                    className={cn(
                      'block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300',
                      focus ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100' : ''
                    )}
                  >
                    Profil
                  </Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <Link
                    href="/settings/subscription"
                    className={cn(
                      'block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300',
                      focus ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100' : ''
                    )}
                  >
                    Subskrypcja
                  </Link>
                )}
              </MenuItem>
              <MenuItem>
                {({ focus }) => (
                  <Link
                    href="/settings"
                    data-tutorial="settings-link"
                    className={cn(
                      'block px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300',
                      focus ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100' : ''
                    )}
                  >
                    Ustawienia
                  </Link>
                )}
              </MenuItem>
              <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className={cn(
                        'block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400',
                        focus ? 'bg-red-50 dark:bg-red-900/20' : ''
                      )}
                    >
                      Wyloguj się
                    </button>
                  )}
                </MenuItem>
              </div>
            </MenuItems>
          </Menu>
        </div>
      </div>
    </header>
  )
}
