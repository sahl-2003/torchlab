import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const search = searchParams.get('search')

  try {
    const leads = await prisma.lead.findMany({
      where: {
        AND: [
          status ? { status: status as any } : {},
          priority ? { priority: priority as any } : {},
          search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { company: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
          } : {},
        ]
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        salesperson: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await request.json()
    const lead = await prisma.lead.create({
      data: {
        ...data,
        salespersonId: session.userId,
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'LEAD_CREATED',
        description: `Lead ${lead.name} was created`,
        leadId: lead.id,
        userId: session.userId,
      }
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Error creating lead:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
