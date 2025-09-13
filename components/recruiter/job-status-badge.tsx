import { Badge } from "@/components/ui/badge"

const map: Record<string, { label: string; variant?: string }> = {
  DRAFT: { label: "DRAFT", variant: "secondary" },
  OPEN: { label: "OPEN", variant: "default" },
  PAUSED: { label: "PAUSED", variant: "outline" },
  CLOSED: { label: "CLOSED", variant: "destructive" },
}

export function JobStatusBadge({ status }: { status: string }) {
  const s = map[status] || { label: status }
  return <Badge variant={s.variant as any}>{s.label}</Badge>
}
