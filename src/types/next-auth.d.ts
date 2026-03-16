import { DefaultUser } from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      plan: 'FREE' | 'PRO' | 'BUSINESS'
      timezone: string
    }
  }

  interface User extends DefaultUser {
    plan?: 'FREE' | 'PRO' | 'BUSINESS'
    timezone?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    plan: 'FREE' | 'PRO' | 'BUSINESS'
    timezone: string
  }
}
