# Kury

Aplikacja na telefon dla hodowcy kur: wieczorne zamykanie kurnika i dzienna liczba jajek.

## Uruchomienie

Wymagany Node.js 24+.

```sh
npm install
cp .env.example .env.local   # uzupełnij konfigurację Firebase (konsola → Ustawienia projektu → Twoje aplikacje)
npm run dev
```

Logowanie odbywa się wspólnym kontem domowym (e-mail + hasło) założonym ręcznie w konsoli Firebase (Authentication).

Inne polecenia:

- `npm test` – testy (Vitest + React Testing Library), `npm test -- --run` – jednorazowo
- `npm run typecheck` – sprawdzenie typów
- `npm run build` – wersja produkcyjna w `dist/`

## Otwieranie na telefonie (ta sama sieć Wi-Fi)

1. Uruchom `npm run dev` na komputerze. Vite wypisze adresy, m.in. `Network: http://192.168.x.x:5173/`.
2. Telefon musi być w tej samej sieci Wi-Fi co komputer.
3. Otwórz adres z linii `Network` w przeglądarce telefonu.
4. Jeśli strona się nie ładuje, zezwól Node.js na połączenia w Zaporze systemu Windows (sieć prywatna).

Aby dodać aplikację do ekranu głównego: w Chrome (Android) menu ⋮ → „Dodaj do ekranu głównego”, w Safari (iOS) „Udostępnij” → „Do ekranu początkowego”.

Dane (stado i wpisy dni) są w Firestore pod kontem domowym (`households/{uid}` i `households/{uid}/dayEntries/{RRRR-MM-DD}`), więc oba telefony widzą te same dane na bieżąco. Wpisy zrobione bez zasięgu zapisują się na telefonie i synchronizują po odzyskaniu połączenia.

Przed pierwszym uruchomieniem utwórz bazę Firestore w konsoli Firebase (region `europe-central2`) i wgraj reguły bezpieczeństwa: `npx firebase-tools deploy --only firestore:rules` (plik `firestore.rules`).

## Wdrożenie (Firebase Hosting)

Aplikacja działa pod adresem **https://kurnik-7ef87.web.app** (projekt Firebase `kurnik-7ef87`).

Wymagane jednorazowo: `npm install -g firebase-tools` i `firebase login` (w zwykłym terminalu, otworzy przeglądarkę).

```sh
npm run build
firebase deploy --only hosting          # sama aplikacja
firebase deploy --only firestore:rules  # gdy zmienisz firestore.rules
```

`.env.local` musi istnieć przy `npm run build` — wartości trafiają do zbudowanej aplikacji.

## Konto domowe

- Zmiana hasła: konsola Firebase → Authentication → Użytkownicy → ⋮ przy koncie → „Zresetuj hasło” / edycja. Po zmianie zaloguj się ponownie na obu telefonach.
- W aplikacji nie ma rejestracji ani resetu hasła — konto zakłada się tylko w konsoli.
