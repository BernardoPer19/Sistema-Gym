"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Calendar } from "lucide-react"
import type { Attendance } from "@/lib/types"

interface AttendanceTableProps {
  attendances: Attendance[]
}

export function AttendanceTable({ attendances }: AttendanceTableProps) {
  const [search, setSearch] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  const filteredAttendances = attendances.filter((attendance) => {
    const matchesSearch = attendance.memberName.toLowerCase().includes(search.toLowerCase())
    const matchesDate = !dateFilter || attendance.date.toISOString().split("T")[0] === dateFilter
    return matchesSearch && matchesDate
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border text-white"
          />
        </div>

        <div className="relative max-w-xs">
          <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="pl-9 bg-secondary border-border text-white"
          />
        </div>

        {(search || dateFilter) && (
          <Button
            variant="outline"
            onClick={() => {
              setSearch("")
              setDateFilter("")
            }}
            className="border-border bg-transparent"
          >
            Limpiar Filtros
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Socio</TableHead>
              <TableHead className="text-muted-foreground">Fecha</TableHead>
              <TableHead className="text-muted-foreground">Hora</TableHead>
              <TableHead className="text-muted-foreground">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendances.map((attendance) => (
              <TableRow key={attendance.id} className="border-border">
                <TableCell className="font-medium text-white">{attendance.memberName}</TableCell>
                <TableCell className="text-muted-foreground">{attendance.date.toLocaleDateString("es-MX")}</TableCell>
                <TableCell className="text-muted-foreground">{attendance.time}</TableCell>
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
      </div>

      {filteredAttendances.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No se encontraron registros de asistencia</p>
        </div>
      )}
    </div>
  )
}
