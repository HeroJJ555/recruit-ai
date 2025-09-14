import MarketingLayout from '../(marketing)/_layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const integrations = [
  { name: 'Google Calendar', cat: 'Kalendarz', desc: 'Synchronizacja terminów rozmów kwalifikacyjnych.' },
  { name: 'Microsoft 365', cat: 'Kalendarz', desc: 'Obsługa spotkań i rezerwacji sal.' },
  { name: 'Slack', cat: 'Komunikacja', desc: 'Powiadomienia o nowych aplikacjach i statusach.' },
  { name: 'Zapier', cat: 'Automatyzacja', desc: 'Łącz RecruitAI z setkami zewnętrznych narzędzi.' },
  { name: 'LinkedIn', cat: 'Źródła talentów', desc: 'Import kandydatów i śledzenie źródeł.' },
]

export default function IntegrationsPage() {
  return (
    <MarketingLayout>
      <section className="max-w-5xl mx-auto px-4 py-16 space-y-10">
        <div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">Integracje</h1>
          <p className="text-muted-foreground max-w-2xl">Łącz RecruitAI z narzędziami, które już wykorzystujesz w procesach HR i współpracy zespołowej.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {integrations.map(i => (
            <Card key={i.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                  {i.name}
                  <span className="text-xs font-medium rounded-full bg-primary/10 text-primary px-2 py-0.5">{i.cat}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{i.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MarketingLayout>
  )
}
