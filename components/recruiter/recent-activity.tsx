import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, MessageSquare, Calendar } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "application",
    title: "Nowa aplikacja",
    description: "Jan Nowak aplikował na stanowisko Frontend Developer",
    time: "2 minuty temu",
    icon: FileText,
    color: "text-blue-600",
  },
  {
    id: 2,
    type: "interview",
    title: "Rozmowa zaplanowana",
    description: "Rozmowa z Marią Kowalczyk na jutro o 14:00",
    time: "15 minut temu",
    icon: Calendar,
    color: "text-green-600",
  },
  {
    id: 3,
    type: "message",
    title: "Nowa wiadomość",
    description: "Piotr Wiśniewski odpowiedział na Twoją wiadomość",
    time: "1 godzinę temu",
    icon: MessageSquare,
    color: "text-purple-600",
  },
  {
    id: 4,
    type: "candidate",
    title: "AI znalazło dopasowanie",
    description: "3 nowych kandydatów pasuje do pozycji Backend Developer",
    time: "2 godziny temu",
    icon: Users,
    color: "text-orange-600",
  },
]

export function RecentActivity() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ostatnia aktywność</CardTitle>
        <CardDescription>Najnowsze wydarzenia w Twoich procesach rekrutacyjnych</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`p-2 rounded-full bg-muted ${activity.color}`}>
                <activity.icon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{activity.title}</h4>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
