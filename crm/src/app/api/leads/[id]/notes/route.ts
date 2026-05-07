import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content } = await request.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Note content is required' }, { status: 400 })
    }

    const note = await prisma.note.create({
      data: {
        content: content.trim(),
        leadId: id,
        userId: session.userId,
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    })

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'NOTE_ADDED',
        description: `Note added to lead`,
        leadId: id,
        userId: session.userId,
      }
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notes = await prisma.note.findMany({
      where: { leadId: id },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}
