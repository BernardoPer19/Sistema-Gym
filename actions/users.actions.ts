// lib/actions/users.actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { hash, compare } from 'bcryptjs'
import { UserRole } from '@prisma/client'

// ==================== CREATE ====================

export async function createUser(data: {
  name: string
  email: string
  password: string
  role: UserRole
  memberId?: string
}) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    })

    if (existingUser) {
      return { success: false, error: 'El email ya está registrado' }
    }

    const hashedPassword = await hash(data.password, 12)

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
        memberId: data.memberId
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        memberId: true,
        createdAt: true
      }
    })

    revalidatePath('/dashboard/users')
    return { success: true, data: user }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'Error al crear el usuario' }
  }
}

// ==================== READ ====================

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        memberId: true,
        createdAt: true,
        updatedAt: true,
        notifications: {
          where: { read: false },
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: users }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { success: false, error: 'Error al obtener usuarios' }
  }
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        memberId: true,
        createdAt: true,
        updatedAt: true,
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    return { success: true, data: user }
  } catch (error) {
    console.error('Error fetching user:', error)
    return { success: false, error: 'Error al obtener el usuario' }
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        memberId: true
      }
    })

    return { success: true, data: user }
  } catch (error) {
    console.error('Error fetching user by email:', error)
    return { success: false, error: 'Error al obtener el usuario' }
  }
}

// ==================== UPDATE ====================

export async function updateUser(
  id: string,
  data: {
    name?: string
    email?: string
    role?: UserRole
    memberId?: string
  }
) {
  try {
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id }
        }
      })

      if (existingUser) {
        return { success: false, error: 'El email ya está en uso' }
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        memberId: true,
        updatedAt: true
      }
    })

    revalidatePath('/dashboard/users')
    revalidatePath(`/dashboard/users/${id}`)
    return { success: true, data: user }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: 'Error al actualizar el usuario' }
  }
}

export async function updateUserPassword(
  id: string,
  currentPassword: string,
  newPassword: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { password: true }
    })

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' }
    }

    const isValid = await compare(currentPassword, user.password)

    if (!isValid) {
      return { success: false, error: 'Contraseña actual incorrecta' }
    }

    const hashedPassword = await hash(newPassword, 12)

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    })

    return { success: true, message: 'Contraseña actualizada correctamente' }
  } catch (error) {
    console.error('Error updating password:', error)
    return { success: false, error: 'Error al actualizar la contraseña' }
  }
}

// ==================== DELETE ====================

export async function deleteUser(id: string) {
  try {
    // Usar transacción para eliminar usuario y sus notificaciones
    await prisma.$transaction(async (tx) => {
      // Eliminar notificaciones asociadas
      await tx.notification.deleteMany({
        where: { userId: id }
      })

      // Eliminar usuario
      await tx.user.delete({
        where: { id }
      })
    })

    revalidatePath('/dashboard/users')
    return { success: true, message: 'Usuario eliminado correctamente' }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Error al eliminar el usuario' }
  }
}

// ==================== AUTHENTICATION ====================

export async function verifyCredentials(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        memberId: true
      }
    })

    if (!user) {
      return { success: false, error: 'Credenciales inválidas' }
    }

    const isValid = await compare(password, user.password)

    if (!isValid) {
      return { success: false, error: 'Credenciales inválidas' }
    }

    // No retornar el password
    const { password: _, ...userWithoutPassword } = user

    return { success: true, data: userWithoutPassword }
  } catch (error) {
    console.error('Error verifying credentials:', error)
    return { success: false, error: 'Error al verificar credenciales' }
  }
}