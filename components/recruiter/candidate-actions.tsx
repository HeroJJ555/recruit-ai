"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { X, Clock, CheckCircle, CalendarPlus } from "lucide-react"
import { CreateMeetingDialog } from "@/components/recruiter/create-meeting-dialog"

interface Props {
  candidateId: string
  onStatusChanged?: (newStatus: string) => void
  onMeetingCreated?: () => void
}

export function CandidateActions({ candidateId, onStatusChanged, onMeetingCreated }: Props) {
  const [openMeeting, setOpenMeeting] = useState(false)

  const updateStatus = async (action: 'reject' | 'waiting' | 'interview') => {
    if (action === 'interview') {
      setOpenMeeting(true)
      return
    }
    try {
      const res = await fetch('/api/candidate/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateIds: [candidateId], action })
      })
      if (res.ok) {
        onStatusChanged?.(action)
      } else {
        const e = await res.json()
        console.error('Status update failed', e)
      }
    } catch (e) {
      console.error('Status update error', e)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">Akcje</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => updateStatus('reject')}>
            <X className="h-4 w-4 mr-2" /> Odrzuć
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateStatus('waiting')}>
            <Clock className="h-4 w-4 mr-2" /> Oczekuje
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateStatus('interview')}>
            <CheckCircle className="h-4 w-4 mr-2" /> Zaproś na rozmowę
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenMeeting(true)}>
            <CalendarPlus className="h-4 w-4 mr-2" /> Zaplanuj spotkanie
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateMeetingDialog
        open={openMeeting}
        onOpenChange={setOpenMeeting}
        selectedCandidateId={candidateId}
        onMeetingCreated={onMeetingCreated}
      />
    </div>
  )
}
