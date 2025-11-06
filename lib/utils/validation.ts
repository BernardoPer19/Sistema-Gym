export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 7
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe incluir al menos una mayúscula')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe incluir al menos una minúscula')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe incluir al menos un número')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function sanitizeString(str: string): string {
  return str.trim().replace(/\s+/g, ' ')
}
