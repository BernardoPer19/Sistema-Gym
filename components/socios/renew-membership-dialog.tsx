"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Loader2, Calendar, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { renewMembership } from "@/actions/member.actions";
import type { Member, Membership } from "@/lib/types/types";

interface RenewMembershipDialogProps {
  member: Member;
  currentMembership: Membership;
  availableMemberships: Membership[];
}

export function RenewMembershipDialog({
  member,
  currentMembership,
  availableMemberships,
}: RenewMembershipDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMembershipId, setSelectedMembershipId] = useState(
    currentMembership.id
  );
  const { toast } = useToast();

  const selectedMembership = availableMemberships.find(
    (m) => m.id === selectedMembershipId
  );

  const calculateNewExpiryDate = () => {
    const today = new Date();
    const currentExpiry = new Date(member.expiryDate);
    const startDate = currentExpiry > today ? currentExpiry : today;
    const newExpiry = new Date(startDate);
    newExpiry.setDate(newExpiry.getDate() + (selectedMembership?.duration || 0));
    return newExpiry;
  };

  const handleRenew = async () => {
    setLoading(true);

    const result = await renewMembership(
      member.id,
      selectedMembershipId !== currentMembership.id
        ? selectedMembershipId
        : undefined
    );

    setLoading(false);

    if (result.success) {
      toast({
        title: "¡Renovación exitosa!",
        description: result.message,
      });
      setOpen(false);
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 gap-2">
          <RefreshCw className="h-4 w-4" />
          Renovar Membresía
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle>Renovar Membresía</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Renueva la membresía de {member.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información actual */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Membresía Actual</span>
              <span className="text-sm font-medium">{currentMembership.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Vencimiento Actual</span>
              <span className="text-sm font-medium">
                {new Date(member.expiryDate).toLocaleDateString("es-ES")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">Estado</span>
              <span
                className={`text-sm font-medium ${
                  member.status === "active"
                    ? "text-green-500"
                    : member.status === "expired"
                    ? "text-red-500"
                    : "text-yellow-500"
                }`}
              >
                {member.status === "active"
                  ? "Activo"
                  : member.status === "expired"
                  ? "Vencido"
                  : "Inactivo"}
              </span>
            </div>
          </div>

          {/* Seleccionar nueva membresía */}
          <div className="grid gap-2">
            <Label htmlFor="membership">Seleccionar Plan</Label>
            <Select
              value={selectedMembershipId}
              onValueChange={setSelectedMembershipId}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {availableMemberships.map((membership) => (
                  <SelectItem
                    key={membership.id}
                    value={membership.id}
                    className="text-white"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{membership.name}</span>
                      <span className="text-zinc-400 ml-4">
                        Bs {membership.price} / {membership.duration} días
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resumen de renovación */}
          {selectedMembership && (
            <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-4 space-y-3">
              <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Nueva Información
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-300">Nuevo Vencimiento</span>
                  <span className="text-sm font-medium text-white">
                    {calculateNewExpiryDate().toLocaleDateString("es-ES")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-300">Duración</span>
                  <span className="text-sm font-medium text-white">
                    {selectedMembership.duration} días
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-green-500/20 pt-2">
                  <span className="text-sm font-semibold text-green-300 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Total a Pagar
                  </span>
                  <span className="text-lg font-bold text-white">
                    Bs {selectedMembership.price}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Nota informativa */}
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
            <p className="text-xs text-blue-400">
              <strong>Nota:</strong> Se creará automáticamente un nuevo registro
              de pago y se actualizará la fecha de vencimiento. El estado del
              socio será cambiado a "Activo".
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleRenew}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>Confirmar Renovación</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}