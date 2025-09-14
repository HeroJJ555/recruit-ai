import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, Target, FileText, Zap } from "lucide-react"

  export function AITips() {
    const tips = [
      {
        icon: Target,
        title: "Dopasuj CV do stanowiska",
        description:
          "Używaj słów kluczowych z ogłoszenia o pracę, aby zwiększyć swoje szanse na znalezienie przez rekruterów.",
      },
      {
        icon: FileText,
        title: "Struktura ma znaczenie",
        description:
          "Używaj jasnej struktury z wyraźnymi sekcjami: dane kontaktowe, doświadczenie, wykształcenie, umiejętności.",
      },
      {
        icon: Zap,
        title: "Kwantyfikuj osiągnięcia",
        description:
          "Używaj liczb i konkretnych przykładów: 'Zwiększyłem sprzedaż o 30%' zamiast 'Zwiększyłem sprzedaż'.",
      },
      {
        icon: Lightbulb,
        title: "Aktualizuj regularnie",
        description: "Regularnie aktualizuj swoje CV o nowe doświadczenia, certyfikaty i umiejętności.",
      },
    ]

    return (
      <Card className="border-border bg-card text-card-foreground shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-amber-500 dark:text-amber-400" />
            <span>Wskazówki AI dla Twojego CV</span>
          </CardTitle>
          <CardDescription>Nasze AI przeanalizowało tysiące skutecznych CV. Oto najważniejsze wskazówki:</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tips.map((tip, index) => (
              <div key={index} className="flex space-x-3">
                <div className="w-8 h-8 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 ring-1 ring-primary/20 dark:ring-primary/30">
                   <tip.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1 text-foreground">{tip.title}</h4>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
