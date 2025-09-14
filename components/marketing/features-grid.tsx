import { Card, CardContent } from "@/components/ui/card"
import { Brain, Zap, Target, Users, FileText, BarChart3 } from "lucide-react"

export function FeaturesGrid() {
  const items = [
    { icon: Brain, title: 'Asystent AI Rekrutera', desc: 'Wsparcie analizy CV, podsumowania i rekomendacje działań.' , color:'primary'},
    { icon: Zap, title: 'Automatyzacja Procesów', desc: 'Eliminuj powtarzalne czynności i skróć time-to-hire.' , color:'secondary'},
    { icon: Target, title: 'Precyzyjne Dopasowanie', desc: 'Algorytmy dobierają kandydatów pod kątem kompetencji i dopasowania kulturowego.' , color:'accent'},
    { icon: BarChart3, title: 'Analityka i Raporty', desc: 'Mierz wydajność lejka rekrutacyjnego i identyfikuj wąskie gardła.' , color:'chart-1'},
    { icon: FileText, title: 'Panel Kandydata', desc: 'Przejrzyste śledzenie statusu aplikacji i komunikacja zwrotna.' , color:'chart-2'},
    { icon: Users, title: 'Zarządzanie Talentami', desc: 'Buduj i pielęgnuj własną bazę talentów na przyszłe potrzeby.' , color:'chart-3'},
  ]
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-heading font-bold text-2xl md:text-4xl text-center mb-4">Funkcje</h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">Kluczowe obszary platformy, które skracają proces i poprawiają jakość decyzji rekrutacyjnych.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {items.map(item => (
            <Card key={item.title} className="border bg-background">
              <CardContent className="p-6">
                <div className={`rounded-lg p-3 w-fit mb-4 bg-${item.color}/10`}>
                  <item.icon className={`h-8 w-8 text-${item.color}`} />
                </div>
                <h3 className="font-heading font-semibold text-xl mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}