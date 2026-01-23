import { basePath } from '@cm/lib/methods/common'

import { anyObject } from '@cm/types/utility-types'
import { fetchAlt } from '@cm/lib/http/fetch-client'
import { googleProvider } from '@app/api/auth/GoogleProvider'
import { normalCredentialsProvider } from '@app/api/auth/normalCredentialsProvider'
const maxAge = process.env.NEXT_PUBLIC_ROOTPATH === 'Grouping' ? 60 * 60 : 30 * 24 * 60 * 60

const authorize = async (credentials: { email: string; password: string }, req) => {
  const { email, password } = credentials

  const pseudoCredentials = { ...credentials } as anyObject
  const rootPath = pseudoCredentials.rootPath
  let user = undefined
  const apiPath = `${basePath}/api/prisma/login`
  user = await fetchAlt(apiPath, { email, password, rootPath })

  if (user) {
    return user
  }
  return null
}

export const authOptions: any = {
  // Configure one or more authentication providers
  providers: [
    googleProvider,
    normalCredentialsProvider,
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      // 最初のサインイン
      if (account && user) {
        return {
          ...token,
          user: user,
        }
      }

      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      session.accessTokenExpires = token.accessTokenExpires
      session.user = {
        ...token.user,
      }

      return session
    },
    async redirect({ url, baseUrl }) {
      // callbackUrlが指定されている場合はそのURLを使用
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // 同じオリジンの場合はそのまま返す
      if (new URL(url).origin === baseUrl) return url
      // デフォルトでbaseUrlを返す
      return baseUrl
    },
  },

  session: {
    strategy: 'jwt',
    maxAge,
  },

  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    // signIn: '/login',
    // signOut: '/login',
    error: `/login?`,
  },
}
