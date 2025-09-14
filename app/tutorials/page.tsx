import MarketingLayout from '../(marketing)/_layout'
import Link from 'next/link'

const tutorials = [
  { slug: 'pierwsza-oferta', title: 'Dodawanie pierwszej oferty pracy', level: 'Podstawowy' },
  { slug: 'ranking-kandydatow', title: 'Jak działa ranking kandydatów', level: 'Podstawowy' },
  { slug: 'ai-asystent', title: 'Wykorzystanie asystenta AI w ocenie', level: 'Średni' },
]

export default function TutorialsPage() {
  return (
    <MarketingLayout>
      <section className="max-w-5xl mx-auto px-4 py-16 space-y-10">
        <div>
          <h1 className="font-heading font-bold text-3xl md:text-4xl mb-4">Tutoriale</h1>
          <p className="text-muted-foreground max-w-2xl">Krótkie przewodniki pomagające szybciej wykorzystać potencjał platformy.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {tutorials.map(t => (
            <Link key={t.slug} href={`/tutorials/${t.slug}`} className="border rounded-lg p-5 hover:bg-card transition flex flex-col gap-2">
              <span className="text-sm font-medium line-clamp-2">{t.title}</span>
              <span className="text-xs text-muted-foreground">Poziom: {t.level}</span>
              <span className="text-primary text-xs font-semibold mt-auto">Czytaj →</span>
            </Link>
          ))}
        </div>
      </section>
    </MarketingLayout>
  )
}
