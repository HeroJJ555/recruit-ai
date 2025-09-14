import MarketingLayout from '../(marketing)/_layout'

export default function AboutPage() {
  return (
    <MarketingLayout>
      <section className="max-w-4xl mx-auto px-4 py-16 space-y-8">
        <h1 className="font-heading font-bold text-3xl md:text-4xl">O nas</h1>
        <p className="text-muted-foreground leading-relaxed">RecruitAI powstało z potrzeby uproszczenia procesów rekrutacyjnych w firmach technologicznych i usługowych. Wykorzystujemy AI do analizy dopasowania, skracania czasu odpowiedzi i minimalizowania stronniczości.</p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="p-4 rounded-md bg-card border">
            <h3 className="font-semibold mb-2">Misja</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Demokratyzacja dostępu do inteligentnych narzędzi rekrutacyjnych dla firm każdej wielkości.</p>
          </div>
          <div className="p-4 rounded-md bg-card border">
            <h3 className="font-semibold mb-2">Wartości</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">Transparentność, etyczne wykorzystanie AI, ochrona danych kandydatów.</p>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}