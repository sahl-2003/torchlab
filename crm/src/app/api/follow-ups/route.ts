import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const followUps = await prisma.followUp.findMany({
      include: {
        lead: {
          select: {
            name: true,
            company: true,
            status: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    return NextResponse.json(followUps)
  } catch (error) {
    console.error('Error fetching follow-ups:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, completed } = await request.json()
    const followUp = await prisma.followUp.update({
      where: { id },
      data: { completed }
    })

    // Log activity if completed
    if (completed) {
      await prisma.activity.create({
        data: {
          type: 'FOLLOW_UP_CREATED', // Using closest available or I could add TASK_COMPLETED
          description: `Follow-up "${followUp.title}" was marked as completed`,
          leadId: followUp.leadId,
          userId: session.userId,
        }
      })
    }

    return NextResponse.json(followUp)
  } catch (error) {
    console.error('Error updating follow-up:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, date, leadId } = await request.json()

    if (!title || !date || !leadId) {
      return NextResponse.json({ error: 'Title, date, and leadId are required' }, { status: 400 })
    }

    const followUp = await prisma.followUp.create({
      data: {
        title,
        date: new Date(date),
        leadId,
      },
      include: {
        lead: {
          select: { name: true, company: true, status: true }
        }
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'FOLLOW_UP_CREATED',
        description: `Follow-up "${title}" scheduled`,
        leadId,
        userId: session.userId,
      }
    })

    return NextResponse.json(followUp)
  } catch (error) {
    console.error('Error creating follow-up:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
