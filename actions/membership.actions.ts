"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const membershipSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  price: z.number().min(0, "El precio debe ser mayor a 0"),
  duration: z.number().min(1, "La duración debe ser mayor a 0"),
  features: z.array(z.string()).optional(),
  description: z.string().optional(),
});

export type MembershipFormData = z.infer<typeof membershipSchema>;

// ==================== CREATE ====================

export async function createMembership(data: MembershipFormData) {
  try {
    const validatedData = membershipSchema.parse(data);

    const membership = await prisma.membership.create({
      data: {
        name: validatedData.name,
        price: validatedData.price,
        duration: validatedData.duration,
        features: validatedData.features || [],
        description: validatedData.description || "",
      },
    });

    revalidatePath("/membresias");
    return { success: true, data: membership };
  } catch (error) {
    console.error("Error creating membership:", error);
    return {
      success: false,
      error: "Error al crear la membresía",
    };
  }
}

// ==================== READ ====================

export async function getMemberships() {
  try {
    const memberships = await prisma.membership.findMany({
      include: {
        members: {
          where: {
            status: "active",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Agregar el conteo de miembros activos a cada membresía
    const membershipsWithCount = memberships.map((membership) => ({
      ...membership,
      activeMembersCount: membership.members.length,
    }));

    return { success: true, data: membershipsWithCount };
  } catch (error) {
    console.error("Error getting memberships:", error);
    return {
      success: false,
      error: "Error al obtener las membresías",
      data: [],
    };
  }
}

export async function getMembershipById(id: string) {
  try {
    const membership = await prisma.membership.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!membership) {
      return {
        success: false,
        error: "Membresía no encontrada",
        data: null,
      };
    }

    return { success: true, data: membership };
  } catch (error) {
    console.error("Error getting membership:", error);
    return {
      success: false,
      error: "Error al obtener la membresía",
      data: null,
    };
  }
}

// ==================== UPDATE ====================

export async function updateMembership(
  id: string,
  data: Partial<MembershipFormData>
) {
  try {
    const membership = await prisma.membership.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.features && { features: data.features }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });

    revalidatePath("/membresias");
    return { success: true, data: membership };
  } catch (error) {
    console.error("Error updating membership:", error);
    return {
      success: false,
      error: "Error al actualizar la membresía",
    };
  }
}

// ==================== DELETE ====================

export async function deleteMembership(id: string) {
  try {
    // Verificar si hay miembros usando esta membresía
    const membersCount = await prisma.member.count({
      where: {
        membershipId: id,
      },
    });

    if (membersCount > 0) {
      return {
        success: false,
        error: `No se puede eliminar la membresía porque tiene ${membersCount} miembro(s) asociado(s)`,
      };
    }

    await prisma.membership.delete({
      where: { id },
    });

    revalidatePath("/membresias");
    return {
      success: true,
      message: "Membresía eliminada correctamente",
    };
  } catch (error) {
    console.error("Error deleting membership:", error);
    return {
      success: false,
      error: "Error al eliminar la membresía",
    };
  }
}

// ==================== MEMBERS EXPIRING ====================

/**
 * Obtener miembros próximos a vencer
 */
export async function getExpiringMembers(days: number = 7) {
  try {
    const now = new Date();
    const expiringDate = new Date(now);
    expiringDate.setDate(expiringDate.getDate() + days);

    const members = await prisma.member.findMany({
      where: {
        status: "active",
        expiryDate: {
          gte: now,
          lte: expiringDate,
        },
      },
      include: {
        membership: {
          select: {
            id: true,
            name: true,
            price: true,
            duration: true,
          },
        },
      },
      orderBy: {
        expiryDate: "asc",
      },
    });

    return {
      success: true,
      data: members.map((member) => ({
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
      })),
    };
  } catch (error) {
    console.error("Error getting expiring members:", error);
    return {
      success: false,
      error: "Error al obtener los miembros próximos a vencer",
      data: [],
    };
  }
}

// ==================== PAYMENTS ====================

/**
 * Obtener pagos recientes (últimos 30 días)
 */
export async function getRecentPayments(days: number = 30) {
  try {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    const payments = await prisma.payment.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
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
        memberName: payment.member.name,
        amount: payment.amount,
        date: payment.date,
        status: payment.status,
        invoiceNumber: payment.invoiceNumber,
        membershipName: payment.membershipName,
      })),
    };
  } catch (error) {
    console.error("Error getting recent payments:", error);
    return {
      success: false,
      error: "Error al obtener los pagos",
      data: [],
    };
  }
}

/**
 * Obtener un pago por ID con información completa
 */
export async function getPaymentById(id: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            qrCode: true,
          },
        },
      },
    });

    if (!payment) {
      return {
        success: false,
        error: "Pago no encontrado",
        data: null,
      };
    }

    return {
      success: true,
      data: {
        id: payment.id,
        memberId: payment.memberId,
        memberName: payment.member.name,
        memberEmail: payment.member.email,
        memberPhone: payment.member.phone,
        amount: payment.amount,
        date: payment.date,
        status: payment.status,
        invoiceNumber: payment.invoiceNumber,
        membershipName: payment.membershipName,
      },
    };
  } catch (error) {
    console.error("Error getting payment by id:", error);
    return {
      success: false,
      error: "Error al obtener el pago",
      data: null,
    };
  }
}
