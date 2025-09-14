# Mailchimp Transactional (Mandrill) Configuration

## Aby skonfigurować Mailchimp do wysyłania wiadomości:

1. **Utwórz konto Mailchimp:**
   - Idź na https://mailchimp.com i załóż konto

2. **Aktywuj Mailchimp Transactional (Mandrill):**
   - W Mailchimp przejdź do Integrations > Transactional
   - Aktywuj usługę Mandrill
   - Otrzymasz API Key dla transactional emails

3. **Dodaj zmienne środowiskowe do .env.local:**
   ```
   MAILCHIMP_TRANSACTIONAL_API_KEY=your_mandrill_api_key_here
   FROM_EMAIL=noreply@yourdomain.com
   ```

4. **Zweryfikuj domenę (opcjonalne ale zalecane):**
   - W Mailchimp Transactional dodaj i zweryfikuj swoją domenę
   - To poprawi deliverability emaili

## Testowanie w trybie deweloperskim:
- Jeśli nie masz skonfigurowanego Mailchimp API, system automatycznie przełączy się w tryb symulacji
- Wiadomości będą zapisywane w bazie danych, ale nie będą faktycznie wysyłane
- W logach zobaczysz "📧 Development mode - simulating email send"

## Funkcjonalności:
✅ Wysyłanie rzeczywistych emaili przez Mailchimp Transactional
✅ Historia wszystkich wiadomości w bazie danych  
✅ Automatyczna aktualizacja statusu kandydata po wysłaniu
✅ Szablony wiadomości z placeholderami
✅ AI feedback generation
✅ Usuwanie z listy oczekujących po wysłaniu