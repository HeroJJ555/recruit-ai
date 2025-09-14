import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { GoogleCalendarService } from "@/lib/google-calendar"

// GET /api/meetings - Pobierz spotkania
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const candidateId = searchParams.get('candidateId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {
      recruiterId: (session.user as any).id
    }

    if (candidateId) {
      where.candidateId = candidateId
    }

    if (startDate) {
      where.startTime = {
        ...where.startTime,
        gte: new Date(startDate)
      }
    }

    if (endDate) {
      where.startTime = {
        ...where.startTime,
        lte: new Date(endDate)
      }
    }

    const meetings = await prisma.meeting.findMany({
      where,
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
      },
      orderBy: { startTime: 'asc' }
    })

    return NextResponse.json({ meetings })
  } catch (error) {
    console.error("Error fetching meetings:", error)
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    )
  }
}

// POST /api/meetings - Utwórz spotkanie
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const {
      candidateId,
      title,
      description,
      startTime,
      endTime,
      timeZone = "Europe/Warsaw"
    } = await req.json()

    // Walidacja
    if (!candidateId || !title || !startTime || !endTime) {
      return NextResponse.json({ 
        error: "candidateId, title, startTime, and endTime are required" 
      }, { status: 400 })
    }

    // Sprawdź czy kandydat istnieje
    const candidate = await prisma.candidateApplication.findUnique({
      where: { id: candidateId },
      select: { id: true, firstName: true, lastName: true, email: true }
    })

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    }

    const start = new Date(startTime)
    const end = new Date(endTime)

    if (start >= end) {
      return NextResponse.json({ 
        error: "Start time must be before end time" 
      }, { status: 400 })
    }

    // Sprawdź nakładające się spotkania
    const overlappingMeetings = await prisma.meeting.findMany({
      where: {
        recruiterId: (session.user as any).id,
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } }
            ]
          },
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } }
            ]
          },
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } }
            ]
          }
        ],
        status: {
          not: 'CANCELLED'
        }
      }
    })

    if (overlappingMeetings.length > 0) {
      return NextResponse.json({ 
        error: "Meeting time conflicts with existing meeting" 
      }, { status: 409 })
    }

    let calendarEventId: string | undefined
    let meetingLink: string | undefined

    // Utwórz wydarzenie w Google Calendar
    try {
      const calendarService = await GoogleCalendarService.createFromSession()
      
      const calendarEvent = await calendarService.createCalendarEvent({
        title,
        description: description || `Rozmowa rekrutacyjna z ${candidate.firstName} ${candidate.lastName}`,
        startTime: start,
        endTime: end,
        attendeeEmails: [candidate.email],
        timeZone
      })

      calendarEventId = calendarEvent.id
      meetingLink = calendarEvent.hangoutLink
      
      console.log(`Google Calendar event created: ${calendarEventId}`)
    } catch (calendarError) {
      console.error("Calendar creation failed:", calendarError)
      // Kontynuuj bez Google Calendar - meeting będzie tylko w naszej bazie
    }

    // Utwórz spotkanie w bazie danych
    const meeting = await prisma.meeting.create({
      data: {
        candidateId,
        recruiterId: (session.user as any).id,
        title,
        description,
        startTime: start,
        endTime: end,
        timeZone,
        calendarEventId,
        meetingLink,
        status: 'SCHEDULED'
      },
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
      message: "Meeting created successfully" 
    })

  } catch (error) {
    console.error("Error creating meeting:", error)
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    )
  }
}