export function handlePrismaError(error: any): string {
  if (error.code === 'P2002') {
    return 'Ya existe un registro con estos datos únicos'
  }
  
  if (error.code === 'P2025') {
    return 'El registro no fue encontrado'
  }
  
  if (error.code === 'P2003') {
    return 'Referencia inválida a otro registro'
  }
  
  if (error.code === 'P2014') {
    return 'Violación de restricción de relación'
  }
  
  return 'Error en la base de datos'
}

export function logError(context: string, error: any): void {
  console.error(`[${context}]`, {
    message: error.message,
    code: error.code,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString()
  })
}