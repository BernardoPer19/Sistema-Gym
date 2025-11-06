export const MEMBER_STATUS_LABELS = {
  active: 'Activo',
  inactive: 'Inactivo',
  expired: 'Expirado'
} as const

export const PAYMENT_STATUS_LABELS = {
  paid: 'Pagado',
  pending: 'Pendiente',
  overdue: 'Vencido'
} as const

export const ATTENDANCE_STATUS_LABELS = {
  allowed: 'Permitido',
  denied: 'Denegado'
} as const

export const MESSAGE_TYPE_LABELS = {
  renewal: 'Renovación',
  birthday: 'Cumpleaños',
  payment_reminder: 'Recordatorio de pago',
  custom: 'Personalizado'
} as const

export const EXPENSE_CATEGORY_LABELS = {
  limpieza: 'Limpieza',
  luz: 'Electricidad',
  personal: 'Personal',
  mantenimiento: 'Mantenimiento',
  equipamiento: 'Equipamiento',
  otros: 'Otros'
} as const

export const USER_ROLE_LABELS = {
  admin: 'Administrador',
  reception: 'Recepción',
  client: 'Cliente'
} as const

export const NOTIFICATION_TYPE_LABELS = {
  expiry: 'Expiración',
  payment: 'Pago',
  message: 'Mensaje',
  system: 'Sistema'
} as const

// Configuración de paginación
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// Configuración de fechas
export const DATE_FORMAT = 'DD/MM/YYYY'
export const DATETIME_FORMAT = 'DD/MM/YYYY HH:mm'

// Configuración de mensajes
export const EXPIRY_WARNING_DAYS = 7
export const PAYMENT_OVERDUE_DAYS = 7

// Límites
export const MAX_BULK_MESSAGE_RECIPIENTS = 100
export const MAX_FILE_SIZE_MB = 5