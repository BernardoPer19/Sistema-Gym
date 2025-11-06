"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { MembershipCard } from "@/components/membresias/membership-card";
import { ExpiryAlerts } from "@/components/membresias/expiry-alerts";
import { PaymentHistory } from "@/components/membresias/payment-history";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import type { Payment, Membership, Member } from "@/lib/types/types";
import { CreateMembershipDialog } from "@/components/membresias/CreateMembershipDialog";
import {
  deleteMembership,
  getMemberships,
  getExpiringMembers,
  getRecentPayments,
} from "@/actions/membership.actions";
import { downloadInvoicePDF } from "@/lib/pdf/invoice-generator";

export default function MembresiasPage() {
  const { toast } = useToast();

  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [expiringMembers, setExpiringMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [membershipsResult, expiringResult, paymentsResult] =
          await Promise.all([
            getMemberships(),
            getExpiringMembers(7),
            getRecentPayments(30),
          ]);

        if (membershipsResult.success) {
          setMemberships(membershipsResult.data || []);
        }

        if (expiringResult.success) {
          setExpiringMembers(expiringResult.data || []);
        }

        if (paymentsResult.success) {
          // Convertir fechas de string a Date si es necesario
          const paymentsWithDates = paymentsResult.data.map((payment: any) => ({
            ...payment,
            date:
              payment.date instanceof Date
                ? payment.date
                : new Date(payment.date),
          }));
          setPayments(paymentsWithDates);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [toast]);

  const handleDeleteMembership = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta membresía?"))
      return;

    try {
      const res = await deleteMembership(id);
      if (res.success) {
        setMemberships((prev) => prev.filter((m) => m.id !== id));
        toast({
          title: "Membresía eliminada",
          description: res.message,
        });
      } else {
        toast({
          title: "Error",
          description: res.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la membresía",
        variant: "destructive",
      });
    }
  };

  const handleSendReminder = (memberId: string) => {
    const member = expiringMembers.find((m) => m.id === memberId);
    if (!member) return;

    toast({
      title: "Recordatorio enviado",
      description: `Se ha enviado un recordatorio de renovación a ${member.name}`,
    });
  };

  const handleDownloadInvoice = async (payment: Payment) => {
    try {
      const result = await downloadInvoicePDF({
        invoiceNumber: payment.invoiceNumber,
        date: payment.date,
        memberName: payment.memberName,
        membershipName: payment.membershipName,
        amount: payment.amount,
        status: payment.status,
      });

      if (result.success) {
        toast({
          title: "Factura descargada",
          description: `Factura ${payment.invoiceNumber} descargada correctamente`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "No se pudo generar la factura",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast({
        title: "Error",
        description:
          "No se pudo generar la factura. Asegúrate de tener jsPDF instalado.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <Header title="Membresías" description="Planes y pagos del gimnasio" />

      <div className="flex-1 space-y-6 p-6">
        {/* Membership Plans */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Planes Disponibles
            </h3>
            <CreateMembershipDialog />
          </div>

          {loading ? (
            <p className="text-white">Cargando membresías...</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {memberships.map((membership) => {
                const memberCount = (membership as any).activeMembersCount || 0;
                return (
                  <MembershipCard
                    key={membership.id}
                    membership={membership}
                    memberCount={memberCount}
                    onDelete={handleDeleteMembership}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Expiry Alerts */}
        <ExpiryAlerts
          expiringMembers={expiringMembers}
          onSendReminder={handleSendReminder}
        />

        {/* Payment History */}
        <PaymentHistory
          payments={payments}
          onDownloadInvoice={handleDownloadInvoice}
        />
      </div>

      <Toaster />
    </div>
  );
}
