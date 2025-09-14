import MarketingLayout from '../(marketing)/_layout'

export default function TermsPage() {
  return (
    <MarketingLayout>
      <section className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <h1 className="font-heading font-bold text-3xl md:text-4xl">Regulamin</h1>
        <p className="text-muted-foreground">Poniższy regulamin określa zasady korzystania z platformy RecruitAI.</p>
        <ol className="list-decimal list-inside space-y-3 text-sm leading-relaxed">
          <li>Platforma przeznaczona jest do zarządzania procesami rekrutacyjnymi i analizy kandydatów.</li>
          <li>Użytkownik zobowiązuje się do podawania prawdziwych danych oraz poszanowania prywatności kandydatów.</li>
          <li>Zabronione jest wykorzystywanie platformy do działań niezgodnych z prawem lub naruszających dobra osobiste.</li>
          <li>Administrator może zawiesić dostęp w razie nadużyć lub naruszeń bezpieczeństwa.</li>
          <li>Odpowiedzialność administratora jest ograniczona do wartości opłaconego abonamentu (z wyjątkiem przypadków wynikających z przepisów prawa).</li>
          <li>Zmiany regulaminu będą komunikowane z 14-dniowym wyprzedzeniem.</li>
        </ol>
      </section>
    </MarketingLayout>
  )
}
