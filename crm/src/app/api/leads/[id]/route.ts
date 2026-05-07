import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { decrypt } from '@/lib/auth'
import { cookies } from 'next/headers'

async function getUserId() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')?.value
  if (!session) return null
  const decoded = await decrypt(session)
  return decoded.userId as string
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await request.json()
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...data,
      },
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'LEAD_UPDATED',
        description: `Updated lead status to ${lead.status}`,
        leadId: lead.id,
        userId,
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
    const userId = await getUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        notes: { orderBy: { createdAt: 'desc' } },
        activities: { orderBy: { createdAt: 'desc' } },
      }
    })

    if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })

    return NextResponse.json(lead)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 })
  }
}
