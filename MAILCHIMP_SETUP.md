# Resend Email Configuration

## Aby skonfigurować Resend do wysyłania wiadomości:

1. **Utwórz konto Resend:**
   - Idź na https://resend.com i załóż konto

2. **Uzyskaj API Key:**
   - W panelu Resend przejdź do API Keys
   - Utwórz nowy API key

3. **Skonfiguruj zmienne środowiskowe:**
   ```
   RESEND_API_KEY=your_resend_api_key_here
   FROM_EMAIL=your-verified-email@yourdomain.com
   ```

4. **Zweryfikuj domenę (opcjonalne, ale zalecane):**
   - W Resend dodaj i zweryfikuj swoją domenę
   - Pozwoli to wysyłać maile z własnej domeny

## Tryb deweloperski

- Jeśli nie masz skonfigurowanego Resend API, system automatycznie przełączy się w tryb symulacji
- W trybie deweloperskim maile nie są rzeczywiście wysyłane

## Po poprawnej konfiguracji

✅ Wysyłanie rzeczywistych emaili przez Resend
✅ Testowanie maili w ustawieniach aplikacji
✅ Automatyczne tagowanie i kategoryzacja wiadomości