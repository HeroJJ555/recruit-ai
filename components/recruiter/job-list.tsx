"use client"

import { useEffect, useState } from "react"
import { JobStatusBadge } from "./job-status-badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"
import { Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { JobForm } from "./job-form"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface Job {
  id: string
  title: string
  slug: string
  department?: string
  location?: string
  employmentType?: string
  seniority?: string
  description: string
  requirements?: string
  responsibilities?: string
  benefits?: string
  goldenCandidate?: any
  status: string
  openings: number
  publishedAt?: string
  ownerId?: string
  createdAt: string
  updatedAt: string
}

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { toast } = useToast()

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/recruiter/jobs')
      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }
      const data = await response.json()
      setJobs(data)
      setError(null)
    } catch (err) {
      setError('Błąd podczas ładowania ofert')
      console.error('Error fetching jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (jobId: string) => {
    try {
      const response = await fetch(`/api/recruiter/jobs/${jobId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete job')
      }

      toast({
        title: "Sukces",
        description: "Oferta została usunięta",
      })
      
      // Refresh the list
      fetchJobs()
    } catch (err: any) {
      toast({
        title: "Błąd",
        description: err.message || "Nie udało się usunąć oferty",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false)
    setEditingJob(null)
    fetchJobs() // Refresh the list
    toast({
      title: "Sukces",
      description: "Oferta została zaktualizowana",
    })
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  if (loading) {
    return <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">Ładowanie...</div>
  }

  if (error) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">
        {error}
        <Button onClick={fetchJobs} className="ml-2" size="sm">Ponów</Button>
      </div>
    )
  }

  if (!jobs.length) {
    return <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">Brak ofert. Dodaj pierwszą.</div>
  }

  return (
    <>
      <div className="space-y-2">
        {jobs.map((job: Job) => (
          <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{job.title}</h3>
                <JobStatusBadge status={job.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                {job.department ? job.department + " • " : ""}{job.location || "(zdalnie / n/d)"} • {job.openings} wakat(y)
              </p>
              <p className="text-[11px] text-muted-foreground/70">Utworzono {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: pl })}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleEdit(job)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edytuj
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Usuń
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Czy na pewno usunąć?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ta akcja nie może być cofnięta. Oferta "{job.title}" zostanie trwale usunięta.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDelete(job.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Usuń
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edytuj ofertę pracy</DialogTitle>
          </DialogHeader>
          {editingJob && (
            <JobForm 
              editMode={true}
              initialData={editingJob}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
