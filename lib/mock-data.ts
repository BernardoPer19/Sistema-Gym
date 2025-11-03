import type {
  Member,
  Membership,
  Payment,
  Attendance,
  Message,
  Activity,
  Expense,
  User,
  GymConfig,
  Notification,
} from "./types"

// Memberships
export const memberships: Membership[] = [
  {
    id: "mem-1",
    name: "Mensual",
    price: 299,
    duration: 30,
    features: ["Acceso completo", "Todas las clases", "Casillero incluido"],
    description: "Plan mensual con acceso completo al gimnasio",
  },
  {
    id: "mem-2",
    name: "Máquinas",
    price: 399,
    duration: 30,
    features: ["Área de máquinas", "Entrenador personal 1x/mes", "Casillero incluido", "Nutrición básica"],
    description: "Acceso a zona de máquinas con asesoría",
  },
  {
    id: "mem-3",
    name: "Cardio + Máquinas",
    price: 499,
    duration: 30,
    features: [
      "Acceso completo",
      "Clases grupales",
      "Entrenador personal 2x/mes",
      "Plan nutricional",
      "Toalla incluida",
    ],
    description: "Plan completo con cardio y máquinas",
  },
  {
    id: "mem-4",
    name: "Premium",
    price: 799,
    duration: 30,
    features: [
      "Acceso 24/7",
      "Todas las clases",
      "Entrenador personal ilimitado",
      "Nutrición personalizada",
      "Spa y sauna",
      "Estacionamiento",
    ],
    description: "Acceso premium con todos los beneficios",
  },
]

// Generate mock members
const firstNames = [
  "Carlos",
  "María",
  "Juan",
  "Ana",
  "Luis",
  "Carmen",
  "Pedro",
  "Laura",
  "Miguel",
  "Sofia",
  "Diego",
  "Valentina",
  "Javier",
  "Isabella",
  "Fernando",
  "Camila",
  "Roberto",
  "Daniela",
  "Andrés",
  "Gabriela",
  "Ricardo",
  "Natalia",
  "Eduardo",
  "Paula",
  "Alejandro",
  "Mariana",
  "Jorge",
  "Lucía",
  "Sergio",
  "Andrea",
  "Raúl",
  "Carolina",
  "Martín",
  "Fernanda",
  "Alberto",
  "Victoria",
  "Gustavo",
  "Adriana",
  "Héctor",
  "Melissa",
  "Óscar",
  "Paola",
  "Rodrigo",
  "Claudia",
  "Manuel",
  "Silvia",
  "Francisco",
  "Beatriz",
  "Antonio",
  "Elena",
]
const lastNames = [
  "García",
  "Rodríguez",
  "Martínez",
  "López",
  "González",
  "Pérez",
  "Sánchez",
  "Ramírez",
  "Torres",
  "Flores",
  "Rivera",
  "Gómez",
  "Díaz",
  "Cruz",
  "Morales",
  "Reyes",
  "Jiménez",
  "Hernández",
  "Ruiz",
  "Mendoza",
]

function generateQRCode(name: string, birthDate: Date, id: string): string {
  const namePart = name.replace(/\s+/g, "-").toUpperCase()
  const datePart = birthDate.toISOString().split("T")[0].replace(/-/g, "")
  const idPart = id.replace("member-", "")
  return `${namePart}-${datePart}-${idPart}`
}

export const members: Member[] = Array.from({ length: 50 }, (_, i) => {
  const firstName = firstNames[i % firstNames.length]
  const lastName = lastNames[Math.floor(i / firstNames.length) % lastNames.length]
  const joinDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
  const membershipId = memberships[Math.floor(Math.random() * memberships.length)].id
  const membership = memberships.find((m) => m.id === membershipId)!

  const birthYear = 1964 + Math.floor(Math.random() * 42)
  const birthMonth = Math.floor(Math.random() * 12)
  const birthDay = Math.floor(Math.random() * 28) + 1
  const birthDate = new Date(birthYear, birthMonth, birthDay)

  // Calculate expiry date
  const expiryDate = new Date(joinDate)
  expiryDate.setDate(expiryDate.getDate() + membership.duration + Math.floor(Math.random() * 60))

  // Determine status
  const now = new Date()
  let status: Member["status"] = "active"
  if (expiryDate < now) {
    status = "expired"
  } else if (Math.random() > 0.85) {
    status = "inactive"
  }

  const id = `member-${i + 1}`
  const name = `${firstName} ${lastName}`

  return {
    id,
    name,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
    phone: `+52 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 9000 + 1000)}`,
    membershipId,
    status,
    joinDate,
    expiryDate,
    birthDate,
    qrCode: generateQRCode(name, birthDate, id),
  }
})

