"use server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { registerSchema } from "../auth-validation"
import { z } from "zod"
import { User } from '@prisma/client'

export async function registerUser(data: User) {

  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) throw new Error("El correo ya está registrado")

  const hashedPassword = await bcrypt.hash(data.password, 10)

  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
      role: 'client'
    },
  })
}

export async function signInEmailPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return null

  return user
}
