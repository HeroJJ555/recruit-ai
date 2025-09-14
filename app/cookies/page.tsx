import MarketingLayout from '../(marketing)/_layout'

export default function CookiesPage() {
  return (
    <MarketingLayout>
      <section className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <h1 className="font-heading font-bold text-3xl md:text-4xl">Cookies</h1>
        <p className="text-muted-foreground">Pliki cookies pomagają nam ulepszać działanie platformy oraz zapewniać bezpieczeństwo.</p>
        <div className="space-y-4 text-sm leading-relaxed">
          <p><strong>Rodzaje używanych cookies:</strong> Sesyjne (uwierzytelnianie), funkcjonalne (zapamiętywanie ustawień), analityczne (agregowane metryki użycia).</p>
          <p><strong>Zarządzanie:</strong> Możesz usunąć lub zablokować cookies w ustawieniach przeglądarki. Ograniczy to jednak funkcjonalność.</p>
          <p><strong>Strony trzecie:</strong> Analityka i integracje mogą ustawiać własne identyfikatory — zawsze minimalizujemy dane.</p>
        </div>
      </section>
    </MarketingLayout>
  )
}
