"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

type AttendanceStatus = "allowed" | "denied";

// ==================== CREATE ====================

/**
 * Marcar asistencia de un miembro por su código QR
 * Valida si la membresía está activa y no vencida
 */
export async function markAttendance(qrCode: string) {
    try {
        // Buscar el miembro por su código QR
        const member = await prisma.member.findFirst({
            where: { qrCode },
            include: {
                membership: true,
            },
        });

        if (!member) {
            // No guardamos asistencia si el miembro no existe
            return {
                success: false,
                message: "Código no válido. Socio no encontrado.",
            };
        }

        // Validar estado de la membresía
        const now = new Date();
        const isExpired = new Date(member.expiryDate) < now;

        if (member.status === "expired" || isExpired) {
            // Actualizar estado si está vencida
            if (member.status !== "expired") {
                await prisma.member.update({
                    where: { id: member.id },
                    data: { status: "expired" },
                });
            }

            // Guardar asistencia denegada
            const deniedAttendance = await prisma.attendance.create({
                data: {
                    memberId: member.id,
                    date: now,
                    time: now.toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    status: "denied",
                    attended: false,
                },
            });

            revalidatePath("/asistencias");

            return {
                success: false,
                member: {
                    id: member.id,
                    name: member.name,
                    email: member.email || "",
                    phone: member.phone,
                    membershipId: member.membershipId,
                    status: "expired" as const,
                    joinDate: member.joinDate,
                    expiryDate: member.expiryDate,
                    birthDate: member.birthDate,
                    qrCode: member.qrCode,
                    photo: member.photo || undefined,
                },
                attendance: {
                    id: deniedAttendance.id,
                    memberId: deniedAttendance.memberId,
                    memberName: member.name,
                    date: deniedAttendance.date,
                    time: deniedAttendance.time,
                    status: deniedAttendance.status,
                    attended: deniedAttendance.attended,
                },
                message: "Membresía vencida. Por favor renueva tu membresía.",
            };
        }

        if (member.status === "inactive") {
            // Guardar asistencia denegada
            const deniedAttendance = await prisma.attendance.create({
                data: {
                    memberId: member.id,
                    date: now,
                    time: now.toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                    status: "denied",
                    attended: false,
                },
            });

            revalidatePath("/asistencias");

            return {
                success: false,
                member: {
                    id: member.id,
                    name: member.name,
                    email: member.email || "",
                    phone: member.phone,
                    membershipId: member.membershipId,
                    status: "inactive" as const,
                    joinDate: member.joinDate,
                    expiryDate: member.expiryDate,
                    birthDate: member.birthDate,
                    qrCode: member.qrCode,
                    photo: member.photo || undefined,
                },
                attendance: {
                    id: deniedAttendance.id,
                    memberId: deniedAttendance.memberId,
                    memberName: member.name,
                    date: deniedAttendance.date,
                    time: deniedAttendance.time,
                    status: deniedAttendance.status,
                    attended: deniedAttendance.attended,
                },
                message: "Membresía inactiva. Contacta a recepción.",
            };
        }

        // Si todo está bien, crear el registro de asistencia
        const attendance = await prisma.attendance.create({
            data: {
                memberId: member.id,
                date: now,
                time: now.toLocaleTimeString("es-MX", {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                status: "allowed",
                attended: true,
            },
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        status: true,
                        qrCode: true,
                        photo: true,
                    },
                },
            },
        });

        revalidatePath("/asistencias");

        return {
            success: true,
            member: {
                id: member.id,
                name: member.name,
                email: member.email || "",
                phone: member.phone,
                membershipId: member.membershipId,
                status: member.status as "active" | "inactive" | "expired",
                joinDate: member.joinDate,
                expiryDate: member.expiryDate,
                birthDate: member.birthDate,
                qrCode: member.qrCode,
                photo: member.photo || undefined,
            },
            attendance: {
                id: attendance.id,
                memberId: attendance.memberId,
                memberName: member.name,
                date: attendance.date,
                time: attendance.time,
                status: attendance.status,
                attended: attendance.attended,
            },
            message: `Bienvenido/a ${member.name} al gimnasio. Disfruta tu entrenamiento.`,
        };
    } catch (error) {
        console.error("Error marking attendance:", error);
        return {
            success: false,
            message: "Error al registrar la asistencia. Intenta nuevamente.",
        };
    }
}

