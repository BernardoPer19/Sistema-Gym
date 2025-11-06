"use client"

import React, { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Sidebar } from "./sidebar"

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useSession().data?.user
  const isAuthenticated = !!user
  const isLoading = useSession().status === "loading"
  const isLoginPage = pathname === "/login"

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isLoginPage) {
      router.replace("/login")
    }
  }, [isLoading, isAuthenticated, isLoginPage, router])

  // 🕓 Mientras carga el estado de autenticación
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>
  }

  // 👤 Página de login o no autenticado
  if (isLoginPage || !isAuthenticated) {
    return <>{children}</>
  }

  // ✅ Usuario autenticado, render principal con sidebar
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
