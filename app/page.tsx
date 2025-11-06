"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { MetricCard } from "@/components/shared/metric-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
  UserPlus,
  CheckCircle,
} from "lucide-react";
import {
  getDashboardStats,
  getMonthlyRevenueData,
  getMembershipDistribution,
  getRecentActivity,
} from "@/actions/stats.actions";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { RevenueMembers } from "@/components/charts/RevenueMembers";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    monthlyRevenue: 0,
    activeMembers: 0,
    expiringMembers: 0,
    todayAttendances: 0,
    revenueGrowth: "0",
    membersGrowth: "0",
    attendanceGrowth: "0",
  });
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<any[]>([]);
  const [membershipDistribution, setMembershipDistribution] = useState<any[]>(
    []
  );
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResult, revenueResult, distributionResult, activityResult] =
        await Promise.all([
          getDashboardStats(),
          getMonthlyRevenueData(),
          getMembershipDistribution(),
          getRecentActivity(),
        ]);

      if (statsResult.success) {
        setStats(statsResult.data);
      }
      if (revenueResult.success) {
        setMonthlyRevenueData(revenueResult.data);
      }
      if (distributionResult.success) {
        setMembershipDistribution(distributionResult.data);
      }
      if (activityResult.success) {
        setActivities(activityResult.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Header title="Dashboard" description="Vista general del gimnasio" />

      <div className="flex-1 space-y-6 p-6">
        {/* Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Ingresos Mensuales"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend={{
              value: `${stats.revenueGrowth}%`,
              positive: parseFloat(stats.revenueGrowth) >= 0,
            }}
          />
          <MetricCard
            title="Socios Activos"
            value={stats.activeMembers}
            icon={Users}
            trend={{
              value: `${stats.membersGrowth}%`,
              positive: parseFloat(stats.membersGrowth) >= 0,
            }}
          />
          <MetricCard
            title="Membresías por Vencer"
            value={stats.expiringMembers}
            icon={AlertTriangle}
          />
          <MetricCard
            title="Asistencias Hoy"
            value={stats.todayAttendances}
            icon={TrendingUp}
            trend={{
              value: `${stats.attendanceGrowth}%`,
              positive: parseFloat(stats.attendanceGrowth) >= 0,
            }}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-white">Ingresos Mensuales</CardTitle>
            </CardHeader>
            <RevenueChart data={monthlyRevenueData} />
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-white">
                Distribución de Membresías
              </CardTitle>
            </CardHeader>
            <RevenueMembers data={membershipDistribution} />
          </Card>
        </div>

        {/* Activity Feed */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-white">Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Cargando actividad...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">
                  No hay actividad reciente
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => {
                  const Icon =
                    activity.icon === "user-plus"
                      ? UserPlus
                      : activity.icon === "dollar-sign"
                      ? DollarSign
                      : activity.icon === "alert-triangle"
                      ? AlertTriangle
                      : CheckCircle;

                  const activityDate =
                    activity.date instanceof Date
                      ? activity.date
                      : new Date(activity.date);

                  return (
                    <div key={activity.id} className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activityDate.toLocaleString("es-MX", {
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
