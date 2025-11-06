// lib/actions/messages.actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { MessageType, MessageStatus } from '@prisma/client'

// ==================== CREATE ====================

export async function createMessage(data: {
  type: MessageType
  recipient: string
  content: string
  status?: MessageStatus
  date?: Date
}) {
  try {
    const message = await prisma.message.create({
      data: {
        type: data.type,
        recipient: data.recipient,
        content: data.content,
        status: data.status || 'pending',
        date: data.date || new Date()
      }
    })

    revalidatePath('/dashboard/messages')
    return { success: true, data: message }
  } catch (error) {
    console.error('Error creating message:', error)
    return { success: false, error: 'Error al crear el mensaje' }
  }
}

// Enviar mensaje de renovación a miembros próximos a vencer
export async function sendRenewalReminders() {
  try {
    const today = new Date()
    const inSevenDays = new Date(today)
    inSevenDays.setDate(today.getDate() + 7)

    // Buscar miembros que expiran en 7 días
    const expiringMembers = await prisma.member.findMany({
      where: {
        status: 'active',
        expiryDate: {
          gte: today,
          lte: inSevenDays
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        expiryDate: true,
        membership: {
          select: {
            name: true
          }
        }
      }
    })

    const messages = await prisma.$transaction(
      expiringMembers.map(member => {
        const daysLeft = Math.ceil(
          (member.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        )

        const content = `Hola ${member.name}, tu membresía ${member.membership.name} vence en ${daysLeft} días. Renueva pronto para seguir disfrutando de nuestros servicios.`

        return prisma.message.create({
          data: {
            type: 'renewal',
            recipient: member.email,
            content,
            status: 'pending',
            date: new Date()
          }
        })
      })
    )

    revalidatePath('/dashboard/messages')
    return { 
      success: true, 
      data: messages,
      count: messages.length,
      message: `${messages.length} recordatorios de renovación creados`
    }
  } catch (error) {
    console.error('Error sending renewal reminders:', error)
    return { success: false, error: 'Error al enviar recordatorios de renovación' }
  }
}

// Enviar mensajes de cumpleaños
export async function sendBirthdayMessages() {
  try {
    const today = new Date()
    const currentMonth = today.getMonth() + 1
    const currentDay = today.getDate()

    // Buscar miembros con cumpleaños hoy
    const members = await prisma.member.findMany({
      where: {
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        email: true,
        birthDate: true
      }
    })

    const birthdayMembers = members.filter(member => {
      const birthDate = new Date(member.birthDate)
      return (
        birthDate.getMonth() + 1 === currentMonth &&
        birthDate.getDate() === currentDay
      )
    })

    const messages = await prisma.$transaction(
      birthdayMembers.map(member => {
        const content = `¡Feliz cumpleaños ${member.name}! 🎉 Todo el equipo te desea un día maravilloso. Disfruta de un día especial en el gimnasio.`

        return prisma.message.create({
          data: {
            type: 'birthday',
            recipient: member.email,
            content,
            status: 'pending',
            date: new Date()
          }
        })
      })
    )

    revalidatePath('/dashboard/messages')
    return { 
      success: true, 
      data: messages,
      count: messages.length,
      message: `${messages.length} mensajes de cumpleaños creados`
    }
  } catch (error) {
    console.error('Error sending birthday messages:', error)
    return { success: false, error: 'Error al enviar mensajes de cumpleaños' }
  }
}

// Enviar recordatorio de pago
export async function sendPaymentReminders() {
  try {
    // Buscar pagos pendientes o vencidos
    const overduePayments = await prisma.payment.findMany({
      where: {
        OR: [
          { status: 'pending' },
          { status: 'overdue' }
        ]
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      distinct: ['memberId']
    })

    const messages = await prisma.$transaction(
      overduePayments.map(payment => {
        const content = `Hola ${payment.member.name}, tienes un pago pendiente de $${payment.amount} correspondiente a ${payment.membershipName}. Por favor, regulariza tu situación.`

        return prisma.message.create({
          data: {
            type: 'payment_reminder',
            recipient: payment.member.email,
            content,
            status: 'pending',
            date: new Date()
          }
        })
      })
    )

    revalidatePath('/dashboard/messages')
    return { 
      success: true, 
      data: messages,
      count: messages.length,
      message: `${messages.length} recordatorios de pago creados`
    }
  } catch (error) {
    console.error('Error sending payment reminders:', error)
    return { success: false, error: 'Error al enviar recordatorios de pago' }
  }
}

// Enviar mensaje personalizado a múltiples destinatarios
export async function sendBulkMessage(data: {
  type: MessageType
  recipients: string[]
  content: string
}) {
  try {
    const messages = await prisma.$transaction(
      data.recipients.map(recipient =>
        prisma.message.create({
          data: {
            type: data.type,
            recipient,
            content: data.content,
            status: 'pending',
            date: new Date()
          }
        })
      )
    )

    revalidatePath('/dashboard/messages')
    return { 
      success: true, 
      data: messages,
      count: messages.length,
      message: `${messages.length} mensajes creados`
    }
  } catch (error) {
    console.error('Error sending bulk message:', error)
    return { success: false, error: 'Error al enviar mensajes masivos' }
  }
}

// ==================== READ ====================

export async function getMessages(filters?: {
  type?: MessageType
  status?: MessageStatus
  startDate?: Date
  endDate?: Date
}) {
  try {
    const where: any = {}

    if (filters?.type) {
      where.type = filters.type
    }

    if (filters?.status) {
      where.status = filters.status
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {}
      if (filters.startDate) {
        where.date.gte = filters.startDate
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate
      }
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { date: 'desc' }
    })

    return { success: true, data: messages }
  } catch (error) {
    console.error('Error fetching messages:', error)
    return { success: false, error: 'Error al obtener mensajes' }
  }
}

export async function getMessageById(id: string) {
  try {
    const message = await prisma.message.findUnique({
      where: { id }
    })

    if (!message) {
      return { success: false, error: 'Mensaje no encontrado' }
    }

    return { success: true, data: message }
  } catch (error) {
    console.error('Error fetching message:', error)
    return { success: false, error: 'Error al obtener el mensaje' }
  }
}

export async function getPendingMessages() {
  try {
    const messages = await prisma.message.findMany({
      where: {
        status: 'pending'
      },
      orderBy: { date: 'asc' }
    })

    return { success: true, data: messages }
  } catch (error) {
    console.error('Error fetching pending messages:', error)
    return { success: false, error: 'Error al obtener mensajes pendientes' }
  }
}

// ==================== UPDATE ====================

export async function updateMessage(
  id: string,
  data: {
    status?: MessageStatus
    content?: string
  }
) {
  try {
    const message = await prisma.message.update({
      where: { id },
      data
    })

    revalidatePath('/dashboard/messages')
    revalidatePath(`/dashboard/messages/${id}`)
    return { success: true, data: message }
  } catch (error) {
    console.error('Error updating message:', error)
    return { success: false, error: 'Error al actualizar el mensaje' }
  }
}

export async function markMessageAsSent(id: string) {
  try {
    return updateMessage(id, { status: 'sent' })
  } catch (error) {
    console.error('Error marking message as sent:', error)
    return { success: false, error: 'Error al marcar mensaje como enviado' }
  }
}

export async function markMultipleAsSent(ids: string[]) {
  try {
    await prisma.message.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: {
        status: 'sent'
      }
    })

    revalidatePath('/dashboard/messages')
    return { 
      success: true, 
      message: `${ids.length} mensajes marcados como enviados`
    }
  } catch (error) {
    console.error('Error marking messages as sent:', error)
    return { success: false, error: 'Error al actualizar mensajes' }
  }
}

