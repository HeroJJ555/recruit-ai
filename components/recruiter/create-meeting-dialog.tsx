"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, Clock, Users } from "lucide-react"
import { format } from "date-fns"

interface Candidate {
  id: string
  firstName: string
  lastName: string
  email: string
  position: string
}

interface CreateMeetingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCandidateId?: string
  selectedDate?: Date
  onMeetingCreated?: () => void
}

export function CreateMeetingDialog({ 
  open, 
  onOpenChange, 
  selectedCandidateId,
  selectedDate,
  onMeetingCreated 
}: CreateMeetingDialogProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    candidateId: selectedCandidateId || '',
    title: '',
    description: '',
    date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
    startTime: '',
    endTime: '',
  })

  useEffect(() => {
    if (open) {
      loadCandidates()
    }
  }, [open])

  useEffect(() => {
    if (selectedCandidateId) {
      setFormData(prev => ({ ...prev, candidateId: selectedCandidateId }))
    }
  }, [selectedCandidateId])

  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({ ...prev, date: format(selectedDate, 'yyyy-MM-dd') }))
    }
  }, [selectedDate])

  const loadCandidates = async () => {
    try {
      const response = await fetch('/api/candidate/applications')
      if (response.ok) {
        const data = await response.json()
        setCandidates(data.items || [])
      }
    } catch (error) {
      console.error("Failed to load candidates:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.candidateId || !formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      alert('Wypełnij wszystkie wymagane pola')
      return
    }

    const startDateTime = new Date(`${formData.date}T${formData.startTime}`)
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`)

    if (startDateTime >= endDateTime) {
      alert('Czas rozpoczęcia musi być wcześniejszy niż czas zakończenia')
      return
    }

    if (startDateTime < new Date()) {
      alert('Nie można zaplanować spotkania w przeszłości')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateId: formData.candidateId,
          title: formData.title,
          description: formData.description,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
        })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Meeting created:', result.meeting)
        
        // Reset form
        setFormData({
          candidateId: '',
          title: '',
          description: '',
          date: '',
          startTime: '',
          endTime: '',
        })
        
        onMeetingCreated?.()
        onOpenChange(false)
      } else {
        const error = await response.json()
        alert(error.error || 'Błąd podczas tworzenia spotkania')
      }
    } catch (error) {
      console.error('Error creating meeting:', error)
      alert('Błąd podczas tworzenia spotkania')
    } finally {
      setLoading(false)
    }
  }

  const generateMeetingTitle = (candidateId: string) => {
    const candidate = candidates.find(c => c.id === candidateId)
    if (candidate) {
      return `Rozmowa z ${candidate.firstName} ${candidate.lastName} - ${candidate.position}`
    }
    return ''
  }

  const handleCandidateChange = (candidateId: string) => {
    setFormData(prev => ({
      ...prev,
      candidateId,
      title: generateMeetingTitle(candidateId)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Utwórz nowe spotkanie</span>
          </DialogTitle>
          <DialogDescription>
            Zaplanuj rozmowę z kandydatem. Wszystkie pola oznaczone * są wymagane.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Wybór kandydata */}
          <div className="space-y-2">
            <Label htmlFor="candidateId">Kandydat *</Label>
            <Select
              value={formData.candidateId}
              onValueChange={handleCandidateChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz kandydata..." />
              </SelectTrigger>
              <SelectContent>
                {candidates.map(candidate => (
                  <SelectItem key={candidate.id} value={candidate.id}>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>
                        {candidate.firstName} {candidate.lastName} - {candidate.position}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tytuł spotkania */}
          <div className="space-y-2">
            <Label htmlFor="title">Tytuł spotkania *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="np. Rozmowa kwalifikacyjna"
            />
          </div>

          {/* Opis */}
          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Dodatkowe informacje o spotkaniu..."
              rows={3}
            />
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date">Data *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>

          {/* Godziny */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Godzina rozpoczęcia *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Godzina zakończenia *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Tworzenie...
                </>
              ) : (
                'Utwórz spotkanie'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}