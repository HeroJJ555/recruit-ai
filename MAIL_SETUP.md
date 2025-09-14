# Konfiguracja systemu maili (Resend API)

## 📧 Funkcjonalność

System wiadomości umożliwia:

- ✅ Automatyczne wysyłanie feedbacku do kandydatów
- 🤖 Generowanie spersonalizowanych wiadomości przez AI  
- 📊 Analiza CV i dopasowanie treści do oceny kandydata
- 📋 Różne szablony wiadomości (pozytywne, neutralne, negatywne)
- 📱 Intuicyjny interfejs do zarządzania komunikacją

## 🚀 Jak skonfigurować Resend API

### 1. Załóż konto w Resend
1. Przejdź na https://resend.com
2. Zarejestruj się lub zaloguj
3. Przejdź do Dashboard

### 2. Uzyskaj klucz API
1. W Dashboard kliknij "API Keys"
2. Kliknij "Create API Key"
3. Nadaj nazwę klucza (np. "recruit-ai-production")
4. Skopiuj wygenerowany klucz

### 3. Skonfiguruj domenę (opcjonalne, ale zalecane)
1. W Dashboard kliknij "Domains"
2. Kliknij "Add Domain"
3. Wprowadź swoją domenę (np. yourdomain.com)
4. Skonfiguruj rekordy DNS zgodnie z instrukcjami Resend

### 4. Zaktualizuj plik .env.local

```bash
# Resend Email API
RESEND_API_KEY=re_your_actual_api_key_here
FROM_EMAIL=feedback@yourdomain.com  # lub onboarding@resend.dev dla testów
```

## 🔧 Tryb deweloperski

Bez konfiguracji Resend API system działa w trybie deweloperskim:
- Maile nie są faktycznie wysyłane
- W konsoli wyświetlane są szczegóły "wysłanej" wiadomości
- UI pokazuje sukces z informacją o trybie deweloperskim

## 📊 Jak działa system feedbacku

### 1. Analiza kandydata
- System analizuje dane CV (mocne strony, słabości, ocena)
- Na podstawie wyniku (hire/maybe/reject) dobiera odpowiedni ton

### 2. Generowanie treści
- **AI Feedback**: Automatycznie generowany na podstawie analizy
- **Pozytywny**: Zaproszenie na rozmowę
- **Neutralny**: Prośba o dodatkowe informacje  
- **Negatywny**: Grzeczne odrzucenie z konstruktywnym feedbackiem
- **Własny**: Ręcznie napisana wiadomość

### 3. Wysyłanie maila
- System formatuje wiadomość w HTML
- Dodaje nagłówek z logo firmy i informacjami
- Wysyła przez Resend API lub symuluje w trybie dev

## 🎯 Użycie w aplikacji

1. Przejdź do `/recruiter/messages`
2. Wybierz kandydata z listy
3. Wybierz szablon wiadomości
4. Dostosuj temat (opcjonalnie)
5. Kliknij "Wyślij feedback"

System automatycznie:
- Wygeneruje odpowiednią treść
- Sformatuje ją w profesjonalny email
- Wyśle do kandydata
- Pokaże potwierdzenie wysłania

## 🔍 Rozwiązywanie problemów

### Problem: "Serwis mailowy nie jest skonfigurowany"
- Sprawdź czy RESEND_API_KEY jest ustawiony w .env.local
- Upewnij się że uruchomiłeś ponownie serwer po dodaniu zmiennej

### Problem: "Nieprawidłowy klucz API"
- Sprawdź czy klucz API jest poprawny
- Klucz powinien zaczynać się od "re_"

### Problem: "Domena nie jest zweryfikowana"
- Użyj tymczasowo FROM_EMAIL=onboarding@resend.dev
- Lub skonfiguruj swoją domenę w panelu Resend

## 📈 Przyszłe rozszerzenia

- 📊 Historia wysłanych wiadomości
- 📋 Zaawansowane szablony z placeholderami
- 📱 Powiadomienia SMS
- 🔗 Tracking otwarć i kliknięć
- 📅 Automatyczne przypomnienia

---

**Gotowe! System wiadomości jest w pełni funkcjonalny.** 🎉

W trybie deweloperskim możesz testować wszystkie funkcje bez faktycznego wysyłania maili.