import { Badge } from "@/components/ui/badge"

const map: Record<string, { label: string; variant?: string }> = {
  DRAFT: { label: "Szkic", variant: "secondary" },
  OPEN: { label: "Otwarte", variant: "default" },
  PAUSED: { label: "Wstrzymane", variant: "outline" },
  CLOSED: { label: "Zamknięte", variant: "destructive" },
}

export function JobStatusBadge({ status }: { status: string }) {
  const s = map[status] || { label: status }
  return <Badge variant={s.variant as any}>{s.label}</Badge>
}
