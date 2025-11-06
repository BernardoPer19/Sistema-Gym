"use client";

import { useState } from "react";
import { ClientLogin } from "@/components/portal-cliente/client-login";
import { ClientDashboard } from "@/components/portal-cliente/client-dashboard";
import type { Member, Payment, Attendance } from "@/lib/types/types";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  findMemberByCode,
  getMemberPayments,
  getMemberAttendances,
} from "@/actions/portal.actions";

export default function PortalClientePage() {
  const [loggedInMember, setLoggedInMember] = useState<Member | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (code: string) => {
    if (!code.trim()) {
      toast({
        title: "Código requerido",
        description: "Por favor ingresa tu código QR o ID de socio.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const memberResult = await findMemberByCode(code.trim());

      if (!memberResult.success || !memberResult.data) {
        toast({
          title: "Código inválido",
          description:
            "No se encontró ningún socio con ese código. Verifica tu código QR o ID de socio.",
          variant: "destructive",
        });
        return;
      }

      const member = memberResult.data;

      // Cargar pagos y asistencias en paralelo
      const [paymentsResult, attendancesResult] = await Promise.all([
        getMemberPayments(member.id),
        getMemberAttendances(member.id),
      ]);

      // Convertir fechas de string a Date si es necesario
      const paymentsWithDates = paymentsResult.success
        ? paymentsResult.data.map((payment: any) => ({
            ...payment,
            date:
              payment.date instanceof Date
                ? payment.date
                : new Date(payment.date),
          }))
        : [];

      const attendancesWithDates = attendancesResult.success
        ? attendancesResult.data.map((attendance: any) => ({
            ...attendance,
            date:
              attendance.date instanceof Date
                ? attendance.date
                : new Date(attendance.date),
          }))
        : [];

      setLoggedInMember({
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        membershipId: member.membershipId,
        status: member.status,
        joinDate:
          member.joinDate instanceof Date
            ? member.joinDate
            : new Date(member.joinDate),
        expiryDate:
          member.expiryDate instanceof Date
            ? member.expiryDate
            : new Date(member.expiryDate),
        birthDate:
          member.birthDate instanceof Date
            ? member.birthDate
            : new Date(member.birthDate),
        qrCode: member.qrCode,
        photo: member.photo,
        membership: member.membership, // Incluir información de membresía
      } as any);
      setPayments(paymentsWithDates);
      setAttendances(attendancesWithDates);

      toast({
        title: "Bienvenido",
        description: `Hola ${member.name}, accediste exitosamente a tu portal.`,
      });
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al iniciar sesión. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setLoggedInMember(null);
    setPayments([]);
    setAttendances([]);
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
  };

  if (!loggedInMember) {
    return (
      <>
        <ClientLogin onLogin={handleLogin} loading={loading} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <ClientDashboard
        member={loggedInMember}
        payments={payments}
        attendances={attendances}
        onLogout={handleLogout}
      />
      <Toaster />
    </>
  );
}
