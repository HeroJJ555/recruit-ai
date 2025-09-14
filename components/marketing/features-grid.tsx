import { Card, CardContent } from "@/components/ui/card"
import { Brain, Zap, Target, Users, FileText, BarChart3 } from "lucide-react"

export function FeaturesGrid() {
  const items = [
    { 
      icon: Brain, 
      title: 'Asystent AI Rekrutera', 
      desc: 'Wsparcie analizy CV, podsumowania i rekomendacje działań opartych na sztucznej inteligencji.', 
      gradient: 'from-blue-500 to-purple-600',
      shadowColor: 'shadow-blue-500/25'
    },
    { 
      icon: Zap, 
      title: 'Automatyzacja Procesów', 
      desc: 'Eliminuj powtarzalne czynności i skróć time-to-hire dzięki inteligentnej automatyzacji.', 
      gradient: 'from-yellow-400 to-orange-500',
      shadowColor: 'shadow-orange-500/25'
    },
    { 
      icon: Target, 
      title: 'Precyzyjne Dopasowanie', 
      desc: 'Algorytmy dobierają kandydatów pod kątem kompetencji i dopasowania kulturowego.', 
      gradient: 'from-emerald-400 to-teal-600',
      shadowColor: 'shadow-emerald-500/25'
    },
    { 
      icon: BarChart3, 
      title: 'Analityka i Raporty', 
      desc: 'Mierz wydajność lejka rekrutacyjnego i identyfikuj wąskie gardła w czasie rzeczywistym.', 
      gradient: 'from-violet-500 to-indigo-600',
      shadowColor: 'shadow-violet-500/25'
    },
    { 
      icon: FileText, 
      title: 'Panel Kandydata', 
      desc: 'Przejrzyste śledzenie statusu aplikacji i komunikacja zwrotna w eleganckim interfejsie.', 
      gradient: 'from-pink-500 to-rose-600',
      shadowColor: 'shadow-pink-500/25'
    },
    { 
      icon: Users, 
      title: 'Zarządzanie Talentami', 
      desc: 'Buduj i pielęgnuj własną bazę talentów na przyszłe potrzeby rekrutacyjne.', 
      gradient: 'from-cyan-400 to-blue-600',
      shadowColor: 'shadow-cyan-500/25'
    },
  ]

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative overflow-hidden smooth-bg-transition">
      {/* Smooth fade from hero section */}
      <div className="absolute top-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-b from-background via-slate-50/20 to-transparent dark:via-slate-900/20 pointer-events-none" />
      
      {/* Premium background effects with smooth transitions */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 smooth-bg-transition" />
      <div className="absolute inset-0 section-fade" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced header with fade-in */}
        <div className="text-center mb-16 opacity-0 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 mb-6 opacity-0 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            <Brain className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Powered by AI</span>
          </div>
          <h2 className="font-heading font-bold text-3xl md:text-5xl lg:text-6xl text-center mb-6 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-100 dark:to-white bg-clip-text text-transparent opacity-0 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            Inteligentne Funkcje
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl text-center max-w-3xl mx-auto leading-relaxed opacity-0 animate-fade-in-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
            Kluczowe obszary platformy, które rewolucjonizują proces rekrutacji i podnoszą jakość decyzji na nowy poziom.
          </p>
        </div>

        {/* Premium features grid with fade-in animations */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {items.map((item, index) => (
            <Card 
              key={item.title} 
              className={`group relative border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-xl ${item.shadowColor} hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 overflow-hidden opacity-0 animate-fade-in-up`}
              style={{ 
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'forwards'
              }}
            >
              {/* Card background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-900/80" />
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-slate-100/50 dark:to-slate-950/50" />
              
              {/* Animated border gradient */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-slate-200/50 to-transparent dark:via-slate-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardContent className="relative z-10 p-8">
                {/* Premium icon container - FIXED ICONS */}
                <div className="relative mb-6">
                  <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} p-0.5 group-hover:scale-110 transition-transform duration-500`}>
                    <div className="w-full h-full rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center">
                      <item.icon className="h-8 w-8 text-white" style={{
                        filter: `drop-shadow(0 0 8px ${item.gradient.includes('blue') ? '#3b82f6' : 
                                 item.gradient.includes('yellow') ? '#f59e0b' :
                                 item.gradient.includes('emerald') ? '#10b981' :
                                 item.gradient.includes('violet') ? '#8b5cf6' :
                                 item.gradient.includes('pink') ? '#ec4899' : '#06b6d4'})`
                      }} />
                    </div>
                  </div>
                  {/* Enhanced glow effect */}
                  <div className={`absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500`} />
                </div>

                {/* Content */}
                <h3 className="font-heading font-bold text-xl md:text-2xl mb-3 text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-100 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed group-hover:text-slate-500 dark:group-hover:text-slate-200 transition-colors duration-300">
                  {item.desc}
                </p>

                {/* Hover indicator */}
                <div className="mt-6 flex items-center text-sm font-medium text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors duration-300">
                  <span>Dowiedz się więcej</span>
                  <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </CardContent>

              {/* Animated corner accents */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/20 to-transparent dark:from-slate-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-slate-100/30 to-transparent dark:from-slate-800/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Card>
          ))}
        </div>

        {/* Premium CTA section with fade-in */}
        <div className="text-center mt-16 opacity-0 animate-fade-in" style={{ animationDelay: '1200ms', animationFillMode: 'forwards' }}>
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer">
            <span>Wypróbuj wszystkie funkcje</span>
            <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Smooth gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-b from-transparent via-slate-50/50 to-background dark:via-slate-900/50 dark:to-background pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-b from-transparent to-background pointer-events-none" />
    </section>
  )
}