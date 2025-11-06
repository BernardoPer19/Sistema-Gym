export type ActionResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
  count?: number
}

export type PaginatedResponse<T> = ActionResponse<{
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}>
