import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { members, memberships, payments, attendances } from "@/lib/mock-data";

import { DollarSign, Users, TrendingUp, Activity } from "lucide-react";

// Importamos los componentes cliente
import MonthlyRevenueChart from "@/components/charts/MonthlyRevenueChart";
import WeeklyAttendanceChart from "@/components/charts/WeeklyAttendanceChart";
import MembershipDistributionChart from "@/components/charts/MembershipDistributionChart";
import MembershipRevenueChart from "@/components/charts/MembershipRevenueChart";

export default function ReportesPage() {
  // Datos simulados (mock)
  const monthlyRevenue = [
    { month: "Ene", revenue: 45000, members: 142 },
    { month: "Feb", revenue: 52000, members: 156 },
    { month: "Mar", revenue: 48000, members: 148 },
    { month: "Abr", revenue: 61000, members: 168 },
    { month: "May", revenue: 55000, members: 162 },
    { month: "Jun", revenue: 58000, members: 170 },
  ];

  const weeklyAttendance = [
    { week: "Sem 1", count: 287 },
    { week: "Sem 2", count: 312 },
    { week: "Sem 3", count: 298 },
    { week: "Sem 4", count: 325 },
  ];

  const membershipDistribution = memberships.map((membership) => ({
    name: membership.name,
    value: members.filter((m) => m.membershipId === membership.id).length,
    revenue:
      members.filter((m) => m.membershipId === membership.id).length *
      membership.price,
  }));

  const COLORS = ["#ef4444", "#f97316", "#fb923c", "#fdba74"];

  const totalRevenue = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const activeMembers = members.filter((m) => m.status === "active").length;
  const avgAttendancePerDay = Math.round(attendances.length / 30);
  const growthRate = 12.5;

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
                    ${totalRevenue.toLocaleString()}
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
                    {activeMembers}
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
                    {avgAttendancePerDay}
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
                    {growthRate}%
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
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">Detalle de Membresías</CardTitle>
            <p className="text-sm text-muted-foreground">Resumen por plan</p>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
