import { Button } from "@/components/ui/button"
import { Users, FileText } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pt-16 pb-14 md:pt-24 md:pb-20 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="font-heading font-bold text-4xl md:text-6xl tracking-tight mb-6">
          Przyszłość rekrutacji <span className="text-primary block">z asystentem AI</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Automatyzuj ocenę kandydatów, przyspiesz selekcję i podejmuj lepsze decyzje szybciej.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link href="/recruiter">
            <Button size="lg" className="px-8 py-5">Dla Rekruterów</Button>
          </Link>
          <Link href="/candidate">
            <Button variant="outline" size="lg" className="px-8 py-5">Dla Kandydatów</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}