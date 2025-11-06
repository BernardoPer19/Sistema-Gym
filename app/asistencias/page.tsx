"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { CheckInScanner } from "@/components/asistencias/check-in-scanner";
import { AttendanceTable } from "@/components/asistencias/attendance-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Attendance } from "@/lib/types/types";
import {
  markAttendance,
  getAllAttendances,
  getAttendanceStats,
  getWeeklyAttendanceData,
} from "@/actions/attendance.actions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AsistenciasPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
  });
  const [weeklyData, setWeeklyData] = useState([
    { day: "Lun", count: 0 },
    { day: "Mar", count: 0 },
    { day: "Mié", count: 0 },
    { day: "Jue", count: 0 },
    { day: "Vie", count: 0 },
    { day: "Sáb", count: 0 },
    { day: "Dom", count: 0 },
  ]);

  // Cargar asistencias al montar el componente
  useEffect(() => {
    loadAttendances();
    loadStats();
    loadWeeklyData();
  }, []);

  const loadAttendances = async () => {
    try {
      setLoading(true);
      const result = await getAllAttendances();
      if (result.success && result.data) {
        // Convertir fechas de string a Date si es necesario
        const attendancesWithDates = result.data.map((attendance) => ({
          ...attendance,
          date:
            attendance.date instanceof Date
              ? attendance.date
              : new Date(attendance.date),
        }));
        setAttendances(attendancesWithDates);
      }
    } catch (error) {
      console.error("Error loading attendances:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await getAttendanceStats();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadWeeklyData = async () => {
    try {
      const result = await getWeeklyAttendanceData();
      if (result.success && result.data) {
        setWeeklyData(result.data);
      }
    } catch (error) {
      console.error("Error loading weekly data:", error);
    }
  };

  const handleCheckIn = async (code: string) => {
    const result = await markAttendance(code);

    if (result.success && result.attendance) {
      // Convertir fecha de string a Date si es necesario
      const newAttendance = {
        ...result.attendance,
        date:
          result.attendance.date instanceof Date
            ? result.attendance.date
            : new Date(result.attendance.date),
      };
      // Agregar la nueva asistencia al estado
      setAttendances((prev) => [newAttendance, ...prev]);
      // Actualizar estadísticas y datos semanales
      loadStats();
      loadWeeklyData();
    }

    return {
      success: result.success,
      member: result.member,
      message: result.message,
    };
  };

  return (
    <div className="flex flex-col">
      <Header title="Asistencias" description="Control de acceso al gimnasio" />

      <div className="flex-1 space-y-6 p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Check-in Scanner */}
          <CheckInScanner onCheckIn={handleCheckIn} stats={stats} />

          {/* Weekly Chart */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-white">
                Asistencias Semanales
              </CardTitle>
              <p className="text-sm text-muted-foreground">Últimos 7 días</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                  <XAxis dataKey="day" stroke="#a3a3a3" />
                  <YAxis stroke="#a3a3a3" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#171717",
                      border: "1px solid #404040",
                    }}
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
            <CardTitle className="text-white">
              Historial de Asistencias
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Registro completo de entradas
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Cargando asistencias...</p>
              </div>
            ) : (
              <AttendanceTable attendances={attendances} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
