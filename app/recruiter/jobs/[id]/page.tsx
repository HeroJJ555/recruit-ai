import { Sidebar } from "@/components/recruiter/sidebar";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";

interface JobDetailPageProps { params: { id: string } }

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const jobModel = (prisma as any).job;
  if (!jobModel) {
    return notFound();
  }
  const job = await jobModel.findUnique({ where: { id: params.id } });
  if (!job) return notFound();

  // Attempt to normalize goldenCandidate (it may be JSON, object or null)
  let golden: any = null;
  try {
    if (job.goldenCandidate) {
      if (typeof job.goldenCandidate === 'string') {
        golden = JSON.parse(job.goldenCandidate);
      } else {
        golden = job.goldenCandidate;
      }
    }
  } catch {
    golden = null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar className="w-64 flex-shrink-0" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">Status: <span className="font-medium">{job.status}</span></p>
          </div>
          <Link href="/recruiter/jobs" className="text-sm underline hover:no-underline">← Wróć do listy</Link>
        </div>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Info label="Dział" value={job.department} />
          <Info label="Lokalizacja" value={job.location || 'n/d'} />
          <Info label="Typ zatrudnienia" value={job.employmentType || 'n/d'} />
          <Info label="Poziom" value={job.seniority || 'n/d'} />
          <Info label="Liczba wakatów" value={String(job.openings)} />
          <Info label="Opublikowano" value={job.publishedAt ? new Date(job.publishedAt).toLocaleDateString('pl-PL') : '—'} />
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Opis</h2>
          <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed border rounded-md p-4 bg-muted/30">
            {job.description}
          </div>
        </section>

        {job.requirements && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Wymagania</h2>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap border rounded-md p-4 bg-muted/30">
              {job.requirements}
            </div>
          </section>
        )}
        {job.responsibilities && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Obowiązki</h2>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap border rounded-md p-4 bg-muted/30">
              {job.responsibilities}
            </div>
          </section>
        )}
        {job.benefits && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Benefity</h2>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap border rounded-md p-4 bg-muted/30">
              {job.benefits}
            </div>
          </section>
        )}

        {golden && (golden.role || golden.level || golden.skills || golden.summary) && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Złoty Kandydat</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {golden.role && <Info label="Rola" value={golden.role} />}
              {golden.level && <Info label="Poziom" value={golden.level} />}
              {golden.skills && <Info label="Umiejętności" value={golden.skills} />}
              {golden.summary && <Info label="Opis" value={golden.summary} />}
            </div>
          </section>
        )}

        <footer className="pt-8 text-xs text-muted-foreground border-t">ID: {job.id}</footer>
      </main>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  if (!value) return (
    <div className="text-sm space-y-1 p-3 border rounded-md bg-muted/20">
      <p className="font-medium text-muted-foreground/70">{label}</p>
      <p className="text-muted-foreground/50 italic">brak</p>
    </div>
  )
  return (
    <div className="text-sm space-y-1 p-3 border rounded-md bg-muted/20">
      <p className="font-medium text-muted-foreground/70">{label}</p>
      <p className="text-foreground break-words whitespace-pre-wrap">{value}</p>
    </div>
  )
}
