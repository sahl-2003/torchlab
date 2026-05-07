import { NextRequest, NextResponse } from 'next/server'
import { decrypt, updateSession } from './src/lib/auth'

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value

  // Define public routes that don't require authentication
  const isPublicRoute =
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname.startsWith('/api/auth')

  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  if (session && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }

  // If session exists, verify it and slide the expiry (rolling session)
  if (session) {
    try {
      await decrypt(session)
      // Refresh the session window on each valid request
      const refreshed = await updateSession(request)
      return refreshed ?? NextResponse.next()
    } catch (e) {
      // Invalid or expired session — clear cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.nextUrl))
      response.cookies.delete('session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
