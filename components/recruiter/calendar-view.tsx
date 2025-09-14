"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Plus, MapPin } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from "date-fns"
import { pl } from "date-fns/locale"

interface Meeting {
  id: string
  title: string
  description?: string
  startTime: string
  endTime: string
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  candidate: {
    id: string
    firstName: string
    lastName: string
    email: string
    position: string
  }
}

interface CalendarViewProps {
  onCreateMeeting?: () => void
  onMeetingClick?: (meeting: Meeting) => void
}

export function CalendarView({ onCreateMeeting, onMeetingClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  useEffect(() => {
    loadMeetings()
  }, [currentDate])

  const loadMeetings = async () => {
    try {
      setLoading(true)
      const startDate = monthStart.toISOString()
      const endDate = monthEnd.toISOString()
      
      const response = await fetch(`/api/meetings?startDate=${startDate}&endDate=${endDate}`)
      if (response.ok) {
        const data = await response.json()
        setMeetings(data.meetings || [])
      }
    } catch (error) {
      console.error("Failed to load meetings:", error)
    } finally {
      setLoading(false)
    }
  }

  const getMeetingsForDay = (date: Date) => {
    return meetings.filter(meeting => 
      isSameDay(new Date(meeting.startTime), date)
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'NO_SHOW': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Zaplanowane'
      case 'COMPLETED': return 'Zakończone'
      case 'CANCELLED': return 'Anulowane'
      case 'NO_SHOW': return 'Nieobecność'
      default: return status
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const dayMeetings = selectedDate ? getMeetingsForDay(selectedDate) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Kalendarz rozmów</h2>
          <p className="text-muted-foreground">
            Zarządzaj terminami rozmów z kandydatami
          </p>
        </div>
        <Button onClick={onCreateMeeting}>
          <Plus className="h-4 w-4 mr-2" />
          Nowe spotkanie
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{format(currentDate, 'LLLL yyyy', { locale: pl })}</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  ←
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Dziś
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  →
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie'].map(day => (
                <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(day => {
                const dayMeetings = getMeetingsForDay(day)
                const isSelected = selectedDate && isSameDay(day, selectedDate)
                const isCurrentMonth = isSameMonth(day, currentDate)
                const isCurrentDay = isToday(day)
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      min-h-[80px] p-1 border rounded cursor-pointer transition-colors
                      ${isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'}
                      ${!isCurrentMonth ? 'opacity-50' : ''}
                      ${isCurrentDay ? 'bg-blue-50 border-blue-200' : ''}
                    `}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={`text-sm ${isCurrentDay ? 'font-bold text-blue-600' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-1 mt-1">
                      {dayMeetings.slice(0, 2).map(meeting => (
                        <div
                          key={meeting.id}
                          className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate"
                          onClick={(e) => {
                            e.stopPropagation()
                            onMeetingClick?.(meeting)
                          }}
                        >
                          {format(new Date(meeting.startTime), 'HH:mm')} {meeting.title}
                        </div>
                      ))}
                      {dayMeetings.length > 2 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayMeetings.length - 2} więcej
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>
                {selectedDate 
                  ? format(selectedDate, 'dd MMMM yyyy', { locale: pl })
                  : 'Wybierz dzień'
                }
              </span>
            </CardTitle>
            {selectedDate && (
              <CardDescription>
                {dayMeetings.length === 0 
                  ? 'Brak spotkań'
                  : `${dayMeetings.length} spotkań`
                }
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="space-y-4">
                {dayMeetings.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Brak spotkań w tym dniu
                  </p>
                ) : (
                  dayMeetings.map(meeting => (
                    <div
                      key={meeting.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => onMeetingClick?.(meeting)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{meeting.title}</h4>
                        <Badge className={getStatusColor(meeting.status)}>
                          {getStatusText(meeting.status)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {format(new Date(meeting.startTime), 'HH:mm')} - {format(new Date(meeting.endTime), 'HH:mm')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>
                            {meeting.candidate.firstName} {meeting.candidate.lastName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{meeting.candidate.position}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Kliknij na dzień w kalendarzu aby zobaczyć szczegóły
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}