## LuminaNet — futurystyczny landing + dashboard

Next.js 14 + TypeScript + Tailwind + shadcn/ui + Framer Motion. Polish-first UI with EN toggle, mock Firebase fallback, uploads, public share links, and referral tracking.

### Kluczowe funkcje
- Landing 2100: hero, social proof, value cards, interactive demo, pricing, testimonials, sticky mobile CTA, OG/Twitter meta.
- Auth: Google + e-mail/hasło. Mock mode działa bez kluczy Firebase. Protected dashboard layout.
- Dashboard: profil, upload (mock Storage/Firebase), biblioteka z kopiowaniem linku, ustawienia (theme/lang), publiczne `/share/[id]`.
- Firebase placeholder: gotowe [firestore.rules](firestore.rules) i [storage.rules](storage.rules) z bezpiecznymi domyślnymi ustawieniami.
- Inżynieria: ESLint, Vitest + Testing Library, strict TS, zod env guard, responsive & a11y.

### Stos
- Next.js 14 (app router), React 19, TypeScript
- Tailwind 3 + shadcn/ui + Radix, Framer Motion, next-themes
- Firebase client (auth/firestore/storage) z lokalnym mockiem
- Vitest + Testing Library

### Szybki start (mock mode)
1) Wymagania: Node 20+, npm.
2) Instalacja: `npm install`
3) Uruchom dev: `npm run dev` → http://localhost:3000 (mock storage/localStorage, bez Firebase).

### Konfiguracja Firebase (opcjonalnie)
1) Skopiuj [.env.example](.env.example) do `.env.local` i uzupełnij klucze Firebase, ustaw `NEXT_PUBLIC_USE_FIREBASE=true`.
2) Włącz Email/Password + Google Sign-In w konsoli Firebase.
3) Zdeployuj reguły:
	- Firestore: `firebase deploy --only firestore:rules` lub emulator `firebase emulators:start --only firestore`
	- Storage: `firebase deploy --only storage:rules`
4) Uruchom: `npm run dev` (dashboard użyje prawdziwego Auth/Storage/Firestore).

### Komendy
- Dev: `npm run dev`
- Lint: `npm run lint`
- Testy: `npm run test`
- Build produkcyjny: `npm run build`
- Start produkcyjny: `npm run start`

### Deploy
- Vercel: `vercel --prod` (lub przez UI). Projekt jest zero-config.
- Netlify: `npm run build` i wskaż folder `.next` z serwerem Next (adapter Node / edge wg preferencji).

### Ważne pliki
- Landing i układ: [app/page.tsx](app/page.tsx), [app/layout.tsx](app/layout.tsx), [app/globals.css](app/globals.css)
- Dashboard + auth: [app/dashboard](app/dashboard), [app/auth/page.tsx](app/auth/page.tsx), [app/share/[id]/page.tsx](app/share/[id]/page.tsx)
- Logika Firebase/mock: [lib/env.ts](lib/env.ts), [lib/firebase.ts](lib/firebase.ts), [lib/mock-store.ts](lib/mock-store.ts), [components/providers/auth-provider.tsx](components/providers/auth-provider.tsx)
- UI: [components/ui](components/ui)
- Testy: [__tests__](__tests__), [vitest.config.ts](vitest.config.ts)

### Dostępność i wydajność
- Domyślny motyw jasny, wysoki kontrast, aria-labels na kontrolkach, focus styles.
- Animacje lekkie (Framer Motion), skeletony, toasty.
- Remote image domains whitelisted (Unsplash, DiceBear).

### Mock vs Firebase
- Domyślnie: mock (localStorage) → możesz testować logowanie, upload, share bez kluczy.
- Produkcja: ustaw `NEXT_PUBLIC_USE_FIREBASE=true` i dodaj klucze; upload zapisuje metadane w kolekcji `uploads` (pole `shareable: true`).

### Kredyty
Źródła grafik i ikon w [CREDITS.md](CREDITS.md).
