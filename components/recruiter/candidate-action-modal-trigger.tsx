"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SingleActionModal } from "@/components/recruiter/actions-modals"
import { CreateMeetingDialog } from "@/components/recruiter/create-meeting-dialog"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function CandidateActionModalTrigger({ candidateId, candidateName }: { candidateId: string, candidateName?: string }) {
  const [open, setOpen] = useState(false)
  const [meetingOpen, setMeetingOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Akcje</Button>
      <SingleActionModal
        open={open}
        onOpenChange={setOpen}
        candidateId={candidateId}
        candidateName={candidateName}
        onDone={() => {
          toast.success("Status zaktualizowany")
          router.refresh()
        }}
        onScheduleInterview={() => setMeetingOpen(true)}
      />
      <CreateMeetingDialog
        open={meetingOpen}
        onOpenChange={setMeetingOpen}
        selectedCandidateId={candidateId}
        onMeetingCreated={() => {
          toast.success("Spotkanie utworzone")
          router.refresh()
        }}
      />
    </>
  )
}
