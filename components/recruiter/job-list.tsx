import { prisma } from "@/lib/prisma"
import { JobStatusBadge } from "./job-status-badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"

export async function JobList() {
  const jobs = (await (prisma as any).job?.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  })) || []

  if (!jobs.length) {
    return <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">Brak ofert. Dodaj pierwszą.</div>
  }

  return (
    <div className="space-y-2">
      {jobs.map((job: any) => (
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
            <Button size="sm" variant="outline">Edytuj</Button>
            <Button size="sm" variant="destructive">Usuń</Button>
          </div>
        </div>
      ))}
    </div>
  )
}
