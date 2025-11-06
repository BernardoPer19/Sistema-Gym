"use server";

import { prisma } from "@/lib/prisma";

// ==================== DASHBOARD STATS ====================

/**
 * Obtener estadísticas del dashboard
 */
export async function getDashboardStats() {
  try {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Fecha para membresías por vencer (próximos 7 días)
    const expiringDate = new Date(now);
    expiringDate.setDate(expiringDate.getDate() + 7);

    const [
      monthlyRevenue,
      activeMembers,
      expiringMembers,
      todayAttendances,
    ] = await Promise.all([
      // Ingresos mensuales (pagos del mes actual con status "paid")
      prisma.payment.aggregate({
        where: {
          date: {
            gte: monthStart,
            lte: monthEnd,
          },
          status: "paid",
        },
        _sum: {
          amount: true,
        },
      }),
      // Socios activos
      prisma.member.count({
        where: {
          status: "active",
        },
      }),
      // Membresías por vencer (próximos 7 días)
      prisma.member.count({
        where: {
          status: "active",
          expiryDate: {
            gte: now,
            lte: expiringDate,
          },
        },
      }),
      // Asistencias hoy
      prisma.attendance.count({
        where: {
          date: {
            gte: todayStart,
            lte: todayEnd,
          },
          status: "allowed",
        },
      }),
    ]);

    // Calcular crecimiento (comparar con mes anterior)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const lastMonthRevenue = await prisma.payment.aggregate({
      where: {
        date: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
        status: "paid",
      },
      _sum: {
        amount: true,
      },
    });

    const currentRevenue = monthlyRevenue._sum.amount || 0;
    const previousRevenue = lastMonthRevenue._sum.amount || 0;
    const revenueGrowth = previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    // Crecimiento de socios activos
    const lastMonthActiveMembers = await prisma.member.count({
      where: {
        status: "active",
        joinDate: {
          lte: lastMonthEnd,
        },
      },
    });

    const membersGrowth = lastMonthActiveMembers > 0
      ? ((activeMembers - lastMonthActiveMembers) / lastMonthActiveMembers) * 100
      : 0;

    // Crecimiento de asistencias (comparar con ayer)
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const yesterdayEnd = new Date(todayEnd);
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);

    const yesterdayAttendances = await prisma.attendance.count({
      where: {
        date: {
          gte: yesterdayStart,
          lte: yesterdayEnd,
        },
        status: "allowed",
      },
    });

    const attendanceGrowth = yesterdayAttendances > 0
      ? ((todayAttendances - yesterdayAttendances) / yesterdayAttendances) * 100
      : 0;

    return {
      success: true,
      data: {
        monthlyRevenue: currentRevenue,
        activeMembers,
        expiringMembers,
        todayAttendances,
        revenueGrowth: revenueGrowth.toFixed(1),
        membersGrowth: membersGrowth.toFixed(1),
        attendanceGrowth: attendanceGrowth.toFixed(1),
      },
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return {
      success: false,
      error: "Error al obtener las estadísticas",
      data: {
        monthlyRevenue: 0,
        activeMembers: 0,
        expiringMembers: 0,
        todayAttendances: 0,
        revenueGrowth: "0",
        membersGrowth: "0",
        attendanceGrowth: "0",
      },
    };
  }
}

/**
 * Obtener ingresos mensuales de los últimos 6 meses
 */
export async function getMonthlyRevenueData() {
  try {
    const now = new Date();
    const months = [];
    
    // Obtener datos de los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      
      const [revenue, members] = await Promise.all([
        prisma.payment.aggregate({
          where: {
            date: {
              gte: monthStart,
              lte: monthEnd,
            },
            status: "paid",
          },
          _sum: {
            amount: true,
          },
        }),
        prisma.member.count({
          where: {
            joinDate: {
              lte: monthEnd,
            },
            status: "active",
          },
        }),
      ]);

      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      months.push({
        month: monthNames[monthStart.getMonth()],
        revenue: revenue._sum.amount || 0,
        members,
      });
    }

    return {
      success: true,
      data: months,
    };
  } catch (error) {
    console.error("Error getting monthly revenue data:", error);
    return {
      success: false,
      error: "Error al obtener los ingresos mensuales",
      data: [],
    };
  }
}

/**
 * Obtener distribución de membresías
 */
export async function getMembershipDistribution() {
  try {
    const memberships = await prisma.membership.findMany({
      include: {
        members: {
          where: {
            status: "active",
          },
        },
      },
    });

    const distribution = memberships.map((membership) => {
      const activeCount = membership.members.length;
      return {
        name: membership.name,
        value: activeCount,
        revenue: activeCount * membership.price,
      };
    });

    return {
      success: true,
      data: distribution,
    };
  } catch (error) {
    console.error("Error getting membership distribution:", error);
    return {
      success: false,
      error: "Error al obtener la distribución de membresías",
      data: [],
    };
  }
}

