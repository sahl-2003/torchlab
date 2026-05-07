import { NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import prisma from '@/lib/prisma'
import { encrypt } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const passwordMatch = await compare(password, user.password)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const session = await encrypt({ userId: user.id, role: user.role, expires })

    const response = NextResponse.json(
      { message: 'Login successful', user: { id: user.id, email: user.email, name: user.name, role: user.role } },
      { status: 200 }
    )

    response.cookies.set({
      name: 'session',
      value: session,
      httpOnly: true,
      expires,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
