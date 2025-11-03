"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { CheckInScanner } from "@/components/asistencias/check-in-scanner"
import { AttendanceTable } from "@/components/asistencias/attendance-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { attendances as initialAttendances, getMemberByQRCode } from "@/lib/mock-data"
import type { Attendance } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function AsistenciasPage() {
  const [attendances, setAttendances] = useState<Attendance[]>(initialAttendances)

  const handleCheckIn = (code: string) => {
    const member = getMemberByQRCode(code)

    if (!member) {
      return {
        success: false,
        message: "Código no válido. Socio no encontrado.",
      }
    }

    if (member.status !== "active") {
      return {
        success: false,
        member,
        message:
          member.status === "expired"
            ? "Membresía vencida. Por favor renueva tu membresía."
            : "Membresía inactiva. Contacta a recepción.",
      }
    }

    const now = new Date()
    const newAttendance: Attendance = {
      id: `att-${attendances.length + 1}`,
      memberId: member.id,
      memberName: member.name,
      date: now,
      time: now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
      status: "allowed",
      attended: true,
    }

    setAttendances([newAttendance, ...attendances])

    return {
      success: true,
      member,
      message: `Bienvenido/a al gimnasio. Disfruta tu entrenamiento.`,
    }
  }

  // Weekly attendance chart data
  const weeklyData = [
    { day: "Lun", count: 42 },
    { day: "Mar", count: 38 },
    { day: "Mié", count: 45 },
    { day: "Jue", count: 41 },
    { day: "Vie", count: 48 },
    { day: "Sáb", count: 35 },
    { day: "Dom", count: 28 },
  ]

  // Sort attendances by date (most recent first)
  const sortedAttendances = [...attendances].sort((a, b) => b.date.getTime() - a.date.getTime())

  return (
    <div className="flex flex-col">
      <Header title="Asistencias" description="Control de acceso al gimnasio" />

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Check-in Scanner */}
          <CheckInScanner onCheckIn={handleCheckIn} />

          {/* Weekly Chart */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-white">Asistencias Semanales</CardTitle>
              <p className="text-sm text-muted-foreground">Últimos 7 días</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis dataKey="day" stroke="#a3a3a3" />
                  <YAxis stroke="#a3a3a3" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#171717", border: "1px solid #404040" }}
                    labelStyle={{ color: "#ffffff" }}
                  />
                  <Bar dataKey="count" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Attendance History */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">Historial de Asistencias</CardTitle>
            <p className="text-sm text-muted-foreground">Registro completo de entradas</p>
          </CardHeader>
          <CardContent>
            <AttendanceTable attendances={sortedAttendances} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
