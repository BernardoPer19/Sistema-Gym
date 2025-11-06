"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  createMember,
  getAllMemberships,
  updateMember,
  type MemberFormData,
} from "@/actions/member.actions";
import { Member, Membership } from "@prisma/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MemberFormDialogProps {
  open: boolean;
  onClose: () => void;
  member?: Member;
}

export function MemberFormDialog({
  open,
  onClose,
  member,
}: MemberFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loadingMemberships, setLoadingMemberships] = useState(false);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [membershipsError, setMembershipsError] = useState<string | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<MemberFormData>({
    name: "",
    email: "",
    phone: "",
    membershipId: "",
    birthDate: "",
  });

  // Fetch memberships cuando se abre el dialog
  useEffect(() => {
    const fetchMemberships = async () => {
      if (!open) return;

      setLoadingMemberships(true);
      setMembershipsError(null);

      const result = await getAllMemberships();

      setLoadingMemberships(false);

      if (result.success && result.data) {
        setMemberships(result.data);
        
        // Si no hay miembro para editar y hay membresías, seleccionar la primera
        if (!member && result.data.length > 0 && !formData.membershipId) {
          setFormData(prev => ({
            ...prev,
            membershipId: result.data[0].id,
          }));
        }
      } else {
        setMembershipsError(result.error || "Error al cargar membresías");
        toast({
          title: "Error",
          description: "No se pudieron cargar las membresías",
          variant: "destructive",
        });
      }
    };

    fetchMemberships();
  }, [open]);

  // Cargar datos del miembro si está editando
  useEffect(() => {
    if (member && open) {
      setFormData({
        name: member.name,
        email: member.email || "",
        phone: member.phone,
        membershipId: member.membershipId,
        birthDate: member.birthDate.toISOString().split("T")[0],
      });
    } else if (!open) {
      // Reset form cuando se cierra
      setFormData({
        name: "",
        email: "",
        phone: "",
        membershipId: memberships[0]?.id || "",
        birthDate: "",
      });
    }
  }, [member, open, memberships]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación adicional
    if (!formData.membershipId) {
      toast({
        title: "Error",
        description: "Debes seleccionar una membresía",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const result = member
      ? await updateMember(member.id, formData)
      : await createMember(formData);

    setLoading(false);

    if (result.success) {
      toast({
        title: "¡Éxito!",
        description: result.message,
      });
      onClose();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const selectedMembership = memberships.find(
    (m) => m.id === formData.membershipId
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-zinc-900 text-white border-zinc-800 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {member ? "Editar Socio" : "Nuevo Socio"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {member
                ? "Actualiza los datos del socio"
                : "Completa los datos para registrar un nuevo socio"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Error al cargar membresías */}
            {membershipsError && (
              <Alert variant="destructive" className="bg-red-500/10 border-red-500/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{membershipsError}</AlertDescription>
              </Alert>
            )}

            {/* Nombre */}
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                placeholder="Ej: Juan Pérez"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                required
                disabled={loading}
              />
            </div>

            {/* Email y Teléfono */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  placeholder="70123456"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Fecha de Nacimiento */}
            <div className="grid gap-2">
              <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
                className="bg-zinc-800 border-zinc-700 text-white"
                required
                disabled={loading}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Membresía */}
            <div className="grid gap-2">
              <Label htmlFor="membership">Membresía *</Label>
              
              {loadingMemberships ? (
                <div className="flex items-center justify-center h-10 bg-zinc-800 border border-zinc-700 rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                  <span className="ml-2 text-sm text-zinc-400">
                    Cargando membresías...
                  </span>
                </div>
              ) : memberships.length === 0 ? (
                <div className="flex items-center justify-center h-10 bg-zinc-800 border border-zinc-700 rounded-md">
                  <span className="text-sm text-zinc-400">
                    No hay membresías disponibles
                  </span>
                </div>
              ) : (
                <Select
                  value={formData.membershipId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, membershipId: value })
                  }
                  disabled={loading || loadingMemberships}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Selecciona una membresía" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800">
                    {memberships.map((membership) => (
                      <SelectItem
                        key={membership.id}
                        value={membership.id}
                        className="text-white hover:bg-zinc-800 focus:bg-zinc-800 "
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{membership.name}</span>
                          
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Preview de la membresía seleccionada */}
              {selectedMembership && (
                <div className="mt-2 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Precio:</span>
                    <span className="font-semibold text-green-400">
                      Bs {selectedMembership.price}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-zinc-400">Duración:</span>
                    <span className="text-white">
                      {selectedMembership.duration} días
                    </span>
                  </div>
                  {selectedMembership.description && (
                    <p className="text-xs text-zinc-500 mt-2">
                      {selectedMembership.description}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Información adicional */}
            {!member && (
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                <p className="text-sm text-blue-400 font-medium mb-2">
                  ℹ️ Al crear el socio se generará automáticamente:
                </p>
                <ul className="text-sm text-blue-400 space-y-1 list-disc list-inside">
                  <li>Código QR único de acceso</li>
                  <li>Registro de pago inicial</li>
                  <li>Fecha de vencimiento según la membresía seleccionada</li>
                </ul>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || loadingMemberships || memberships.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {member ? "Actualizando..." : "Creando..."}
                </>
              ) : (
                <>{member ? "Actualizar Socio" : "Crear Socio"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}