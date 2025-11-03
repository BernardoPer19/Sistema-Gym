import type { Payment, Member, GymConfig } from "./types"

export function generatePDFReceipt(payment: Payment, member: Member, gymConfig: GymConfig): string {
  const receiptContent = `
═══════════════════════════════════════════════════════
                    ${gymConfig.name}
═══════════════════════════════════════════════════════

RECIBO DE PAGO / PAYMENT RECEIPT

Factura No: ${payment.invoiceNumber}
Fecha: ${payment.date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}

───────────────────────────────────────────────────────
INFORMACIÓN DEL CLIENTE / CLIENT INFORMATION
───────────────────────────────────────────────────────

Nombre:          ${member.name}
ID Socio:        ${member.id}
Email:           ${member.email}
Teléfono:        ${member.phone}

───────────────────────────────────────────────────────
DETALLES DEL PAGO / PAYMENT DETAILS
───────────────────────────────────────────────────────

Concepto:        ${payment.membershipName}
Período:         Mensual
Monto:           $${payment.amount.toFixed(2)} ${gymConfig.currency}
Estado:          ${payment.status === "paid" ? "PAGADO" : "PENDIENTE"}

───────────────────────────────────────────────────────
INFORMACIÓN DE MEMBRESÍA / MEMBERSHIP INFORMATION
───────────────────────────────────────────────────────

Fecha de Inicio: ${member.joinDate.toLocaleDateString("es-MX")}
Fecha de Venc.:  ${member.expiryDate.toLocaleDateString("es-MX")}
Estado:          ${member.status === "active" ? "ACTIVA" : "INACTIVA"}

───────────────────────────────────────────────────────

TOTAL:           $${payment.amount.toFixed(2)} ${gymConfig.currency}

───────────────────────────────────────────────────────

Contacto: ${gymConfig.email}
Horario: ${gymConfig.openingTime} - ${gymConfig.closingTime}

═══════════════════════════════════════════════════════
        Gracias por ser parte de ${gymConfig.name}
        Thank you for being part of ${gymConfig.name}
═══════════════════════════════════════════════════════

Este documento es un recibo válido de pago.
This document is a valid payment receipt.

Generado el: ${new Date().toLocaleString("es-MX")}
  `.trim()

  return receiptContent
}

export function downloadReceipt(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
