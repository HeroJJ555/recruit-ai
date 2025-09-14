import Navigation from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { Footer } from "@/components/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <HeroSection />
        <section className="max-w-5xl mx-auto px-4 py-20">
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-center mb-4">FAQ</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">Najczęstsze pytania dotyczące platformy i funkcji AI. Jeśli nie widzisz odpowiedzi – napisz do nas przez stronę kontakt.</p>
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
