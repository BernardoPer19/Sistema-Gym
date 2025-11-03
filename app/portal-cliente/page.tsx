"use client"

import { useState } from "react"
import { ClientLogin } from "@/components/portal-cliente/client-login"
import { ClientDashboard } from "@/components/portal-cliente/client-dashboard"
import { getMemberById, getMemberByQRCode, payments, attendances } from "@/lib/mock-data"
import type { Member } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function PortalClientePage() {
  const [loggedInMember, setLoggedInMember] = useState<Member | null>(null)
  const { toast } = useToast()

  const handleLogin = (code: string) => {
    let member = getMemberById(code)

    if (!member) {
      member = getMemberByQRCode(code)
    }

    if (!member) {
      toast({
        title: "Código inválido",
        description: "No se encontró ningún socio con ese código. Verifica tu código QR o ID de socio.",
        variant: "destructive",
      })
      return
    }

    setLoggedInMember(member)
    toast({
      title: "Bienvenido",
      description: `Hola ${member.name}, accediste exitosamente a tu portal.`,
    })
  }

  const handleLogout = () => {
    setLoggedInMember(null)
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    })
  }

  if (!loggedInMember) {
    return (
      <>
        <ClientLogin onLogin={handleLogin} />
        <Toaster />
      </>
    )
  }

  const memberPayments = payments.filter((p) => p.memberId === loggedInMember.id)
  const memberAttendances = attendances
    .filter((a) => a.memberId === loggedInMember.id)
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <>
      <ClientDashboard
        member={loggedInMember}
        payments={memberPayments}
        attendances={memberAttendances}
        onLogout={handleLogout}
      />
      <Toaster />
    </>
  )
}
