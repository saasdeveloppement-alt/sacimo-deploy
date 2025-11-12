import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      console.log("🔐 Authorize called with:", credentials?.email)

      if (!credentials?.email || !credentials?.password) {
        console.log("❌ Missing credentials")
        return null
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      })

      console.log("👤 User found:", user ? "YES" : "NO")

      if (!user?.password) {
        console.log("❌ No user or no password")
        return null
      }

      const isValid = await bcrypt.compare(credentials.password, user.password)
      console.log("🔑 Password valid:", isValid)

      if (!isValid) {
        console.log("❌ Invalid password")
        return null
      }

      console.log("✅ Auth successful")
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      }
    },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  callbacks: {
    async signIn() {
      return true
    },
    async redirect({ url, baseUrl }) {
      if (url.includes('/auth/')) {
        return `${baseUrl}/app/dashboard`
      }
      return `${baseUrl}/app/dashboard`
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  session: {
    strategy: "jwt",
  },
}
