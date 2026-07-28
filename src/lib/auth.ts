import NextAuth, { type DefaultSession } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/db'
import { users, accounts, sessions, verificationTokens } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: 'jwt', // Use JWT for all sessions (required for Credentials provider)
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'admin@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user by email
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        })

        // Check if user exists and has a password (credentials account)
        if (!user || !user.password) {
          return null
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValidPassword) {
          return null
        }

        // Return user object (without password)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Add user data to JWT token on sign-in
      if (user) {
        token.id = user.id
        // Fetch role from database for OAuth users, use existing role for Credentials
        if (user.role) {
          token.role = user.role
        } else if (user.id) {
          const userId = user.id
          const dbUser = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.id, userId),
          })
          token.role = dbUser?.role || 'viewer'
        }
      }
      return token
    },
    async session({ session, token }) {
      // Add user role and id to session from JWT token
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as 'admin' | 'editor' | 'viewer'
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
})

// Extend the session and JWT types to include role
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: 'admin' | 'editor' | 'viewer'
    } & DefaultSession['user']
  }

  interface User {
    role?: 'admin' | 'editor' | 'viewer'
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id?: string
    role?: 'admin' | 'editor' | 'viewer'
  }
}
