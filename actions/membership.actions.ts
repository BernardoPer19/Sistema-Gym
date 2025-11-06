"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const membershipSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  price: z.number().positive("El precio debe ser mayor a 0"),
  duration: z.number().positive("La duración debe ser mayor a 0"),
  features: z.array(z.string()).min(1, "Debe incluir al menos una característica"),
  description: z.string().min(1, "La descripción es requerida"),
});

export type MembershipFormData = z.infer<typeof membershipSchema>

export async function getMemberships() {
  try {
    const memberships = await prisma.membership.findMany({
      orderBy: {
        createdAt: "desc", // opcional: ordenar por fecha de creación
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
    };
  }
}

// Obtener una membresía por ID
export async function getMembershipById(id: string) {
  try {
    const membership = await prisma.membership.findUnique({
      where: { id },
    });

    if (!membership) {
      return {
        success: false,
        error: "Membresía no encontrada",
      };
    }

    return {
      success: true,
      data: membership,
    };
  } catch (error) {
    console.error("Error fetching membership by ID:", error);
    return {
      success: false,
      error: "Error al obtener la membresía",
    };
  }
}

export async function createMembership(data: MembershipFormData) {
  try {
    // Validar datos
    const validatedData = membershipSchema.parse(data);

    // Crear membresía en la base de datos
    const membership = await prisma.membership.create({
      data: validatedData,
    });

    // Revalidar la página para mostrar los cambios
    revalidatePath("/membresias");

    return {
      success: true,
      data: membership,
      message: "Membresía creada exitosamente",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    console.error("Error creating membership:", error);
    return {
      success: false,
      error: "Error al crear la membresía",
    };
  }
}

export async function updateMembership(id: string, data: MembershipFormData) {
  try {
    const validatedData = membershipSchema.parse(data);

    const membership = await prisma.membership.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath("/membresias");

    return {
      success: true,
      data: membership,
      message: "Membresía actualizada exitosamente",
    };
  } catch (error) {
    console.error("Error updating membership:", error);
    return {
      success: false,
      error: "Error al actualizar la membresía",
    };
  }
}

export async function deleteMembership(id: string) {
  try {
    // Verificar si hay miembros activos con esta membresía
    const activeMembersCount = await prisma.member.count({
      where: {
        membershipId: id,
        status: "active",
      },
    });

    if (activeMembersCount > 0) {
      return {
        success: false,
        error: `No se puede eliminar. Hay ${activeMembersCount} miembro(s) activo(s) con esta membresía`,
      };
    }

    await prisma.membership.delete({
      where: { id },
    });

    revalidatePath("/membresias");

    return {
      success: true,
      message: "Membresía eliminada exitosamente",
    };
  } catch (error) {
    console.error("Error deleting membership:", error);
    return {
      success: false,
      error: "Error al eliminar la membresía",
    };
  }
}