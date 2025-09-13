import Navigation from "@/components/navigation"
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
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
