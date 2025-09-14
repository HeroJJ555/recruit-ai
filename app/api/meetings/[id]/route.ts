import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GoogleCalendarService } from "@/lib/google-calendar"

// GET /api/meetings/[id] - Pobierz konkretne spotkanie
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const meeting = await prisma.meeting.findFirst({
      where: {
        id: params.id,
        recruiterId: (session.user as any).id
      },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true,
            phone: true
          }
        }
      }
    })

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    return NextResponse.json({ meeting })
  } catch (error) {
    console.error("Error fetching meeting:", error)
    return NextResponse.json(
      { error: "Failed to fetch meeting" },
      { status: 500 }
    )
  }
}

// PUT /api/meetings/[id] - Zaktualizuj spotkanie
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      title,
      description,
      startTime,
      endTime,
      status,
      notes
    } = await req.json()

    // Sprawdź czy spotkanie istnieje i należy do usera
    const existingMeeting = await prisma.meeting.findFirst({
      where: {
        id: params.id,
        recruiterId: (session.user as any).id
      }
    })

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    const updateData: any = {}
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (startTime !== undefined) updateData.startTime = new Date(startTime)
    if (endTime !== undefined) updateData.endTime = new Date(endTime)
    if (status !== undefined) updateData.status = status
    if (notes !== undefined) updateData.notes = notes

    // Walidacja czasów
    if (updateData.startTime && updateData.endTime) {
      if (updateData.startTime >= updateData.endTime) {
        return NextResponse.json({ 
          error: "Start time must be before end time" 
        }, { status: 400 })
      }
    }

    const meeting = await prisma.meeting.update({
      where: { id: params.id },
      data: updateData,
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      meeting,
      message: "Meeting updated successfully" 
    })

  } catch (error) {
    console.error("Error updating meeting:", error)
    return NextResponse.json(
      { error: "Failed to update meeting" },
      { status: 500 }
    )
  }
}

// DELETE /api/meetings/[id] - Usuń spotkanie
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Sprawdź czy spotkanie istnieje i należy do usera
    const existingMeeting = await prisma.meeting.findFirst({
      where: {
        id: params.id,
        recruiterId: (session.user as any).id
      }
    })

    if (!existingMeeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    // TODO: Usuń z Google Calendar jeśli istnieje calendarEventId

    await prisma.meeting.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      success: true,
      message: "Meeting deleted successfully" 
    })

  } catch (error) {
    console.error("Error deleting meeting:", error)
    return NextResponse.json(
      { error: "Failed to delete meeting" },
      { status: 500 }
    )
  }
}