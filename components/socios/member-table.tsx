"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Eye, Pencil, Trash2, Filter } from "lucide-react";
import Link from "next/link";
import { Member } from "@prisma/client";

interface MemberWithMembership extends Member {
  membership?: {
    name: string;
  };
}

interface MemberTableProps {
  members: MemberWithMembership[];
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

type StatusFilter = "all" | "active" | "inactive" | "expired";

export function MemberTable({
  members,
  onEdit,
  onDelete,
  onAdd,
}: MemberTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Memoizar filtrado para mejor performance
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        member.name.toLowerCase().includes(searchLower) ||
        member.email.toLowerCase().includes(searchLower) ||
        member.phone?.toLowerCase().includes(searchLower);
      
      const matchesStatus =
        statusFilter === "all" || member.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [members, search, statusFilter]);

  // Memoizar contadores de estado
  const statusCounts = useMemo(() => {
    return members.reduce(
      (acc, member) => {
        acc[member.status]++;
        acc.total++;
        return acc;
      },
      { active: 0, inactive: 0, expired: 0, total: 0 }
    );
  }, [members]);

  const getStatusColor = (status: Member["status"]) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "inactive":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "expired":
        return "bg-red-500/10 text-red-500 border-red-500/20";
    }
  };

  const getStatusLabel = (status: Member["status"]) => {
    switch (status) {
      case "active":
        return "Activo";
      case "inactive":
        return "Inactivo";
      case "expired":
        return "Vencido";
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpiringSoon = (date: Date) => {
    const daysUntilExpiry = Math.ceil(
      (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const filterButtons = [
    { value: "all" as StatusFilter, label: "Todos", count: statusCounts.total },
    { value: "active" as StatusFilter, label: "Activos", count: statusCounts.active },
    { value: "inactive" as StatusFilter, label: "Inactivos", count: statusCounts.inactive },
    { value: "expired" as StatusFilter, label: "Vencidos", count: statusCounts.expired },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50 border-border text-white placeholder:text-muted-foreground/60 focus-visible:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          {filterButtons.map(({ value, label, count }) => (
            <Button
              key={value}
              variant={statusFilter === value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(value)}
              className={
                statusFilter === value
                  ? "gap-2"
                  : "border-border hover:bg-secondary/50 gap-2"
              }
            >
              {label}
              <span
                className={
                  statusFilter === value
                    ? "text-xs opacity-80"
                    : "text-xs text-muted-foreground"
                }
              >
                ({count})
              </span>
            </Button>
          ))}
        </div>

        <Button onClick={onAdd} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          Nuevo Socio
        </Button>
      </div>

      {/* Results counter */}
      {search && (
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredMembers.length} de {members.length} socios
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground font-semibold">
                  Nombre
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold">
                  Email
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold">
                  Teléfono
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold">
                  Membresía
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold">
                  Estado
                </TableHead>
                <TableHead className="text-muted-foreground font-semibold">
                  Vencimiento
                </TableHead>
                <TableHead className="text-right text-muted-foreground font-semibold">
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search className="h-8 w-8 opacity-40" />
                      <p>
                        {search
                          ? "No se encontraron socios con ese criterio"
                          : "No hay socios registrados"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => (
                  <TableRow
                    key={member.id}
                    className="border-border hover:bg-secondary/30 transition-colors"
                  >
                    <TableCell className="font-medium text-white">
                      {member.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.phone || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        {member.membership?.name || "Sin membresía"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusColor(member.status)}
                      >
                        {getStatusLabel(member.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex flex-col gap-1">
                        <span>{formatDate(member.expiryDate)}</span>
                        {member.status === "active" &&
                          isExpiringSoon(member.expiryDate) && (
                            <span className="text-xs text-orange-500">
                              ⚠️ Próximo a vencer
                            </span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Link href={`/socios/${member.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-secondary"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-secondary"
                          onClick={() => onEdit(member)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => onDelete(member.id)}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}