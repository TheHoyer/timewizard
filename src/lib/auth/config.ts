import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          plan: user.plan as 'FREE' | 'PRO' | 'BUSINESS',
          timezone: user.timezone,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  events: {
    async createUser({ user }) {
      // Create default categories for new users (OAuth sign up)
      if (user.id) {
        try {
          const existingCategories = await prisma.category.count({
            where: { userId: user.id },
          })

          if (existingCategories === 0) {
            await prisma.category.createMany({
              data: [
                { userId: user.id, name: 'Praca', color: '#4F46E5', icon: '💼' },
                { userId: user.id, name: 'Osobiste', color: '#14B8A6', icon: '🏠' },
                { userId: user.id, name: 'Nauka', color: '#F59E0B', icon: '📚' },
              ],
            })
          }
        } catch (error) {
          console.error('Error creating default categories:', error)
        }
      }
    },
    async signIn({ user, isNewUser }) {
      // Update last active timestamp
      if (user.id) {
        try {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: new Date() },
          })
        } catch (error) {
          console.error('Error updating last active:', error)
        }
      }

      // Create default categories for new email/password users
      if (isNewUser && user.id) {
        try {
          const existingCategories = await prisma.category.count({
            where: { userId: user.id },
          })

          if (existingCategories === 0) {
            await prisma.category.createMany({
              data: [
                { userId: user.id, name: 'Praca', color: '#4F46E5', icon: '💼' },
                { userId: user.id, name: 'Osobiste', color: '#14B8A6', icon: '🏠' },
                { userId: user.id, name: 'Nauka', color: '#F59E0B', icon: '📚' },
              ],
            })
          }
        } catch (error) {
          console.error('Error creating default categories:', error)
        }
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string
        token.name = user.name || null
        token.email = user.email || null
        token.plan = (user.plan as 'FREE' | 'PRO' | 'BUSINESS') || 'FREE'
        token.timezone = user.timezone || 'Europe/Warsaw'
      }

      // Handle session update (e.g., after plan upgrade)
      if (trigger === 'update' && session) {
        token.plan = session.plan || token.plan
        token.timezone = session.timezone || token.timezone
        if (session.name) token.name = session.name
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.name = (token.name as string) || null
        // @ts-expect-error - email type should allow null
        session.user.email = token.email ?? null
        session.user.plan = token.plan
        session.user.timezone = token.timezone
      }
      return session
    },
    async signIn({ user, account }) {
      // Allow OAuth without email verification
      if (account?.provider === 'google' || account?.provider === 'github') {
        return true
      }

      // For credentials, check if user exists and email is set
      if (account?.provider === 'credentials') {
        return !!user
      }

      return true
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
}
