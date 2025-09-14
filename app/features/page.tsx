import MarketingLayout from '../(marketing)/_layout'
import { CheckCircle2 } from 'lucide-react'

const features = [
  { title: 'Automatyczna analiza CV', desc: 'AI ocenia dopasowanie kandydata do stanowiska w kilka sekund.' },
  { title: 'Ranking kandydatów', desc: 'Priorytetyzacja aplikacji według trafności i jakości profilu.' },
  { title: 'Inteligentne wyszukiwanie', desc: 'Przeszukuj bazę talentów semantycznie – nie tylko po słowach kluczowych.' },
  { title: 'Zarządzanie procesem', desc: 'Etapy, statusy, notatki i współpraca zespołu w jednym miejscu.' },
  { title: 'Wbudowany asystent AI', desc: 'Zadawaj pytania o kandydatów, generuj podsumowania i wiadomości.' },
  { title: 'Integracje', desc: 'Łącz się z ATS/HRIS oraz kalendarzem i systemami ogłoszeń.' },
]

export default function FeaturesPage() {
  return (
    <MarketingLayout>
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">Funkcje platformy</h1>
        <p className="text-muted-foreground max-w-2xl mb-12">Kompletny zestaw narzędzi do nowoczesnej, szybkiej i sprawiedliwej rekrutacji wspieranej przez AI.</p>
        <div className="grid gap-8 sm:grid-cols-2">
          {features.map(f => (
            <div key={f.title} className="flex items-start gap-4">
              <CheckCircle2 className="h-6 w-6 text-primary mt-1" />
              <div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </MarketingLayout>
  )
}
