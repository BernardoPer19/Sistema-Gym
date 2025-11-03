"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Member } from "@/lib/types"
import { memberships } from "@/lib/mock-data"

interface MemberFormProps {
  open: boolean
  onClose: () => void
  onSave: (member: Partial<Member>) => void
  member?: Member
}

export function MemberForm({ open, onClose, onSave, member }: MemberFormProps) {
  const [formData, setFormData] = useState<Partial<Member>>(
    member || {
      name: "",
      email: "",
      phone: "",
      membershipId: memberships[0].id,
      status: "active",
    },
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{member ? "Editar Socio" : "Nuevo Socio"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-secondary border-border text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-secondary border-border text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-secondary border-border text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="membership">Membresía</Label>
            <Select
              value={formData.membershipId}
              onValueChange={(value) => setFormData({ ...formData, membershipId: value })}
            >
              <SelectTrigger className="bg-secondary border-border text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {memberships.map((membership) => (
                  <SelectItem key={membership.id} value={membership.id} className="text-white">
                    {membership.name} - ${membership.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger className="bg-secondary border-border text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="active" className="text-white">
                  Activo
                </SelectItem>
                <SelectItem value="inactive" className="text-white">
                  Inactivo
                </SelectItem>
                <SelectItem value="expired" className="text-white">
                  Vencido
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-border bg-transparent">
              Cancelar
            </Button>
            <Button type="submit">{member ? "Guardar Cambios" : "Crear Socio"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
