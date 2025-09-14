import MarketingLayout from '../(marketing)/_layout'

export default function PrivacyPage() {
  return (
    <MarketingLayout>
      <section className="max-w-4xl mx-auto px-4 py-16 space-y-6">
        <h1 className="font-heading font-bold text-3xl md:text-4xl">Polityka prywatności</h1>
        <p className="text-muted-foreground">Chronimy dane kandydatów i użytkowników z najwyższą starannością. Poniższy dokument opisuje kluczowe zasady.</p>
        <div className="space-y-5 text-sm leading-relaxed">
          <p><strong>Administrator danych:</strong> RecruitAI sp. z o.o. – dane kontaktowe: kontakt@recruitai.pl</p>
          <p><strong>Zakres przetwarzania:</strong> Dane identyfikacyjne, kontaktowe, zawodowe oraz metadane procesów rekrutacyjnych.</p>
          <p><strong>Cel:</strong> Obsługa procesów rekrutacyjnych, ranking aplikacji, analityka jakości rekrutacji, bezpieczeństwo.</p>
          <p><strong>Podstawy prawne:</strong> Zgoda, uzasadniony interes administratora, wykonanie umowy.</p>
          <p><strong>Przechowywanie:</strong> Dane aplikacji — domyślnie 24 miesiące (lub krócej na żądanie). Logi bezpieczeństwa — do 12 miesięcy.</p>
          <p><strong>Prawa użytkownika:</strong> Dostęp, sprostowanie, usunięcie, ograniczenie, przenoszenie, sprzeciw.</p>
          <p><strong>Udostępnianie:</strong> Dostawcy infrastruktury (hosting, storage), narzędzia analityczne, partnerzy integracyjni — wyłącznie w granicach umów powierzenia.</p>
        </div>
      </section>
    </MarketingLayout>
  )
}
