import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, TrendingUp, Clock } from "lucide-react"

export function DashboardStats() {
  const stats = [
    {
      title: "Aktywni kandydaci",
      value: "1,247",
      change: "+12%",
      changeType: "positive" as const,
      icon: Users,
      description: "w tym miesiącu",
    },
    {
      title: "Otwarte pozycje",
      value: "23",
      change: "+3",
      changeType: "positive" as const,
      icon: FileText,
      description: "nowe w tym tygodniu",
    },
    {
      title: "Wskaźnik dopasowania",
      value: "94%",
      change: "+2%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "średnia AI",
    },
    {
      title: "Średni czas rekrutacji",
      value: "14 dni",
      change: "-3 dni",
      changeType: "positive" as const,
      icon: Clock,
      description: "vs poprzedni miesiąc",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span className={`font-medium ${stat.changeType === "positive" ? "text-green-600" : "text-red-600"}`}>
                {stat.change}
              </span>
              <span>{stat.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
