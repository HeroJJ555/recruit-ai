import MarketingLayout from '../../(marketing)/_layout'
import { notFound } from 'next/navigation'

const tutorials: Record<string, { title: string; content: string }> = {
  'pierwsza-oferta': {
    title: 'Dodawanie pierwszej oferty pracy',
    content: 'Aby dodać ofertę przejdź do panelu Rekrutera → Oferty pracy → Dodaj nową. Wypełnij szczegóły, ustaw status na OPEN aby była widoczna.'
  },
  'ranking-kandydatow': {
    title: 'Jak działa ranking kandydatów',
    content: 'Ranking opiera się na dopasowaniu słów kluczowych, doświadczeniu oraz wynikach analizy AI (jeżeli aktywna).'
  },
  'ai-asystent': {
    title: 'Wykorzystanie asystenta AI w ocenie',
    content: 'Asystent potrafi streszczać CV, sugerować pytania rekrutacyjne i porównywać kandydatów – zadawaj konkretne pytania.'
  }
}

export default function TutorialArticle({ params }: { params: { slug: string } }) {
  const article = tutorials[params.slug]
  if (!article) return notFound()
  return (
    <MarketingLayout>
      <article className="max-w-3xl mx-auto px-4 py-16 space-y-6">
        <h1 className="font-heading font-bold text-3xl md:text-4xl">{article.title}</h1>
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{article.content}</p>
      </article>
    </MarketingLayout>
  )
}
