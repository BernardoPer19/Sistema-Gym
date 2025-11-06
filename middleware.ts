import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Aquí implementarías tu lógica de autenticación
  // Por ejemplo, verificar tokens JWT, sesiones, etc.
  
  const isAuthenticated = false // Reemplazar con lógica real
  const isPublicPath = request.nextUrl.pathname.startsWith('/login')
  
  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login']
}