/**
 * Obtener actividad reciente
 */
export async function getRecentActivity() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Obtener actividades recientes: nuevos miembros, pagos, asistencias destacadas
    const [recentMembers, recentPayments, recentAttendances] = await Promise.all([
      prisma.member.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      }),
      prisma.payment.findMany({
        where: {
          date: {
            gte: thirtyDaysAgo,
          },
          status: "paid",
        },
        orderBy: {
          date: "desc",
        },
        take: 5,
        include: {
          member: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.attendance.findMany({
        where: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
          status: "allowed",
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
        include: {
          member: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    // Combinar y ordenar todas las actividades
    const activities = [
      ...recentMembers.map((member) => ({
        id: `member-${member.id}`,
        type: "new_member" as const,
        description: `Nuevo socio: ${member.name}`,
        date: member.createdAt,
        icon: "user-plus" as const,
      })),
      ...recentPayments.map((payment) => ({
        id: `payment-${payment.id}`,
        type: "payment" as const,
        description: `Pago recibido de ${payment.member.name}: $${payment.amount.toLocaleString()}`,
        date: payment.date,
        icon: "dollar-sign" as const,
      })),
      ...recentAttendances.map((attendance) => ({
        id: `attendance-${attendance.id}`,
        type: "attendance" as const,
        description: `Asistencia registrada: ${attendance.member.name}`,
        date: attendance.createdAt,
        icon: "check-circle" as const,
      })),
    ];

    // Ordenar por fecha (más reciente primero) y tomar los 10 más recientes
    activities.sort((a, b) => b.date.getTime() - a.date.getTime());

    return {
      success: true,
      data: activities.slice(0, 10),
    };
  } catch (error) {
    console.error("Error getting recent activity:", error);
    return {
      success: false,
      error: "Error al obtener la actividad reciente",
      data: [],
    };
  }
}

// ==================== REPORTES STATS ====================

/**
 * Obtener estadísticas para la página de reportes
 */
export async function getReportsStats() {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalRevenue,
      activeMembers,
      totalAttendances,
    ] = await Promise.all([
      // Ingresos totales (todos los pagos con status "paid")
      prisma.payment.aggregate({
        where: {
          status: "paid",
        },
        _sum: {
          amount: true,
        },
      }),
      // Socios activos
      prisma.member.count({
        where: {
          status: "active",
        },
      }),
      // Total de asistencias en los últimos 30 días
      prisma.attendance.count({
        where: {
          date: {
            gte: thirtyDaysAgo,
          },
          status: "allowed",
        },
      }),
    ]);

    // Asistencia diaria promedio (últimos 30 días)
    const avgAttendancePerDay = Math.round(totalAttendances / 30);

    // Calcular tasa de crecimiento (comparar últimos 30 días con los 30 anteriores)
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const previousPeriodAttendances = await prisma.attendance.count({
      where: {
        date: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
        status: "allowed",
      },
    });

    const growthRate = previousPeriodAttendances > 0
      ? ((totalAttendances - previousPeriodAttendances) / previousPeriodAttendances) * 100
      : 0;

    return {
      success: true,
      data: {
        totalRevenue: totalRevenue._sum.amount || 0,
        activeMembers,
        avgAttendancePerDay,
        growthRate: growthRate.toFixed(1),
      },
    };
  } catch (error) {
    console.error("Error getting reports stats:", error);
    return {
      success: false,
      error: "Error al obtener las estadísticas de reportes",
      data: {
        totalRevenue: 0,
        activeMembers: 0,
        avgAttendancePerDay: 0,
        growthRate: "0",
      },
    };
  }
}

/**
 * Obtener datos de asistencias semanales (últimas 4 semanas)
 */
export async function getWeeklyAttendanceDataForReports() {
  try {
    const now = new Date();
    const weeks = [];

    // Obtener datos de las últimas 4 semanas
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7) - 6);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const count = await prisma.attendance.count({
        where: {
          date: {
            gte: weekStart,
            lte: weekEnd,
          },
          status: "allowed",
        },
      });

      weeks.push({
        week: `Sem ${4 - i}`,
        count,
      });
    }

    return {
      success: true,
      data: weeks,
    };
  } catch (error) {
    console.error("Error getting weekly attendance data for reports:", error);
    return {
      success: false,
      error: "Error al obtener los datos semanales",
      data: [],
    };
  }
}

