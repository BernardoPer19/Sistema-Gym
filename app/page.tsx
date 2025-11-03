import React from "react";
import { Header } from "@/components/layout/header";
import { MetricCard } from "@/components/shared/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, AlertTriangle, TrendingUp, UserPlus, CheckCircle } from "lucide-react";
import { getActiveMembers, getExpiringMembers, activities } from "@/lib/mock-data";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { RevenueMembers } from "@/components/charts/RevenueMembers";

export default function DashboardPage() {
  const activeMembers = getActiveMembers();
  const expiringMembers = getExpiringMembers();

  return (
    <div className="flex flex-col">
      <Header title="Dashboard" description="Vista general del gimnasio" />

      <div className="flex-1 space-y-6 p-6">
        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Ingresos Mensuales"
            value={`$${activeMembers.length}`} // Ajustar si quieres mostrar $real
            icon={DollarSign}
            trend={{ value: "12.5%", positive: true }}
          />
          <MetricCard
            title="Socios Activos"
            value={activeMembers.length}
            icon={Users}
            trend={{ value: "8.2%", positive: true }}
          />
          <MetricCard
            title="Membresías por Vencer"
            value={expiringMembers.length}
            icon={AlertTriangle}
          />
          <MetricCard
            title="Asistencias Hoy"
            value={45}
            icon={TrendingUp}
            trend={{ value: "5.1%", positive: true }}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-white">Ingresos Mensuales</CardTitle>
            </CardHeader>
            <RevenueChart />
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-white">Distribución de Membresías</CardTitle>
            </CardHeader>
            <RevenueMembers />
          </Card>
        </div>

        {/* Activity Feed */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = activity.icon === "user-plus"
                  ? UserPlus
                  : activity.icon === "dollar-sign"
                  ? DollarSign
                  : activity.icon === "alert-triangle"
                  ? AlertTriangle
                  : CheckCircle;

                return (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.date.toLocaleString("es-MX", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
