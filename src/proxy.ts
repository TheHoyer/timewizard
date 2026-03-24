import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'



const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 
const MAX_REQUESTS_AUTH = 5 
const MAX_REQUESTS_API = 60 

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip')
  return ip || 'unknown'
}

function isRateLimited(key: string, maxRequests: number): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now - record.lastReset > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, lastReset: now })
    return false
  }

  if (record.count >= maxRequests) {
    return true
  }

  record.count++
  return false
}


const protectedRoutes = ['/dashboard', '/tasks', '/schedule', '/analytics', '/settings']


const authRoutes = ['/login', '/register']


const rateLimitedApiRoutes = ['/api/auth', '/api/tasks', '/api/categories', '/api/schedule']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIP(request)

  const isPublicAsset =
    pathname === '/favicon.ico' ||
    pathname === '/site.webmanifest' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/apple-touch-icon.png' ||
    pathname.startsWith('/sounds/') ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$/.test(pathname)

  if (isPublicAsset) {
    return NextResponse.next()
  }

  
  if (pathname.startsWith('/api/auth/callback') || pathname === '/api/auth/signin') {
    const key = `auth:${ip}`
    if (isRateLimited(key, MAX_REQUESTS_AUTH)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }

  
  if (rateLimitedApiRoutes.some((route) => pathname.startsWith(route))) {
    const key = `api:${ip}`
    if (isRateLimited(key, MAX_REQUESTS_API)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }

  
  const session = await auth()

  
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  
  if (isProtectedRoute && !session?.user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  
  if (isAuthRoute && session?.user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  
  const response = NextResponse.next()

  
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;"
    )
  }

  return response
}

export const config = {
  matcher: [
        '/((?!_next/static|_next/image|favicon.ico|site.webmanifest|manifest.webmanifest|apple-touch-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
}
