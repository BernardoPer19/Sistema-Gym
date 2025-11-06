"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { MemberTable } from "@/components/socios/member-table";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  getAllMembers,
  deleteMember,
} from "@/actions/member.actions";
import { Loader2 } from "lucide-react";
import { MemberFormDialog } from "@/components/socios/member-form";
import { Member, Membership } from "@prisma/client";

interface MemberWithMembership extends Member {
  membership: Membership;
}

export default function SociosPage() {
  const [members, setMembers] = useState<MemberWithMembership[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>();
  const { toast } = useToast();

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Cargar miembros
    const membersResult = await getAllMembers();
    if (membersResult.success) {
      setMembers(membersResult.data);
      
      // Extraer membresías únicas
      const uniqueMemberships = membersResult.data.reduce((acc, member) => {
        if (!acc.find((m) => m.id === member.membership.id)) {
          acc.push(member.membership);
        }
        return acc;
      }, [] as Membership[]);
      
      setMemberships(uniqueMemberships);
    }
    
    setLoading(false);
  };

  const handleAdd = () => {
    setEditingMember(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const member = members.find((m) => m.id === id);
    
    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar a ${member?.name}?\n\nEsta acción eliminará también:\n- Todos los pagos registrados\n- Todas las asistencias\n\nEsta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    const result = await deleteMember(id);

    if (result.success) {
      toast({
        title: "Socio eliminado",
        description: result.message,
      });
      loadData(); // Recargar datos
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingMember(undefined);
    loadData(); // Recargar datos después de crear/editar
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header title="Socios" description="Gestión de miembros del gimnasio" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-muted-foreground">Cargando socios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header title="Socios" description="Gestión de miembros del gimnasio" />

      <div className="flex-1 p-4 md:p-6">
        <MemberTable
          members={members}
          onAdd={handleAdd}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <MemberFormDialog
        open={isFormOpen}
        onClose={handleCloseForm}
        member={editingMember}
      />

      <Toaster />
    </div>
  );
}