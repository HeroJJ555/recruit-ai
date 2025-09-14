import MarketingLayout from '../(marketing)/_layout'

const roles = [
  { title: 'Frontend Engineer (React/Next.js)', type: 'Pełny etat', location: 'Remote / PL', slug: 'frontend-engineer' },
  { title: 'ML Engineer (NLP)', type: 'Pełny etat', location: 'Remote / EU', slug: 'ml-engineer-nlp' },
  { title: 'Customer Success Specialist', type: 'Pełny etat', location: 'Warszawa / Hybrid', slug: 'customer-success' },
]

export default function CareersPage() {
  return (
    <MarketingLayout>
      <section className="max-w-5xl mx-auto px-4 py-16 space-y-10">
        <div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">Kariera</h1>
          <p className="text-muted-foreground max-w-2xl">Dołącz do zespołu budującego przyszłość rekrutacji wspieranej przez AI.</p>
        </div>
        <div className="space-y-4">
          {roles.map(r => (
            <div key={r.slug} className="border rounded-md p-5 flex flex-col gap-1 bg-card/50">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h3 className="font-medium text-lg">{r.title}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">{r.type}</span>
                  <span>{r.location}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Aktualne ogłoszenie • Aplikuj wysyłając CV na: <a href="mailto:hr@recruitai.pl" className="text-primary hover:underline">hr@recruitai.pl</a></p>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  )
}
