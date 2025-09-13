import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CVUploadForm } from "@/components/candidate/cv-upload-form"
import { AITips } from "@/components/candidate/ai-tips"
import { FileText, Brain } from "lucide-react"

export default function CandidatePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 rounded-full p-4">
                <FileText className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">Panel Kandydata</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Prześlij swoje CV i pozwól naszemu AI znaleźć dla Ciebie idealne oferty pracy
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <CVUploadForm />
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <AITips />

              {/* Stats Card */}
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Brain className="h-8 w-8 text-primary" />
                  <h3 className="font-heading font-semibold text-lg">Moc AI w liczbach</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Przeanalizowane CV</span>
                    <span className="font-semibold">50,000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Skuteczne dopasowania</span>
                    <span className="font-semibold">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Średni czas analizy</span>
                    <span className="font-semibold">30 sek</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
