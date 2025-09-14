import MarketingLayout from '../(marketing)/_layout'

const faqs = [
  { q: 'Czy asystent AI przechowuje dane kandydatów?', a: 'Nie – odpowiedzi są generowane kontekstowo. Dane osobowe nie są wysyłane do modelu bez Twojej zgody.' },
  { q: 'Czy mogę eksportować dane?', a: 'Plan Pro wspiera eksport CSV aplikacji oraz raporty podsumowujące.' },
  { q: 'Jakie przeglądarki są wspierane?', a: 'Aktualne wersje Chrome, Firefox, Edge oraz Safari.' },
]

export default function HelpPage() {
  return (
    <MarketingLayout>
      <section className="max-w-4xl mx-auto px-4 py-16 space-y-10">
        <div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">Pomoc</h1>
          <p className="text-muted-foreground max-w-2xl">Często zadawane pytania i podstawowe informacje o platformie.</p>
        </div>
        <div className="space-y-6">
          {faqs.map(f => (
            <div key={f.q} className="border-b pb-4">
              <h3 className="font-semibold text-lg mb-2">{f.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-sm text-muted-foreground">
          Nadal masz pytania? Napisz: <a href="mailto:kontakt@recruitai.pl" className="text-primary hover:underline">kontakt@recruitai.pl</a>
        </div>
      </section>
    </MarketingLayout>
  )
}
