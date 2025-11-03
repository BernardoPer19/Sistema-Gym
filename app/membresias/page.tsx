"use client"

import { Header } from "@/components/layout/header"
import { MembershipCard } from "@/components/membresias/membership-card"
import { ExpiryAlerts } from "@/components/membresias/expiry-alerts"
import { PaymentHistory } from "@/components/membresias/payment-history"
import { memberships, members, payments, getExpiringMembers, getMemberById } from "@/lib/mock-data"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import type { Payment } from "@/lib/types"
import { generatePDFReceipt, downloadReceipt } from "@/lib/pdf-generator"
export default function MembresiasPage() {
  const { toast } = useToast()
  const expiringMembers = getExpiringMembers(7)

  // Get recent payments (last 30 days)
  // const recentPayments = payments
  //   .filter((p) => {
  //     const thirtyDaysAgo = new Date()
  //     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  //     return p.date >= thirtyDaysAgo
  //   })
  //   .sort((a, b) => b.date.getTime() - a.date.getTime())

  const handleSendReminder = (memberId: string) => {
    const member = members.find((m) => m.id === memberId)
    toast({
      title: "Recordatorio enviado",
      description: `Se ha enviado un recordatorio de renovación a ${member?.name}`,
    })
  }

  const handleDownloadInvoice = (payment: Payment) => {
    const member = getMemberById(payment.memberId)

    if (!member) {
      toast({
        title: "Error",
        description: "No se pudo encontrar la información del socio",
        variant: "destructive",
      })
      return
    }

    // Generate PDF receipt content
    // const receiptContent = generatePDFReceipt(payment, member, gymConfig)

    // Download the receipt
    // downloadReceipt(receiptContent, `${payment.invoiceNumber}_${member.name.replace(/\s+/g, "_")}.txt`)

    toast({
      title: "Recibo descargado",
      description: `Factura ${payment.invoiceNumber} - ${payment.memberName}`,
    })
  }

  return (
    <div className="flex flex-col">
      <Header title="Membresías" description="Planes y pagos del gimnasio" />

      <div className="flex-1 space-y-6 p-6">
        {/* Membership Plans */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Planes Disponibles</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {memberships.map((membership) => {
              const memberCount = members.filter(
                (m) => m.membershipId === membership.id && m.status === "active",
              ).length
              return <MembershipCard key={membership.id} membership={membership} memberCount={memberCount} />
            })}
          </div>
        </div>

        {/* Expiry Alerts */}
        <ExpiryAlerts expiringMembers={expiringMembers} onSendReminder={handleSendReminder} />

        {/* Payment History */}
        <PaymentHistory payments={payments} onDownloadInvoice={handleDownloadInvoice} />
      </div>

      <Toaster />
    </div>
  )
}
