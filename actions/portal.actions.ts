"use server";

import { prisma } from "@/lib/prisma";

/**
 * Buscar miembro por código QR o ID
 */
export async function findMemberByCode(code: string) {
  try {
    // Primero intentar buscar por código QR
    let member = await prisma.member.findFirst({
      where: {
        qrCode: code,
      },
      include: {
        membership: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
            features: true,
            description: true,
          },
        },
      },
    });

    // Si no se encuentra por QR, intentar por ID
    if (!member) {
      member = await prisma.member.findUnique({
        where: {
          id: code,
        },
        include: {
          membership: {
            select: {
              id: true,
              name: true,
              price: true,
              duration: true,
              features: true,
              description: true,
            },
          },
        },
      });
    }

    if (!member) {
      return {
        success: false,
        error: "Miembro no encontrado",
        data: null,
      };
    }

    return {
      success: true,
      data: {
        id: member.id,
        name: member.name,
        email: member.email || "",
        phone: member.phone,
        membershipId: member.membershipId,
        status: member.status,
        joinDate: member.joinDate,
        expiryDate: member.expiryDate,
        birthDate: member.birthDate,
        qrCode: member.qrCode,
        photo: member.photo || undefined,
        membership: member.membership,
      },
    };
  } catch (error) {
    console.error("Error finding member by code:", error);
    return {
      success: false,
      error: "Error al buscar el miembro",
      data: null,
    };
  }
}

/**
 * Obtener pagos de un miembro
 */
export async function getMemberPayments(memberId: string) {
  try {
    const payments = await prisma.payment.findMany({
      where: {
        memberId,
      },
      orderBy: {
        date: "desc",
      },
    });

    return {
      success: true,
      data: payments.map((payment) => ({
        id: payment.id,
        memberId: payment.memberId,
        memberName: "", // Se puede obtener del member si es necesario
        amount: payment.amount,
        date: payment.date,
        status: payment.status,
        invoiceNumber: payment.invoiceNumber,
        membershipName: payment.membershipName,
      })),
    };
  } catch (error) {
    console.error("Error getting member payments:", error);
    return {
      success: false,
      error: "Error al obtener los pagos",
      data: [],
    };
  }
}

/**
 * Obtener asistencias de un miembro
 */
export async function getMemberAttendances(memberId: string) {
  try {
    const attendances = await prisma.attendance.findMany({
      where: {
        memberId,
      },
      orderBy: {
        date: "desc",
      },
      take: 50, // Limitar a las últimas 50 asistencias
    });

    return {
      success: true,
      data: attendances.map((attendance) => ({
        id: attendance.id,
        memberId: attendance.memberId,
        memberName: "", // Se puede obtener del member si es necesario
        date: attendance.date,
        time: attendance.time,
        status: attendance.status,
        attended: attendance.attended,
      })),
    };
  } catch (error) {
    console.error("Error getting member attendances:", error);
    return {
      success: false,
      error: "Error al obtener las asistencias",
      data: [],
    };
  }
}

