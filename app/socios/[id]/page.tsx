import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getMemberById, getMembershipById, payments, attendances } from "@/lib/mock-data"
import { Mail, Phone, Calendar, CreditCard, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { QRCodeDisplay } from "@/components/socios/qr-code-display"

export default function MemberDetailPage({ params }: { params: { id: string } }) {
  const member = getMemberById(params.id)

  if (!member) {
    notFound()
  }

  const membership = getMembershipById(member.membershipId)
  const memberPayments = payments.filter((p) => p.memberId === member.id)
  const memberAttendances = attendances.filter((a) => a.memberId === member.id).slice(0, 10)

  const getStatusColor = (status: typeof member.status) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "inactive":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "expired":
        return "bg-red-500/10 text-red-500 border-red-500/20"
    }
  }

  return (
    <div className="flex flex-col">
      <Header title="Detalle del Socio" description={member.name} />

      <div className="flex-1 space-y-6 p-6">
        <Link href="/socios">
          <Button variant="outline" className="gap-2 border-border bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Volver a Socios
          </Button>
        </Link>

        {/* Member Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-white">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estado</span>
                <Badge variant="outline" className={getStatusColor(member.status)}>
                  {member.status === "active" ? "Activo" : member.status === "inactive" ? "Inactivo" : "Vencido"}
                </Badge>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm font-medium text-white">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="text-sm font-medium text-white">{member.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                  <p className="text-sm font-medium text-white">{member.joinDate.toLocaleDateString("es-MX")}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Vencimiento</p>
                  <p className="text-sm font-medium text-white">{member.expiryDate.toLocaleDateString("es-MX")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-white">Membresía Actual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-white">{membership?.name}</p>
                <p className="text-sm text-muted-foreground">{membership?.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Precio Mensual</p>
                  <p className="text-sm font-medium text-white">${membership?.price}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-white mb-2">Características</p>
                <ul className="space-y-1">
                  {membership?.features.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <QRCodeDisplay member={member} />

        {/* Payment History */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">Historial de Pagos</CardTitle>
          </CardHeader>
          <CardContent>
            {memberPayments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Factura</TableHead>
                    <TableHead className="text-muted-foreground">Fecha</TableHead>
                    <TableHead className="text-muted-foreground">Membresía</TableHead>
                    <TableHead className="text-muted-foreground">Monto</TableHead>
                    <TableHead className="text-muted-foreground">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberPayments.map((payment) => (
                    <TableRow key={payment.id} className="border-border">
                      <TableCell className="font-medium text-white">{payment.invoiceNumber}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {payment.date.toLocaleDateString("es-MX")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{payment.membershipName}</TableCell>
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
            <CardTitle className="text-white">Historial de Asistencias (Últimas 10)</CardTitle>
          </CardHeader>
          <CardContent>
            {memberAttendances.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Fecha</TableHead>
                    <TableHead className="text-muted-foreground">Hora</TableHead>
                    <TableHead className="text-muted-foreground">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {memberAttendances.map((attendance) => (
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
