import Navigation from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { FeaturesGrid } from "@/components/marketing/features-grid"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <HeroSection />
        <FeaturesGrid />
        <section className="max-w-6xl mx-auto px-4 py-12 md:py-16 text-center">
          <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl mb-4">Gotowy na rewolucję w rekrutacji?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6 md:mb-8">Dołącz do firm, które wykorzystują moc AI aby skrócić czas rekrutacji i podnieść jakość zatrudnienia.</p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/recruiter"><Button size="lg" className="px-8 py-5">Zacznij bezpłatnie</Button></Link>
              <Link href="/demo"><Button variant="outline" size="lg" className="px-8 py-5">Zobacz demo</Button></Link>
            </div>
          </div>
        </section>
        <section className="max-w-5xl mx-auto px-4 pb-16 md:pb-24 pt-4">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-center mb-4">FAQ</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-8">Najczęstsze pytania dotyczące platformy i funkcji AI. Masz inne? Skontaktuj się z nami.</p>
          <Accordion type="single" collapsible className="space-y-2">
            <AccordionItem value="faq-1">
              <AccordionTrigger>Jak szybko mogę zacząć korzystać z systemu?</AccordionTrigger>
              <AccordionContent>Rejestracja zajmuje mniej niż minutę. Po zalogowaniu możesz od razu dodać pierwszą ofertę i zaprosić zespół.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2">
              <AccordionTrigger>Czy analiza CV wykorzystuje moje dane do trenowania modeli?</AccordionTrigger>
              <AccordionContent>Nie. Dane kandydatów nie są wykorzystywane do dalszego trenowania modeli publicznych – pozostają w Twojej instancji.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3">
              <AccordionTrigger>Co daje plan Pro w praktyce?</AccordionTrigger>
              <AccordionContent>Pełne funkcje AI (głębsza analiza, ranking wielokryterialny), więcej aktywnych procesów, integracje kalendarza i priorytetowe wsparcie.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-4">
              <AccordionTrigger>Czy mogę eksportować dane kandydatów?</AccordionTrigger>
              <AccordionContent>Tak, eksport CSV i podstawowe raporty są dostępne. W planie Enterprise także integracje API i webhooki.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-5">
              <AccordionTrigger>Jak chroniona jest prywatność kandydatów?</AccordionTrigger>
              <AccordionContent>Stosujemy szyfrowanie w spoczynku i transmisji, kontrolę dostępu oraz zgodność z RODO. Możesz także zgłosić żądanie usunięcia danych.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>
      <Footer />
    </div>
  )
}