// Generate payments
export const payments: Payment[] = members.slice(0, 30).map((member, i) => {
  const membership = memberships.find((m) => m.id === member.membershipId)!
  const paymentDate = new Date(member.joinDate)
  paymentDate.setDate(paymentDate.getDate() + Math.floor(Math.random() * 30))

  return {
    id: `pay-${i + 1}`,
    memberId: member.id,
    memberName: member.name,
    amount: membership.price,
    date: paymentDate,
    status: Math.random() > 0.9 ? "pending" : "paid",
    invoiceNumber: `INV-2025-${String(i + 1).padStart(4, "0")}`,
    membershipName: membership.name,
  }
})

// Generate attendance records
export const attendances: Attendance[] = Array.from({ length: 200 }, (_, i) => {
  const member = members[Math.floor(Math.random() * members.length)]
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * 30))
  const hour = Math.floor(Math.random() * 12) + 6
  const minute = Math.floor(Math.random() * 60)

  return {
    id: `att-${i + 1}`,
    memberId: member.id,
    memberName: member.name,
    date,
    time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    status: member.status === "active" ? "allowed" : "denied",
    attended: Math.random() > 0.2,
  }
})

// Generate messages
export const messages: Message[] = [
  {
    id: "msg-1",
    type: "renewal",
    recipient: "Carlos García",
    content: "Tu membresía ha sido renovada exitosamente. ¡Gracias por seguir con nosotros!",
    status: "sent",
    date: new Date(2025, 0, 5),
  },
  {
    id: "msg-2",
    type: "birthday",
    recipient: "María Rodríguez",
    content: "¡Feliz cumpleaños! Disfruta de un día de entrenamiento gratis.",
    status: "sent",
    date: new Date(2025, 0, 8),
  },
  {
    id: "msg-3",
    type: "payment_reminder",
    recipient: "Juan Martínez",
    content: "Recordatorio: Tu pago vence en 3 días. Por favor realiza tu pago para evitar interrupciones.",
    status: "pending",
    date: new Date(2025, 0, 10),
  },
]

// Generate activities
export const activities: Activity[] = [
  {
    id: "act-1",
    type: "new_member",
    description: "Nuevo socio registrado: Sofia González",
    date: new Date(2025, 0, 10, 14, 30),
    icon: "user-plus",
  },
  {
    id: "act-2",
    type: "payment",
    description: "Pago recibido de Carlos García - $299",
    date: new Date(2025, 0, 10, 12, 15),
    icon: "dollar-sign",
  },
  {
    id: "act-3",
    type: "expiry_warning",
    description: "5 membresías vencen en los próximos 7 días",
    date: new Date(2025, 0, 10, 9, 0),
    icon: "alert-triangle",
  },
  {
    id: "act-4",
    type: "attendance",
    description: "45 asistencias registradas hoy",
    date: new Date(2025, 0, 10, 8, 0),
    icon: "check-circle",
  },
  {
    id: "act-5",
    type: "payment",
    description: "Pago recibido de María Rodríguez - $499",
    date: new Date(2025, 0, 9, 18, 45),
    icon: "dollar-sign",
  },
]

// Generate expenses data
export const expenses: Expense[] = [
  {
    id: "exp-1",
    category: "limpieza",
    description: "Productos de limpieza mensual",
    amount: 1500,
    date: new Date(2025, 0, 5),
    status: "paid",
  },
  {
    id: "exp-2",
    category: "luz",
    description: "Factura de electricidad - Enero",
    amount: 4500,
    date: new Date(2025, 0, 10),
    status: "paid",
  },
  {
    id: "exp-3",
    category: "personal",
    description: "Salario entrenadores - Enero",
    amount: 25000,
    date: new Date(2025, 0, 1),
    status: "paid",
  },
  {
    id: "exp-4",
    category: "personal",
    description: "Salario recepcionistas - Enero",
    amount: 15000,
    date: new Date(2025, 0, 1),
    status: "paid",
  },
  {
    id: "exp-5",
    category: "mantenimiento",
    description: "Reparación de caminadoras",
    amount: 3500,
    date: new Date(2025, 0, 8),
    status: "paid",
  },
  {
    id: "exp-6",
    category: "equipamiento",
    description: "Nuevas mancuernas",
    amount: 8000,
    date: new Date(2024, 11, 20),
    status: "paid",
  },
  {
    id: "exp-7",
    category: "luz",
    description: "Factura de electricidad - Diciembre",
    amount: 4200,
    date: new Date(2024, 11, 10),
    status: "paid",
  },
  {
    id: "exp-8",
    category: "limpieza",
    description: "Servicio de limpieza profunda",
    amount: 2500,
    date: new Date(2024, 11, 15),
    status: "paid",
  },
  {
    id: "exp-9",
    category: "otros",
    description: "Renovación de seguros",
    amount: 6000,
    date: new Date(2025, 0, 3),
    status: "paid",
  },
  {
    id: "exp-10",
    category: "personal",
    description: "Salario personal de limpieza - Enero",
    amount: 8000,
    date: new Date(2025, 0, 1),
    status: "paid",
  },
]

