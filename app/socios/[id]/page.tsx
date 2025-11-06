"use client";

import { useEffect, useState, use } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QRCodeDisplay } from "@/components/socios/qr-code-display";
import { RenewMembershipDialog } from "@/components/socios/renew-membership-dialog";
import { MemberFormDialog } from "@/components/socios/member-form";
import {
  getMemberById,
  updateMemberStatus,
  getAllMemberships,
} from "@/actions/member.actions";
import {
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Clock,
  ArrowLeft,
  Loader2,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import type { Member, Membership, Payment, Attendance } from "@/lib/types/types";

interface MemberDetailData extends Member {
  membership: Membership;
  payments: Payment[];
  attendances: Attendance[];
}

export default function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [member, setMember] = useState<MemberDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [resolvedParams.id]);

  const loadData = async () => {
    setLoading(true);

    // Cargar miembro
    const memberResult = await getMemberById(resolvedParams.id);
    if (memberResult.success) {
      setMember(memberResult.data);
    } else {
      toast({
        title: "Error",
        description: memberResult.error,
        variant: "destructive",
      });
    }

    // Cargar todas las membresías disponibles
    const membershipsResult = await getAllMemberships();
    if (membershipsResult.success) {
      setMemberships(membershipsResult.data);
    }

    setLoading(false);
  };

  const handleStatusChange = async (
    status: "active" | "inactive" | "expired"
  ) => {
    if (!member) return;

    const result = await updateMemberStatus(member.id, status);

    if (result.success) {
      toast({
        title: "Estado actualizado",
        description: "El estado del socio se ha actualizado correctamente",
      });
      loadData();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="Detalle del Socio" description="Cargando..." />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-muted-foreground">Cargando información...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col">
        <Header title="Socio no encontrado" description="" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white mb-2">
              Socio no encontrado
            </h3>
            <p className="text-muted-foreground mb-4">
              El socio que buscas no existe o ha sido eliminado
            </p>
            <Link href="/socios">
              <Button variant="outline" className="gap-2 border-border">
                <ArrowLeft className="h-4 w-4" />
                Volver a Socios
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: typeof member.status) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "inactive":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "expired":
        return "bg-red-500/10 text-red-500 border-red-500/20";
    }
  };

  return (
    <div className="flex flex-col">
      <Header title="Detalle del Socio" description={member.name} />

      <div className="flex-1 space-y-6 p-6">
        {/* Header con acciones */}
        <div className="flex items-center justify-between">
          <Link href="/socios">
            <Button
              variant="outline"
              className="gap-2 border-border bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Socios
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <RenewMembershipDialog
              member={member}
              currentMembership={member.membership}
              availableMemberships={memberships}
            />
            <Button
              variant="outline"
              className="gap-2 border-border"
              onClick={() => setIsEditOpen(true)}
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>

        {/* Member Info */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-white">Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Estado</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(member.status)}>
                    {member.status === "active"
                      ? "Activo"
                      : member.status === "inactive"
                      ? "Inactivo"
                      : "Vencido"}
                  </Badge>
                  <select
                    value={member.status}
                    onChange={(e) =>
                      handleStatusChange(
                        e.target.value as "active" | "inactive" | "expired"
                      )
                    }
                    className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="expired">Vencido</option>
                  </select>
                </div>
              </div>

              {member.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-white">{member.email}</p>
                  </div>
                </div>
              )}

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
                  <p className="text-sm font-medium text-white">
                    {new Date(member.joinDate).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Fecha de Nacimiento</p>
                  <p className="text-sm font-medium text-white">
                    {new Date(member.birthDate).toLocaleDateString("es-ES")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Vencimiento</p>
                  <p className="text-sm font-medium text-white">
                    {new Date(member.expiryDate).toLocaleDateString("es-ES")}
                  </p>
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
                <p className="text-2xl font-bold text-white">
                  {member.membership.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {member.membership.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Precio</p>
                  <p className="text-sm font-medium text-white">
                    Bs {member.membership.price}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Duración</p>
                  <p className="text-sm font-medium text-white">
                    {member.membership.duration} días
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-white mb-2">
                  Características
                </p>
                <ul className="space-y-1">
                  {member.membership.features.map((feature, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground flex items-center gap-2"
                    >
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
            {member.payments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Factura</TableHead>
                    <TableHead className="text-muted-foreground">Fecha</TableHead>
                    <TableHead className="text-muted-foreground">
                      Membresía
                    </TableHead>
                    <TableHead className="text-muted-foreground">Monto</TableHead>
                    <TableHead className="text-muted-foreground">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {member.payments.map((payment) => (
                    <TableRow key={payment.id} className="border-border">
                      <TableCell className="font-medium text-white">
                        {payment.invoiceNumber}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString("es-ES")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {payment.membershipName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        Bs {payment.amount}
                      </TableCell>
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
              <p className="text-center text-muted-foreground py-8">
                No hay pagos registrados
              </p>
            )}
          </CardContent>
        </Card>

        {/* Attendance History */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">
              Historial de Asistencias (Últimas 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {member.attendances.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Fecha</TableHead>
                    <TableHead className="text-muted-foreground">Hora</TableHead>
                    <TableHead className="text-muted-foreground">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {member.attendances.map((attendance) => (
                    <TableRow key={attendance.id} className="border-border">
                      <TableCell className="text-white">
                        {new Date(attendance.date).toLocaleDateString("es-ES")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {attendance.time}
                      </TableCell>
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
              <p className="text-center text-muted-foreground py-8">
                No hay asistencias registradas
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <MemberFormDialog
        open={isEditOpen}
        onClose={handleCloseEdit}
        member={member}
        memberships={memberships}
      />

      <Toaster />
    </div>
  );
}