// ==================== READ ====================

/**
 * Obtener todas las asistencias con información del miembro
 * Incluye tanto asistencias permitidas como denegadas
 */
export async function getAllAttendances() {
    try {
        const attendances = await prisma.attendance.findMany({
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        status: true,
                        qrCode: true,
                        photo: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            success: true,
            data: attendances.map((attendance: any) => ({
                id: attendance.id,
                memberId: attendance.memberId,
                memberName: attendance.member.name,
                date: attendance.date,
                time: attendance.time,
                status: attendance.status,
                attended: attendance.attended,
            })),
        };
    } catch (error) {
        console.error("Error getting attendances:", error);
        return {
            success: false,
            error: "Error al obtener las asistencias",
            data: [],
        };
    }
}

/**
 * Obtener asistencias por rango de fechas
 */
export async function getAttendancesByDateRange(
    startDate: Date,
    endDate: Date
) {
    try {
        const attendances = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        status: true,
                        qrCode: true,
                        photo: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            success: true,
            data: attendances.map((attendance: any) => ({
                id: attendance.id,
                memberId: attendance.memberId,
                memberName: attendance.member.name,
                date: attendance.date,
                time: attendance.time,
                status: attendance.status,
                attended: attendance.attended,
            })),
        };
    } catch (error) {
        console.error("Error getting attendances by date range:", error);
        return {
            success: false,
            error: "Error al obtener las asistencias",
            data: [],
        };
    }
}

/**
 * Obtener asistencias de un miembro específico
 */
export async function getAttendancesByMember(memberId: string) {
    try {
        const attendances = await prisma.attendance.findMany({
            where: {
                memberId,
            },
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        status: true,
                        qrCode: true,
                        photo: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            success: true,
            data: attendances.map((attendance: any) => ({
                id: attendance.id,
                memberId: attendance.memberId,
                memberName: attendance.member.name,
                date: attendance.date,
                time: attendance.time,
                status: attendance.status,
                attended: attendance.attended,
            })),
        };
    } catch (error) {
        console.error("Error getting attendances by member:", error);
        return {
            success: false,
            error: "Error al obtener las asistencias del miembro",
            data: [],
        };
    }
}

/**
 * Obtener una asistencia por ID
 */
export async function getAttendanceById(id: string) {
    try {
        const attendance = await prisma.attendance.findUnique({
            where: { id },
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        status: true,
                        qrCode: true,
                        photo: true,
                    },
                },
            },
        });

        if (!attendance) {
            return {
                success: false,
                error: "Asistencia no encontrada",
                data: null,
            };
        }

        return {
            success: true,
            data: {
                id: attendance.id,
                memberId: attendance.memberId,
                memberName: attendance.member.name,
                date: attendance.date,
                time: attendance.time,
                status: attendance.status,
                attended: attendance.attended,
            },
        };
    } catch (error) {
        console.error("Error getting attendance by id:", error);
        return {
            success: false,
            error: "Error al obtener la asistencia",
            data: null,
        };
    }
}

// ==================== UPDATE ====================

/**
 * Actualizar una asistencia
 */
export async function updateAttendance(
    id: string,
    data: {
        status?: AttendanceStatus;
        attended?: boolean;
        date?: Date;
        time?: string;
    }
) {
    try {
        const attendance = await prisma.attendance.update({
            where: { id },
            data: {
                ...(data.status && { status: data.status }),
                ...(data.attended !== undefined && { attended: data.attended }),
                ...(data.date && { date: data.date }),
                ...(data.time && { time: data.time }),
            },
            include: {
                member: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        status: true,
                        qrCode: true,
                        photo: true,
                    },
                },
            },
        });

        revalidatePath("/asistencias");

        return {
            success: true,
            data: {
                id: attendance.id,
                memberId: attendance.memberId,
                memberName: attendance.member.name,
                date: attendance.date,
                time: attendance.time,
                status: attendance.status,
                attended: attendance.attended,
            },
        };
    } catch (error) {
        console.error("Error updating attendance:", error);
        return {
            success: false,
            error: "Error al actualizar la asistencia",
        };
    }
}

