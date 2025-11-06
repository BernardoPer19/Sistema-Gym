"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { MembershipCard } from "@/components/membresias/membership-card";
import { ExpiryAlerts } from "@/components/membresias/expiry-alerts";
import { PaymentHistory } from "@/components/membresias/payment-history";
import {
  members,
  payments,
  getExpiringMembers,
  getMemberById,
} from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import type { Payment, Membership } from "@/lib/types/types";
import { CreateMembershipDialog } from "@/components/membresias/CreateMembershipDialog";
import { deleteMembership, getMemberships } from "@/actions/membership.actions";

export default function MembresiasPage() {
  const { toast } = useToast();

  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  const expiringMembers = getExpiringMembers(7);

  useEffect(() => {
    async function fetchMemberships() {
      setLoading(true);
      try {
        const result = await getMemberships();
        setMemberships(Array.isArray(result) ? result : result?.data ?? []);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las membresías",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchMemberships();
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
    const member = members.find((m) => m.id === memberId);
    if (!member) return;

    toast({
      title: "Recordatorio enviado",
      description: `Se ha enviado un recordatorio de renovación a ${member.name}`,
    });
  };

  const handleDownloadInvoice = (payment: Payment) => {
    const member = getMemberById(payment.memberId);
    if (!member) {
      toast({
        title: "Error",
        description: "No se pudo encontrar la información del socio",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Recibo descargado",
      description: `Factura ${payment.invoiceNumber} - ${member.name}`,
    });
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
                const memberCount = members.filter(
                  (m) =>
                    m.membershipId === membership.id && m.status === "active"
                ).length;

                return (
                  <MembershipCard
                    key={membership.id}
                    membership={membership}
                    memberCount={memberCount}
                    onDelete={handleDeleteMembership} // <-- aquí
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