// ==================== DELETE ====================

export async function deleteMessage(id: string) {
  try {
    await prisma.message.delete({
      where: { id }
    })

    revalidatePath('/dashboard/messages')
    return { success: true, message: 'Mensaje eliminado correctamente' }
  } catch (error) {
    console.error('Error deleting message:', error)
    return { success: false, error: 'Error al eliminar el mensaje' }
  }
}

export async function deleteMultipleMessages(ids: string[]) {
  try {
    await prisma.message.deleteMany({
      where: {
        id: {
          in: ids
        }
      }
    })

    revalidatePath('/dashboard/messages')
    return { 
      success: true, 
      message: `${ids.length} mensajes eliminados correctamente`
    }
  } catch (error) {
    console.error('Error deleting messages:', error)
    return { success: false, error: 'Error al eliminar mensajes' }
  }
}

// ==================== STATISTICS ====================

export async function getMessageStats() {
  try {
    const [total, sent, pending, byType] = await Promise.all([
      prisma.message.count(),
      prisma.message.count({ where: { status: 'sent' } }),
      prisma.message.count({ where: { status: 'pending' } }),
      prisma.message.groupBy({
        by: ['type'],
        _count: {
          type: true
        }
      })
    ])

    return {
      success: true,
      data: {
        total,
        sent,
        pending,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count.type
          return acc
        }, {} as Record<string, number>)
      }
    }
  } catch (error) {
    console.error('Error fetching message stats:', error)
    return { success: false, error: 'Error al obtener estadísticas de mensajes' }
  }
}