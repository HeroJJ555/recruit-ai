"use client"

import { useState } from "react"
import { CalendarView } from "@/components/recruiter/calendar-view"
import { CreateMeetingDialog } from "@/components/recruiter/create-meeting-dialog"

export function CalendarPageClient() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreateMeeting = () => {
    setIsCreateDialogOpen(true)
  }

  const handleMeetingCreated = () => {
    setRefreshKey(prev => prev + 1) // Force refresh of calendar
  }

  const handleMeetingClick = (meeting: any) => {
    setSelectedMeeting(meeting)
    // TODO: Open meeting details dialog
    console.log("Meeting clicked:", meeting)
  }

  return (
    <>
      <CalendarView
        key={refreshKey} // Force re-render when meetings change
        onCreateMeeting={handleCreateMeeting}
        onMeetingClick={handleMeetingClick}
      />

      <CreateMeetingDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onMeetingCreated={handleMeetingCreated}
      />
    </>
  )
}