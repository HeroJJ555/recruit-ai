import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface CreateMeetingData {
  title: string
  description?: string
  startTime: Date
  endTime: Date
  attendeeEmails: string[]
  timeZone?: string
}

interface CalendarEvent {
  id: string
  htmlLink: string
  hangoutLink?: string
}

export class GoogleCalendarService {
  private oauth2Client: OAuth2Client

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.NEXTAUTH_URL || 'http://localhost:3000'
    )
  }

  async initializeFromSession() {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error('No active session found')
    }

    const user = session.user as any
    if (!user.accessToken) {
      throw new Error('No Google access token found. Please re-authenticate with Google.')
    }

    this.oauth2Client.setCredentials({
      access_token: user.accessToken,
      refresh_token: user.refreshToken,
    })

    return this
  }

  async createCalendarEvent(data: CreateMeetingData): Promise<CalendarEvent> {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    const event = {
      summary: data.title,
      description: data.description,
      start: {
        dateTime: data.startTime.toISOString(),
        timeZone: data.timeZone || 'Europe/Warsaw',
      },
      end: {
        dateTime: data.endTime.toISOString(),
        timeZone: data.timeZone || 'Europe/Warsaw',
      },
      attendees: data.attendeeEmails.map(email => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    }

    try {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        conferenceDataVersion: 1,
        sendUpdates: 'all',
      })

      if (!response.data.id) {
        throw new Error('Failed to create calendar event')
      }

      return {
        id: response.data.id,
        htmlLink: response.data.htmlLink || '',
        hangoutLink: response.data.hangoutLink,
      }
    } catch (error) {
      console.error('Google Calendar API error:', error)
      throw new Error('Failed to create calendar event')
    }
  }

  async updateCalendarEvent(
    eventId: string, 
    data: Partial<CreateMeetingData>
  ): Promise<CalendarEvent> {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    const updateData: any = {}
    
    if (data.title) updateData.summary = data.title
    if (data.description) updateData.description = data.description
    if (data.startTime) {
      updateData.start = {
        dateTime: data.startTime.toISOString(),
        timeZone: data.timeZone || 'Europe/Warsaw',
      }
    }
    if (data.endTime) {
      updateData.end = {
        dateTime: data.endTime.toISOString(),
        timeZone: data.timeZone || 'Europe/Warsaw',
      }
    }
    if (data.attendeeEmails) {
      updateData.attendees = data.attendeeEmails.map(email => ({ email }))
    }

    try {
      const response = await calendar.events.update({
        calendarId: 'primary',
        eventId,
        resource: updateData,
        sendUpdates: 'all',
      })

      return {
        id: response.data.id!,
        htmlLink: response.data.htmlLink || '',
        hangoutLink: response.data.hangoutLink,
      }
    } catch (error) {
      console.error('Google Calendar update error:', error)
      throw new Error('Failed to update calendar event')
    }
  }

  async deleteCalendarEvent(eventId: string): Promise<void> {
    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
        sendUpdates: 'all',
      })
    } catch (error) {
      console.error('Google Calendar delete error:', error)
      throw new Error('Failed to delete calendar event')
    }
  }

  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ]

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    })
  }

  async getTokensFromCode(code: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code)
      return tokens
    } catch (error) {
      console.error('OAuth token exchange error:', error)
      throw new Error('Failed to exchange authorization code for tokens')
    }
  }

  // Helper function to create a service instance with session tokens
  static async createFromSession() {
    const service = new GoogleCalendarService()
    await service.initializeFromSession()
    return service
  }
}