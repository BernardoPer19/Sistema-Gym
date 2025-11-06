import { 
  MemberStatus, 
  PaymentStatus, 
  AttendanceStatus, 
  MessageType, 
  MessageStatus,
  ExpenseCategory,
  ExpenseStatus,
  NotificationType 
} from '@prisma/client'

export type MemberFilters = {
  status?: MemberStatus
  membershipId?: string
  search?: string
}

export type PaymentFilters = {
  status?: PaymentStatus
  memberId?: string
  startDate?: Date
  endDate?: Date
}

export type AttendanceFilters = {
  memberId?: string
  startDate?: Date
  endDate?: Date
  status?: AttendanceStatus
}

export type MessageFilters = {
  type?: MessageType
  status?: MessageStatus
  startDate?: Date
  endDate?: Date
}

export type ExpenseFilters = {
  category?: ExpenseCategory
  status?: ExpenseStatus
  startDate?: Date
  endDate?: Date
}

export type ActivityFilters = {
  type?: string
  startDate?: Date
  endDate?: Date
}