// ==================== DELETE ====================

/**
 * Eliminar una asistencia
 */
export async function deleteAttendance(id: string) {
    try {
        await prisma.attendance.delete({
            where: { id },
        });

        revalidatePath("/asistencias");

        return {
            success: true,
            message: "Asistencia eliminada correctamente",
        };
    } catch (error) {
        console.error("Error deleting attendance:", error);
        return {
            success: false,
            error: "Error al eliminar la asistencia",
        };
    }
}

// ==================== STATISTICS ====================

/**
 * Obtener datos de asistencias semanales (últimos 7 días)
 * Agrupa las asistencias por día de la semana
 */
export async function getWeeklyAttendanceData() {
    try {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);

        // Obtener todas las asistencias de los últimos 7 días
        const attendances = await prisma.attendance.findMany({
            where: {
                date: {
                    gte: weekStart,
                },
                status: "allowed",
            },
            select: {
                date: true,
            },
        });

        // Nombres de los días en español
        const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

        // Inicializar contador para cada día de la semana
        const dayCounts: { [key: string]: number } = {};
        dayNames.forEach((day) => {
            dayCounts[day] = 0;
        });

        // Contar asistencias por día de la semana
        attendances.forEach((attendance: { date: Date }) => {
            const date = new Date(attendance.date);
            const dayOfWeek = date.getDay(); // 0 = Domingo, 1 = Lunes, etc.
            const dayName = dayNames[dayOfWeek];
            dayCounts[dayName]++;
        });

        // Crear array en el orden correcto (Lun, Mar, Mié, Jue, Vie, Sáb, Dom)
        // Pero vamos a mostrar los últimos 7 días desde hoy hacia atrás
        const weeklyData = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayOfWeek = date.getDay();
            const dayName = dayNames[dayOfWeek];

            // Contar asistencias de este día específico
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);

            const count = attendances.filter((att: { date: Date }) => {
                const attDate = new Date(att.date);
                return attDate >= dayStart && attDate <= dayEnd;
            }).length;

            weeklyData.push({
                day: dayName,
                count,
            });
        }

        return {
            success: true,
            data: weeklyData,
        };
    } catch (error) {
        console.error("Error getting weekly attendance data:", error);
        return {
            success: false,
            error: "Error al obtener los datos semanales",
            data: [
                { day: "Lun", count: 0 },
                { day: "Mar", count: 0 },
                { day: "Mié", count: 0 },
                { day: "Jue", count: 0 },
                { day: "Vie", count: 0 },
                { day: "Sáb", count: 0 },
                { day: "Dom", count: 0 },
            ],
        };
    }
}

/**
 * Obtener estadísticas de asistencias
 */
export async function getAttendanceStats() {
    try {
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 7);
        const monthStart = new Date(now);
        monthStart.setMonth(monthStart.getMonth() - 1);

        const [today, thisWeek, thisMonth] = await Promise.all([
            prisma.attendance.count({
                where: {
                    date: {
                        gte: todayStart,
                    },
                    status: "allowed",
                },
            }),
            prisma.attendance.count({
                where: {
                    date: {
                        gte: weekStart,
                    },
                    status: "allowed",
                },
            }),
            prisma.attendance.count({
                where: {
                    date: {
                        gte: monthStart,
                    },
                    status: "allowed",
                },
            }),
        ]);

        return {
            success: true,
            data: {
                today,
                thisWeek,
                thisMonth,
            },
        };
    } catch (error) {
        console.error("Error getting attendance stats:", error);
        return {
            success: false,
            error: "Error al obtener las estadísticas",
            data: {
                today: 0,
                thisWeek: 0,
                thisMonth: 0,
            },
        };
    }
}

