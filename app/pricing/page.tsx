import MarketingLayout from '../(marketing)/_layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

const plans = [
  { name: 'Starter', price: '0 zł', period: ' / mies.', highlight: false, features: ['Do 1 aktywnej rekrutacji', 'Analiza CV (limitowana)', 'Podstawowy ranking', 'E-mail support'] },
  { name: 'Pro', price: '299 zł', period: ' / mies.', highlight: true, features: ['Do 15 rekrutacji', 'Pełna analiza AI', 'Asystent kontekstowy', 'Integracje kalendarza', 'Priorytetowy support'] },
  { name: 'Enterprise', price: 'Wycena indywidualna', period: '', highlight: false, features: ['Nielimitowane procesy', 'Zaawansowane integracje', 'SLA 99.9%', 'SSO / Audyt', 'Dedykowany opiekun'] },
]

export default function PricingPage() {
  return (
    <MarketingLayout>
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">Cennik</h1>
        <p className="text-muted-foreground max-w-2xl mb-12">Elastyczne plany dopasowane do etapu rozwoju Twojej organizacji. Płać tylko za realną wartość.</p>
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map(p => (
            <Card key={p.name} className={p.highlight ? 'border-primary shadow-lg relative' : ''}>
              {p.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">Najpopularniejszy</div>}
              <CardHeader>
                <CardTitle className="text-xl">{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="text-3xl font-bold">{p.price}<span className="text-base font-medium text-muted-foreground">{p.period}</span></div>
                </div>
                <ul className="space-y-2 text-sm">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" /> <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition rounded-md py-2">Wybierz plan</button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MarketingLayout>
  )
}
