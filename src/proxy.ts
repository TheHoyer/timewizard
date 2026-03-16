import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

// Rate limiting configuration (in-memory for development)
// In production, use Upstash Redis
const rateLimitMap = new Map<string, { count: number; lastReset: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_AUTH = 5 // 5 requests per minute for auth endpoints
const MAX_REQUESTS_API = 60 // 60 requests per minute for API endpoints

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

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/tasks', '/schedule', '/analytics', '/settings']

// Auth routes (login, register)
const authRoutes = ['/login', '/register']

// API routes that need rate limiting
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

  // Rate limiting for auth endpoints
  if (pathname.startsWith('/api/auth/callback') || pathname === '/api/auth/signin') {
    const key = `auth:${ip}`
    if (isRateLimited(key, MAX_REQUESTS_AUTH)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }

  // Rate limiting for API endpoints
  if (rateLimitedApiRoutes.some((route) => pathname.startsWith(route))) {
    const key = `api:${ip}`
    if (isRateLimited(key, MAX_REQUESTS_API)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }

  // Get session
  const session = await auth()

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !session?.user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && session?.user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Add security headers
  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  )

  // CSP header (basic)
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
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|site.webmanifest|manifest.webmanifest|apple-touch-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
}
