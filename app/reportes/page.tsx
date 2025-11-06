"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, Activity } from "lucide-react";

// Importamos los componentes cliente
import MonthlyRevenueChart from "@/components/charts/MonthlyRevenueChart";
import WeeklyAttendanceChart from "@/components/charts/WeeklyAttendanceChart";
import MembershipDistributionChart from "@/components/charts/MembershipDistributionChart";
import MembershipRevenueChart from "@/components/charts/MembershipRevenueChart";
import {
  getReportsStats,
  getMonthlyRevenueData,
  getMembershipDistribution,
  getWeeklyAttendanceDataForReports,
} from "@/actions/stats.actions";

export default function ReportesPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeMembers: 0,
    avgAttendancePerDay: 0,
    growthRate: "0",
  });
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [weeklyAttendance, setWeeklyAttendance] = useState<any[]>([]);
  const [membershipDistribution, setMembershipDistribution] = useState<any[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const COLORS = ["#ef4444", "#f97316", "#fb923c", "#fdba74"];

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const [statsResult, revenueResult, distributionResult, weeklyResult] =
        await Promise.all([
          getReportsStats(),
          getMonthlyRevenueData(),
          getMembershipDistribution(),
          getWeeklyAttendanceDataForReports(),
        ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      }
      if (revenueResult.success) {
        setMonthlyRevenue(revenueResult.data);
      }
      if (distributionResult.success) {
        setMembershipDistribution(distributionResult.data);
      }
      if (weeklyResult.success) {
        setWeeklyAttendance(weeklyResult.data);
      }
    } catch (error) {
      console.error("Error loading reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Header
        title="Reportes"
        description="Análisis y estadísticas del gimnasio"
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Tarjetas resumen */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ingresos Totales
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Socios Activos
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {stats.activeMembers}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Asistencia Diaria
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {stats.avgAttendancePerDay}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Crecimiento
                  </p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {stats.growthRate}%
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fila de gráficos 1 */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Cargando gráficos...</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Cargando gráficos...</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <MonthlyRevenueChart data={monthlyRevenue} />
              <WeeklyAttendanceChart data={weeklyAttendance} />
            </div>

            {/* Fila de gráficos 2 */}
            <div className="grid gap-6 md:grid-cols-2">
              <MembershipDistributionChart
                data={membershipDistribution}
                colors={COLORS}
              />
              <MembershipRevenueChart data={membershipDistribution} />
            </div>
          </>
        )}

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">Detalle de Membresías</CardTitle>
            <p className="text-sm text-muted-foreground">Resumen por plan</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Cargando detalles...</p>
              </div>
            ) : membershipDistribution.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  No hay membresías registradas
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {membershipDistribution.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="h-10 w-10 rounded-lg"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <div>
                        <p className="font-medium text-white">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.value} socios activos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-white">
                        ${item.revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ingresos mensuales
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
