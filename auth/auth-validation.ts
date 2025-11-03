import { UserRole } from "@prisma/client"
import { z } from "zod"


export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(Object.values(UserRole) as [string, ...string[]]),
  isActive: z.boolean().default(true),
  has2FA: z.boolean().default(false),
})
