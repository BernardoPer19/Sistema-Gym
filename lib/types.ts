export type MemberStatus = "active" | "inactive" | "expired"
export type PaymentStatus = "paid" | "pending" | "overdue"
export type AttendanceStatus = "allowed" | "denied"
export type MessageStatus = "sent" | "pending"
export type MessageType = "renewal" | "birthday" | "payment_reminder" | "custom"
export type UserRole = "admin" | "reception" | "client"

export interface Member {
  id: string
  name: string
  email: string
  phone: string
  membershipId: string
  status: MemberStatus
  joinDate: Date
  expiryDate: Date
  birthDate: Date
  qrCode: string
  photo?: string
}

export interface Membership {
  id: string
  name: string
  price: number
  duration: number // days
  features: string[]
  description: string
}

export interface Payment {
  id: string
  memberId: string
  memberName: string
  amount: number
  date: Date
  status: PaymentStatus
  invoiceNumber: string
  membershipName: string
}

export interface Attendance {
  id: string
  memberId: string
  memberName: string
  date: Date
  time: string
  status: AttendanceStatus
  attended?: boolean
}

export interface Message {
  id: string
  type: MessageType
  recipient: string
  content: string
  status: MessageStatus
  date: Date
}

export interface Activity {
  id: string
  type: "new_member" | "payment" | "expiry_warning" | "attendance"
  description: string
  date: Date
  icon: string
}

export interface Expense {
  id: string
  category: "limpieza" | "luz" | "personal" | "mantenimiento" | "equipamiento" | "otros"
  description: string
  amount: number
  date: Date
  status: "paid" | "pending"
}

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  memberId?: string
}

export interface GymConfig {
  name: string
  logo?: string
  email: string
  currency: string
  openingTime: string
  closingTime: string
}

export interface Notification {
  id: string
  type: "expiry" | "payment" | "message" | "system"
  title: string
  message: string
  date: Date
  read: boolean
  userId?: string
}