export const users: User[] = [
  {
    id: "user-1",
    name: "Admin Principal",
    email: "admin@gympro.com",
    password: "admin123",
    role: "admin",
  },
  {
    id: "user-2",
    name: "Recepcionista María",
    email: "recepcion@gympro.com",
    password: "recepcion123",
    role: "reception",
  },
  {
    id: "user-3",
    name: "Carlos García",
    email: "carlos.garcia@email.com",
    password: "cliente123",
    role: "client",
    memberId: "member-1",
  },
]

export const defaultGymConfig: GymConfig = {
  name: "GYM PRO",
  email: "contacto@gympro.com",
  currency: "MXN",
  openingTime: "06:00",
  closingTime: "22:00",
}

export const notifications: Notification[] = [
  {
    id: "notif-1",
    type: "expiry",
    title: "Membresía por vencer",
    message: "Tu membresía vence mañana. Renueva ahora para continuar disfrutando.",
    date: new Date(2025, 0, 9),
    read: false,
    userId: "user-3",
  },
  {
    id: "notif-2",
    type: "payment",
    title: "Pago pendiente",
    message: "Tienes un pago pendiente de $299. Por favor realiza tu pago.",
    date: new Date(2025, 0, 8),
    read: false,
  },
  {
    id: "notif-3",
    type: "message",
    title: "Nuevo mensaje",
    message: "El gimnasio estará cerrado el 15 de enero por mantenimiento.",
    date: new Date(2025, 0, 7),
    read: true,
  },
  {
    id: "notif-4",
    type: "system",
    title: "Actualización del sistema",
    message: "Nueva funcionalidad de reportes disponible.",
    date: new Date(2025, 0, 5),
    read: true,
  },
]

// Helper functions
export function getMemberById(id: string): Member | undefined {
  return members.find((m) => m.id === id)
}

export function getMembershipById(id: string): Membership | undefined {
  return memberships.find((m) => m.id === id)
}

export function getExpiringMembers(days = 7): Member[] {
  const now = new Date()
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)

  return members.filter((m) => {
    return m.status === "active" && m.expiryDate >= now && m.expiryDate <= futureDate
  })
}

export function getActiveMembers(): Member[] {
  return members.filter((m) => m.status === "active")
}

export function getMonthlyRevenue(): number {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  return payments
    .filter((p) => {
      const paymentDate = new Date(p.date)
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear && p.status === "paid"
    })
    .reduce((sum, p) => sum + p.amount, 0)
}

export function getMemberByQRCode(qrCode: string): Member | undefined {
  return members.find((m) => m.qrCode === qrCode)
}

export function getExpensesByCategory(category?: Expense["category"]): Expense[] {
  if (!category) return expenses
  return expenses.filter((e) => e.category === category)
}

export function getTotalExpenses(month?: number, year?: number): number {
  return expenses
    .filter((e) => {
      if (month === undefined || year === undefined) return true
      const expenseDate = new Date(e.date)
      return expenseDate.getMonth() === month && expenseDate.getFullYear() === year
    })
    .reduce((sum, e) => sum + e.amount, 0)
}

// Helper functions for auth
export function getUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email === email)
}

export function authenticateUser(email: string, password: string): User | null {
  const user = users.find((u) => u.email === email && u.password === password)
  return user || null
}

export function getNotificationsByUserId(userId?: string): Notification[] {
  if (!userId) return notifications.filter((n) => !n.userId)
  return notifications.filter((n) => !n.userId || n.userId === userId)
}
