"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { MemberTable } from "@/components/socios/member-table"
import { MemberForm } from "@/components/socios/member-form"
import { members as initialMembers } from "@/lib/mock-data"
import type { Member } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function SociosPage() {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | undefined>()
  const { toast } = useToast()

  const handleAdd = () => {
    setEditingMember(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setIsFormOpen(true)
  }

  const handleSave = (memberData: Partial<Member>) => {
    if (editingMember) {
      // Edit existing member
      setMembers(members.map((m) => (m.id === editingMember.id ? { ...m, ...memberData } : m)))
      toast({
        title: "Socio actualizado",
        description: "Los datos del socio se han actualizado correctamente.",
      })
    } else {
      // Add new member
      const newMember: Member = {
        id: `member-${members.length + 1}`,
        name: memberData.name!,
        email: memberData.email!,
        phone: memberData.phone!,
        membershipId: memberData.membershipId!,
        status: memberData.status || "active",
        joinDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      }
      setMembers([newMember, ...members])
      toast({
        title: "Socio creado",
        description: "El nuevo socio se ha registrado correctamente.",
      })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este socio?")) {
      setMembers(members.filter((m) => m.id !== id))
      toast({
        title: "Socio eliminado",
        description: "El socio ha sido eliminado del sistema.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col">
      <Header title="Socios" description="Gestión de miembros del gimnasio" />

      <div className="flex-1 p-6">
        <MemberTable members={members} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} />
      </div>

      <MemberForm open={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSave} member={editingMember} />

      <Toaster />
    </div>
  )
}
