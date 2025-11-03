"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, CreditCard, Calendar, Activity, LogOut, Download, QrCode } from "lucide-react"
import type { Member, Payment, Attendance } from "@/lib/types"
import { getMembershipById } from "@/lib/mock-data"

interface ClientDashboardProps {
  member: Member
  payments: Payment[]
  attendances: Attendance[]
  onLogout: () => void
}

export function ClientDashboard({ member, payments, attendances, onLogout }: ClientDashboardProps) {
  const membership = getMembershipById(member.membershipId)

  const getStatusColor = (status: Member["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "inactive":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "expired":
        return "bg-red-500/10 text-red-500 border-red-500/20"
    }
  }

  const getDaysUntilExpiry = () => {
    const now = new Date()
    const diff = member.expiryDate.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const daysLeft = getDaysUntilExpiry()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">{member.name}</h1>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={onLogout} className="gap-2 border-border bg-transparent">
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto space-y-6 p-6">
        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <Badge variant="outline" className={`mt-1 ${getStatusColor(member.status)}`}>
                    {member.status === "active" ? "Activo" : member.status === "inactive" ? "Inactivo" : "Vencido"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Vencimiento</p>
                  <p className="mt-1 text-lg font-bold text-white">{daysLeft > 0 ? `${daysLeft} días` : "Vencida"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Asistencias</p>
                  <p className="mt-1 text-lg font-bold text-white">{attendances.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              Mi Código QR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(member.qrCode)}`}
                alt="QR Code"
                className="w-48 h-48"
              />
              <div className="text-center">
                <p className="text-sm font-medium text-gray-900">Código de Acceso</p>
                <p className="text-xs text-gray-600 mt-1 font-mono">{member.qrCode}</p>
              </div>
              <p className="text-xs text-gray-500 text-center max-w-sm">
                Presenta este código QR en la recepción para registrar tu asistencia
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Membership Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">Mi Membresía</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-2xl font-bold text-white">{membership?.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{membership?.description}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">${membership?.price}</p>
                <p className="text-sm text-muted-foreground">por mes</p>
              </div>
            </div>

            <div className="grid gap-2 pt-4 border-t border-border">
              <p className="text-sm font-medium text-white">Características incluidas:</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {membership?.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                <p className="text-sm font-medium text-white">{member.joinDate.toLocaleDateString("es-MX")}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                <p className="text-sm font-medium text-white">{member.expiryDate.toLocaleDateString("es-MX")}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                <p className="text-sm font-medium text-white">{member.birthDate.toLocaleDateString("es-MX")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">Historial de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Factura</TableHead>
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
                      <TableCell className="text-muted-foreground">
                        {payment.date.toLocaleDateString("es-MX")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">${payment.amount}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            payment.status === "paid"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          }
                        >
                          {payment.status === "paid" ? "Pagado" : "Pendiente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="gap-2" disabled={payment.status !== "paid"}>
                          <Download className="h-4 w-4" />
                          Descargar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">No hay pagos registrados</p>
            )}
          </CardContent>
        </Card>

        {/* Attendance History */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">Mis Asistencias</CardTitle>
            <p className="text-sm text-muted-foreground">Últimas 10 visitas</p>
          </CardHeader>
          <CardContent>
            {attendances.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Fecha</TableHead>
                    <TableHead className="text-muted-foreground">Hora</TableHead>
                    <TableHead className="text-muted-foreground">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendances.slice(0, 10).map((attendance) => (
                    <TableRow key={attendance.id} className="border-border">
                      <TableCell className="text-white">{attendance.date.toLocaleDateString("es-MX")}</TableCell>
                      <TableCell className="text-muted-foreground">{attendance.time}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            attendance.status === "allowed"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                          }
                        >
                          {attendance.status === "allowed" ? "Permitido" : "Denegado"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-8">No hay asistencias registradas</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
