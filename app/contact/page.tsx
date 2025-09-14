import MarketingLayout from '../(marketing)/_layout'

export default function ContactPage() {
  return (
    <MarketingLayout>
      <section className="max-w-3xl mx-auto px-4 py-16 space-y-8">
        <h1 className="font-heading font-bold text-3xl md:text-4xl">Kontakt</h1>
        <p className="text-muted-foreground max-w-2xl">Skontaktuj się z nami – odpowiadamy zwykle w ciągu 1–2 dni roboczych.</p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="p-4 border rounded-md bg-card/50">
            <h3 className="font-semibold mb-1">Wsparcie</h3>
            <p className="text-sm text-muted-foreground">kontakt@recruitai.pl</p>
          </div>
          <div className="p-4 border rounded-md bg-card/50">
            <h3 className="font-semibold mb-1">HR / Rekrutacja</h3>
            <p className="text-sm text-muted-foreground">hr@recruitai.pl</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Adres prawny dostępny w regulaminie.</p>
      </section>
    </MarketingLayout>
  )
}
