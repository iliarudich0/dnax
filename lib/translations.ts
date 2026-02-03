export type Locale = "pl" | "en";

type Copy = typeof translations.pl;

export const translations = {
  pl: {
    brand: {
      name: "LuminaNet",
      slogan: "Twoja przyszłość w chmurze 2100",
    },
    nav: {
      product: "Produkt",
      pricing: "Cennik",
      docs: "Dokumentacja",
      login: "Zaloguj",
      dashboard: "Panel",
    },
    hero: {
      title: "Twórz, przechowuj i udostępniaj dane jak w 2100 roku",
      subtitle:
        "Ultralekka przestrzeń danych z wbudowanymi udostępnieniami, AI-ready i ochroną prywatności.",
      primaryCta: "Zacznij za darmo",
      secondaryCta: "Zobacz demo",
    },
    social: {
      users: "ponad 128 000 twórców",
      countries: "35 krajów",
      rating: "Ocena 4.9/5",
      note: "Dane referencyjne są fikcyjne."
    },
    values: [
      {
        title: "Szkło holograficzne",
        desc: "Przejrzysty interfejs z mikro-animacjami i kontrastem klasy premium.",
      },
      {
        title: "Natychmiastowe udostępnianie",
        desc: "Jedno kliknięcie, aby wygenerować publiczny link z kodem polecającym.",
      },
      {
        title: "Bezpieczeństwo zero-trust",
        desc: "Gotowe reguły Firestore i Storage z bezpiecznymi domyślnymi ustawieniami.",
      },
    ],
    demo: {
      title: "Interaktywny podgląd",
      desc: "Zobacz, jak Twoja biblioteka plików żyje w czasie rzeczywistym.",
      uploadSpeed: "Przyspieszenie zapisu",
      livePreview: "Podgląd na żywo",
      mockMode: "Tryb lokalny bez Firebase",
    },
    steps: {
      title: "Jak to działa",
      items: [
        { title: "Zaloguj się", desc: "Google lub e-mail, natychmiastowy dostęp." },
        { title: "Wyślij plik", desc: "Przeciągnij, puść i generuj link do udostępnienia." },
        { title: "Udostępnij", desc: "Wyślij link /share i zbieraj polecenia." },
      ],
    },
    pricing: {
      title: "Prosty cennik",
      subtitle: "Elastyczne plany dla indywidualistów i zespołów.",
      plans: [
        {
          name: "Free",
          price: "0 zł",
          features: ["Mock storage lokalnie", "Do 25 plików", "Linki /share"],
        },
        {
          name: "Pro",
          price: "49 zł",
          features: ["Firebase Storage", "Szyfrowane udostępnienia", "Priorytetowe wsparcie"],
        },
        {
          name: "Team",
          price: "129 zł",
          features: ["Role zespołowe", "Analytics udostępnień", "Integracje webhook"],
        },
      ],
    },
    testimonials: {
      title: "Historie użytkowników",
      items: [
        { name: "Nadia, Product Lead", quote: "LuminaNet wygląda jak interfejs z przyszłości, a działa w 2 minuty." },
        { name: "Oskar, Motion Designer", quote: "Mock mode pozwolił mi zaprezentować klientowi demo bez konfiguracji." },
        { name: "Mira, DevOps", quote: "Bezpieczne reguły i czysty kod. Deployment na Vercel w jednym kroku." },
      ],
    },
    ctaBar: {
      title: "Gotowy na wersję 2100?",
      subtitle: "Włącz tryb lokalny i zacznij w 30 sekund.",
      button: "Start",
    },
    footer: {
      privacy: "Prywatność",
      terms: "Regulamin",
      credits: "Źródła",
      contact: "Kontakt",
    },
    auth: {
      title: "Zaloguj się do LuminaNet",
      subtitle: "Wybierz Google lub e-mail. Dane pozostają przy Tobie.",
      email: "E-mail",
      password: "Hasło",
      name: "Imię i nazwisko",
      login: "Zaloguj",
      register: "Utwórz konto",
      google: "Kontynuuj z Google",
      switchToRegister: "Nie masz konta? Zarejestruj się",
      switchToLogin: "Masz konto? Zaloguj się",
    },
    dashboard: {
      welcome: "Witaj w panelu",
      sidebar: {
        profile: "Profil",
        uploads: "Przesyłanie",
        library: "Biblioteka",
        settings: "Ustawienia",
      },
      profile: {
        title: "Twój profil",
        subtitle: "Zarządzaj danymi konta i awatarem.",
      },
      uploads: {
        title: "Wyślij plik",
        subtitle: "Obsługujemy mock storage lokalny lub Firebase.",
        helper: "Przeciągnij plik lub wybierz z dysku.",
        upload: "Wyślij",
        description: "Opis (opcjonalnie)",
      },
      library: {
        title: "Moja biblioteka",
        empty: "Brak plików. Dodaj pierwszy upload.",
      },
      settings: {
        title: "Ustawienia",
        theme: "Motyw",
        language: "Język",
        delete: "Usuń konto (stub)",
        referral: "Twój kod polecający",
      },
    },
    share: {
      title: "Udostępniony plik",
      copy: "Kopiuj link",
      notFound: "Nie znaleziono pliku",
    },
    toasts: {
      uploaded: "Plik został zapisany",
      deleted: "Plik usunięty",
      copied: "Skopiowano link",
      signedOut: "Wylogowano",
    },
  },
  en: {
    brand: { name: "LuminaNet", slogan: "Your 2100-ready data space" },
    nav: { product: "Product", pricing: "Pricing", docs: "Docs", login: "Login", dashboard: "Dashboard" },
    hero: {
      title: "Create, store, and share like it's 2100",
      subtitle: "Ultralight data space with instant shares, AI-ready, privacy-first.",
      primaryCta: "Start free",
      secondaryCta: "See demo",
    },
    social: {
      users: "128k creators",
      countries: "35 countries",
      rating: "Rating 4.9/5",
      note: "Reference metrics are fictional."
    },
    values: [
      { title: "Holographic glass", desc: "Transparent UI with micro-animations and premium contrast." },
      { title: "Instant sharing", desc: "One click to generate public share link with referral code." },
      { title: "Zero-trust safety", desc: "Ready-to-use Firestore & Storage rules with safe defaults." },
    ],
    demo: {
      title: "Interactive preview",
      desc: "See your library come alive in real time.",
      uploadSpeed: "Upload boost",
      livePreview: "Live preview",
      mockMode: "Local mock mode",
    },
    steps: {
      title: "How it works",
      items: [
        { title: "Sign in", desc: "Google or email, instant access." },
        { title: "Upload", desc: "Drag, drop, and generate share link." },
        { title: "Share", desc: "Send /share link and collect referrals." },
      ],
    },
    pricing: {
      title: "Simple pricing",
      subtitle: "Flexible plans for solo makers and teams.",
      plans: [
        { name: "Free", price: "$0", features: ["Local mock storage", "Up to 25 files", "Share links"] },
        { name: "Pro", price: "$12", features: ["Firebase Storage", "Encrypted sharing", "Priority support"] },
        { name: "Team", price: "$29", features: ["Team roles", "Share analytics", "Webhook integrations"] },
      ],
    },
    testimonials: {
      title: "User stories",
      items: [
        { name: "Nadia, Product Lead", quote: "LuminaNet looks futuristic and ships in minutes." },
        { name: "Oskar, Motion Designer", quote: "Mock mode let me demo to clients with zero setup." },
        { name: "Mira, DevOps", quote: "Secure rules and clean code. One-step deploy to Vercel." },
      ],
    },
    ctaBar: { title: "Ready for 2100?", subtitle: "Flip local mode and start in 30 seconds.", button: "Start" },
    footer: { privacy: "Privacy", terms: "Terms", credits: "Credits", contact: "Contact" },
    auth: {
      title: "Sign in to LuminaNet",
      subtitle: "Pick Google or email. Your data, your rules.",
      email: "Email",
      password: "Password",
      name: "Full name",
      login: "Sign in",
      register: "Create account",
      google: "Continue with Google",
      switchToRegister: "New here? Create account",
      switchToLogin: "Have an account? Sign in",
    },
    dashboard: {
      welcome: "Welcome back",
      sidebar: { profile: "Profile", uploads: "Uploads", library: "Library", settings: "Settings" },
      profile: { title: "Your profile", subtitle: "Manage account data and avatar." },
      uploads: {
        title: "Upload file",
        subtitle: "Mock storage locally or plug Firebase.",
        helper: "Drag a file or pick from disk.",
        upload: "Upload",
        description: "Description (optional)",
      },
      library: { title: "My library", empty: "No files yet. Add your first upload." },
      settings: {
        title: "Settings",
        theme: "Theme",
        language: "Language",
        delete: "Delete account (stub)",
        referral: "Your referral code",
      },
    },
    share: { title: "Shared file", copy: "Copy link", notFound: "File not found" },
    toasts: { uploaded: "Upload saved", deleted: "Deleted", copied: "Link copied", signedOut: "Signed out" },
  },
};

export type CopyKey = keyof Copy;
