"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const memberSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido").optional(),
  phone: z.string().min(1, "El teléfono es requerido"),
  membershipId: z.string().min(1, "Debe seleccionar una membresía"),
  birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
});

export type MemberFormData = z.infer<typeof memberSchema>;

// Función auxiliar para generar código QR único
function generateQRCode(memberId: string, name: string, birthDate: string): string {
  const normalizedName = name.toUpperCase().replace(/\s+/g, "_");
  return `${normalizedName}-${birthDate}-${memberId}`;
}

// Función auxiliar para generar número de factura único
function generateInvoiceNumber(): string {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${timestamp}-${random}`;
}

/**
 * Crear un nuevo miembro
 * - Crea el miembro
 * - Genera el código QR
 * - Crea el pago inicial
 * - Todo en una transacción
 */
export async function createMember(data: MemberFormData) {
  try {
    const validatedData = memberSchema.parse(data);

    const result = await prisma.$transaction(async (tx) => {
      // Obtener información de la membresía
      const membership = await tx.membership.findUnique({
        where: { id: validatedData.membershipId },
      });

      if (!membership) {
        throw new Error("Membresía no encontrada");
      }

      // Calcular fecha de vencimiento
      const joinDate = new Date();
      const expiryDate = new Date(joinDate);
      expiryDate.setDate(expiryDate.getDate() + membership.duration);

      // Crear el miembro
      const member = await tx.member.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          membershipId: validatedData.membershipId,
          birthDate: new Date(validatedData.birthDate),
          status: "active",
          joinDate,
          expiryDate,
          qrCode: "", // Se generará después
        },
      });

      // Generar y actualizar el código QR
      const qrCode = generateQRCode(
        member.id,
        member.name,
        validatedData.birthDate
      );

      await tx.member.update({
        where: { id: member.id },
        data: { qrCode },
      });

      // Crear el pago inicial
      await tx.payment.create({
        data: {
          memberId: member.id,
          amount: membership.price,
          date: new Date(),
          status: "paid",
          invoiceNumber: generateInvoiceNumber(),
          membershipName: membership.name,
        },
      });

      return { ...member, qrCode };
    });

    revalidatePath("/socios");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: result,
      message: "Miembro creado exitosamente",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    console.error("Error creating member:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al crear el miembro",
    };
  }
}

/**
 * Actualizar un miembro existente
 */
export async function updateMember(id: string, data: MemberFormData) {
  try {
    const validatedData = memberSchema.parse(data);

    const member = await prisma.member.findUnique({
      where: { id },
    });

    if (!member) {
      return {
        success: false,
        error: "Miembro no encontrado",
      };
    }

    // Si cambió la membresía, recalcular fecha de vencimiento
    let updateData: any = {
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      birthDate: new Date(validatedData.birthDate),
    };

    if (validatedData.membershipId !== member.membershipId) {
      const membership = await prisma.membership.findUnique({
        where: { id: validatedData.membershipId },
      });

      if (membership) {
        const newExpiryDate = new Date();
        newExpiryDate.setDate(newExpiryDate.getDate() + membership.duration);
        
        updateData.membershipId = validatedData.membershipId;
        updateData.expiryDate = newExpiryDate;
      }
    }

    // Regenerar QR si cambió el nombre o fecha de nacimiento
    if (
      validatedData.name !== member.name ||
      validatedData.birthDate !== member.birthDate.toISOString().split('T')[0]
    ) {
      updateData.qrCode = generateQRCode(
        id,
        validatedData.name,
        validatedData.birthDate
      );
    }

    const updatedMember = await prisma.member.update({
      where: { id },
      data: updateData,
      include: {
        membership: true,
      },
    });

    revalidatePath("/socios");
    revalidatePath(`/socios/${id}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      data: updatedMember,
      message: "Miembro actualizado exitosamente",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    console.error("Error updating member:", error);
    return {
      success: false,
      error: "Error al actualizar el miembro",
    };
  }
}

/**
 * Eliminar un miembro
 * - Elimina asistencias relacionadas
 * - Elimina pagos relacionados
 * - Elimina el miembro
 */
export async function deleteMember(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      // Eliminar asistencias
      await tx.attendance.deleteMany({
        where: { memberId: id },
      });

      // Eliminar pagos
      await tx.payment.deleteMany({
        where: { memberId: id },
      });

      // Eliminar miembro
      await tx.member.delete({
        where: { id },
      });
    });

    revalidatePath("/socios");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Miembro eliminado exitosamente",
    };
  } catch (error) {
    console.error("Error deleting member:", error);
    return {
      success: false,
      error: "Error al eliminar el miembro",
    };
  }
}

