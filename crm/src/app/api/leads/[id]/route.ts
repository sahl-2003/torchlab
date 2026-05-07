import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireAuth, unauthorized } from '@/lib/auth'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await requireAuth()
    if (!session) return unauthorized()

    const data = await request.json()
    const lead = await prisma.lead.update({
      where: { id },
      data: { ...data },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'LEAD_UPDATED',
        description: `Updated lead status to ${lead.status}`,
        leadId: lead.id,
        userId: session.userId,
      }
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error('PATCH ERROR:', error)
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await requireAuth()
    if (!session) return unauthorized()

    await prisma.lead.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Lead deleted' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await requireAuth()
    if (!session) return unauthorized()

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        notes: {
          include: { user: true },
          orderBy: { createdAt: 'desc' }
        },
        activities: {
          orderBy: { createdAt: 'desc' }
        },
        salesperson: true
      }
    })

    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    return NextResponse.json(lead)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 })
  }
}
