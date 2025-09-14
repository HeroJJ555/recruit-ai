import MarketingLayout from '../(marketing)/_layout'
import Link from 'next/link'

export default function DemoPage() {
  return (
    <MarketingLayout>
      <section className="max-w-4xl mx-auto px-4 py-16 space-y-8">
        <h1 className="font-heading font-bold text-3xl md:text-4xl">Demo</h1>
        <p className="text-muted-foreground max-w-2xl">Odkryj jak RecruitAI może przyspieszyć Twoją rekrutację. Udostępniamy tryb demonstracyjny z przykładowymi danymi, abyś mógł szybko ocenić wartość narzędzia.</p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="border rounded-lg p-6 space-y-3 bg-card/50">
            <h3 className="font-semibold">Tryb Rekrutera</h3>
            <p className="text-sm text-muted-foreground">Przeglądaj oferty, aplikacje i analitykę.</p>
            <Link href="/auth/signin" className="text-primary text-sm font-medium hover:underline">Zaloguj się</Link>
          </div>
          <div className="border rounded-lg p-6 space-y-3 bg-card/50">
            <h3 className="font-semibold">Asystent AI</h3>
            <p className="text-sm text-muted-foreground">Zobacz jak AI odpowiada na pytania rekrutacyjne.</p>
            <Link href="/recruiter/ai-assistant" className="text-primary text-sm font-medium hover:underline">Otwórz asystenta</Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
