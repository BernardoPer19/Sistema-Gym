"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, Eye } from "lucide-react"
import type { Payment } from "@/lib/types"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PaymentHistoryProps {
  payments: Payment[]
  onDownloadInvoice: (payment: Payment) => void
}

export function PaymentHistory({ payments, onDownloadInvoice }: PaymentHistoryProps) {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handlePreview = (payment: Payment) => {
    setSelectedPayment(payment)
    setPreviewOpen(true)
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-white">Historial de Pagos</CardTitle>
          <p className="text-sm text-muted-foreground">Últimos 30 días</p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Factura</TableHead>
                <TableHead className="text-muted-foreground">Socio</TableHead>
                <TableHead className="text-muted-foreground">Membresía</TableHead>
                <TableHead className="text-muted-foreground">Fecha</TableHead>
                <TableHead className="text-muted-foreground">Monto</TableHead>
                <TableHead className="text-muted-foreground">Estado</TableHead>
                <TableHead className="text-right text-muted-foreground">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id} className="border-border">
                  <TableCell className="font-medium text-white">{payment.invoiceNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.memberName}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.membershipName}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.date.toLocaleDateString("es-MX")}</TableCell>
                  <TableCell className="text-muted-foreground">${payment.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        payment.status === "paid"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : payment.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                            : "bg-red-500/10 text-red-500 border-red-500/20"
                      }
                    >
                      {payment.status === "paid" ? "Pagado" : payment.status === "pending" ? "Pendiente" : "Vencido"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => handlePreview(payment)}
                        disabled={payment.status !== "paid"}
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        onClick={() => onDownloadInvoice(payment)}
                        disabled={payment.status !== "paid"}
                      >
                        <Download className="h-4 w-4" />
                        Descargar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl border-neutral-800 bg-neutral-950">
          <DialogHeader>
            <DialogTitle className="text-white">Vista Previa del Recibo</DialogTitle>
            <DialogDescription>Factura {selectedPayment?.invoiceNumber}</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-6">
              <div className="space-y-4 font-mono text-sm text-neutral-300">
                <div className="border-b border-neutral-800 pb-4 text-center">
                  <h3 className="text-lg font-bold text-white">GYM PRO</h3>
                  <p className="text-xs text-neutral-400">RECIBO DE PAGO</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Factura No:</span>
                    <span className="text-white">{selectedPayment.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Fecha:</span>
                    <span className="text-white">{selectedPayment.date.toLocaleDateString("es-MX")}</span>
                  </div>
                </div>

                <div className="border-t border-neutral-800 pt-4">
                  <h4 className="mb-2 text-sm font-semibold text-white">Cliente</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Nombre:</span>
                      <span className="text-white">{selectedPayment.memberName}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-800 pt-4">
                  <h4 className="mb-2 text-sm font-semibold text-white">Detalles del Pago</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Concepto:</span>
                      <span className="text-white">{selectedPayment.membershipName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Monto:</span>
                      <span className="text-white">${selectedPayment.amount.toFixed(2)} MXN</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Estado:</span>
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">PAGADO</Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-800 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">TOTAL:</span>
                    <span className="text-white">${selectedPayment.amount.toFixed(2)} MXN</span>
                  </div>
                </div>

                <div className="border-t border-neutral-800 pt-4 text-center text-xs text-neutral-500">
                  <p>Gracias por ser parte de GYM PRO</p>
                  <p className="mt-1">Este documento es un recibo válido de pago</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
