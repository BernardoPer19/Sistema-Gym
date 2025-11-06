import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import { prisma } from "@/lib/prisma"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { signInEmailPassword } from "@/actions/auth/auth-actions"
import { UserRole } from "@/lib/types/types"

// --------------------------------------
// 🔹 EXTENSIÓN DE TIPOS (NEXT-AUTH)
// --------------------------------------
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: UserRole
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name: string
    email: string
    avatar?: string | null
    role: UserRole
    isActive: boolean
    has2FA: boolean
    urlProfile?: string | null
    createdAt: string
    lastLogin?: string | null
  }
}

// --------------------------------------
// ⚙️ CONFIGURACIÓN DE NEXTAUTH
// --------------------------------------
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_SECRET_ID!,
    }),

    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),

    CredentialsProvider({
      name: "Email y contraseña",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tu@email.com" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password)
          throw new Error("Por favor completa ambos campos")

        const user = await signInEmailPassword(credentials.email, credentials.password)
        if (!user) throw new Error("Credenciales inválidas")

        return user
      },
    }),
  ],

  session: { strategy: "jwt" },

  // --------------------------------------
  // 🔁 CALLBACKS PERSONALIZADOS
  // --------------------------------------
  callbacks: {
    async jwt({ token, user }) {
      // ✅ Cuando el usuario inicia sesión, guardamos sus datos en el token
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.role = user.role
      }

      return token
    },

    async session({ session, token }) {
      // ✅ Pasamos los datos del token al cliente
      if (session.user) {
        session.user.id = token.id
        session.user.name = token.name
        session.user.email = token.email
        session.user.role = token.role
      }

      return session
    },
  },

  // --------------------------------------
  // 🔐 PÁGINAS PERSONALIZADAS
  // --------------------------------------
  pages: {
    signIn: "/login",
  },

  // --------------------------------------
  // ⚙️ OPCIONES DE DEBUG Y SEGURIDAD
  // --------------------------------------
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

// Exportamos el handler estándar para App Router
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