/**
 * Obtener un miembro por ID con todas sus relaciones
 */
export async function getMemberById(id: string) {
  try {
    const member = await prisma.member.findUnique({
      where: { id },
      include: {
        membership: true,
        payments: {
          orderBy: { date: "desc" },
        },
        attendances: {
          orderBy: { date: "desc" },
          take: 10,
        },
      },
    });

    if (!member) {
      return {
        success: false,
        error: "Miembro no encontrado",
      };
    }

    return {
      success: true,
      data: member,
    };
  } catch (error) {
    console.error("Error fetching member:", error);
    return {
      success: false,
      error: "Error al obtener el miembro",
    };
  }
}

/**
 * Obtener todos los miembros con sus membresías
 */
export async function getAllMembers() {
  try {
    const members = await prisma.member.findMany({
      include: {
        membership: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return {
      success: true,
      data: members,
    };
  } catch (error) {
    console.error("Error fetching members:", error);
    return {
      success: false,
      error: "Error al obtener los miembros",
      data: [],
    };
  }
}

/**
 * Obtener todas las membresías disponibles
 */
export async function getAllMemberships() {
  try {
    const memberships = await prisma.membership.findMany({
      orderBy: {
        price: "asc",
      },
    });

    return {
      success: true,
      data: memberships,
    };
  } catch (error) {
    console.error("Error fetching memberships:", error);
    return {
      success: false,
      error: "Error al obtener las membresías",
      data: [],
    };
  }
}

/**
 * Cambiar el estado de un miembro
 */
export async function updateMemberStatus(
  id: string,
  status: "active" | "inactive" | "expired"
) {
  try {
    const member = await prisma.member.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/socios");
    revalidatePath(`/socios/${id}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      data: member,
      message: "Estado actualizado exitosamente",
    };
  } catch (error) {
    console.error("Error updating member status:", error);
    return {
      success: false,
      error: "Error al actualizar el estado",
    };
  }
}

/**
 * Renovar membresía de un miembro
 * - Crea un nuevo pago
 * - Actualiza la fecha de vencimiento
 * - Cambia el estado a activo
 */
export async function renewMembership(memberId: string, membershipId?: string) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const member = await tx.member.findUnique({
        where: { id: memberId },
        include: { membership: true },
      });

      if (!member) {
        throw new Error("Miembro no encontrado");
      }

      // Si se especifica una nueva membresía, usarla; si no, usar la actual
      const targetMembershipId = membershipId || member.membershipId;
      
      const membership = await tx.membership.findUnique({
        where: { id: targetMembershipId },
      });

      if (!membership) {
        throw new Error("Membresía no encontrada");
      }

      // Calcular nueva fecha de vencimiento
      const today = new Date();
      const currentExpiry = new Date(member.expiryDate);
      
      // Si la membresía está vencida, empezar desde hoy
      // Si no, extender desde la fecha de vencimiento actual
      const startDate = currentExpiry > today ? currentExpiry : today;
      const newExpiryDate = new Date(startDate);
      newExpiryDate.setDate(newExpiryDate.getDate() + membership.duration);

      // Actualizar miembro
      const updatedMember = await tx.member.update({
        where: { id: memberId },
        data: {
          expiryDate: newExpiryDate,
          status: "active",
          membershipId: targetMembershipId,
        },
      });

      // Crear pago
      await tx.payment.create({
        data: {
          memberId,
          amount: membership.price,
          date: new Date(),
          status: "paid",
          invoiceNumber: generateInvoiceNumber(),
          membershipName: membership.name,
        },
      });

      return updatedMember;
    });

    revalidatePath("/socios");
    revalidatePath(`/socios/${memberId}`);
    revalidatePath("/dashboard");
    revalidatePath("/membresias");

    return {
      success: true,
      data: result,
      message: "Membresía renovada exitosamente",
    };
  } catch (error) {
    console.error("Error renewing membership:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al renovar la membresía",
    };
  }
}

/**
 * Obtener miembros que vencen próximamente
 */
export async function getExpiringMembers(days: number = 7) {
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const members = await prisma.member.findMany({
      where: {
        status: "active",
        expiryDate: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      include: {
        membership: true,
      },
      orderBy: {
        expiryDate: "asc",
      },
    });

    return {
      success: true,
      data: members,
    };
  } catch (error) {
    console.error("Error fetching expiring members:", error);
    return {
      success: false,
      error: "Error al obtener miembros por vencer",
      data: [],
    };
  }
}