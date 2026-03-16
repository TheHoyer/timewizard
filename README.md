# TimeWizard ⏳✨

Inteligentny planer zadań, który optymalizuje Twój harmonogram na podstawie priorytetów, deadline'ów i bloków dostępności.

## 🚀 Funkcje

- ✅ Inteligentne planowanie zadań (algorytm greedy z wagami)
- ✅ Kategorie i priorytety zadań
- ✅ Definiowanie bloków dostępności
- ✅ Automatyczne generowanie harmonogramu
- ✅ AI priorytetyzacja z fallbackiem regułowym
- ✅ Wspólna wersja aplikacji dla wszystkich użytkowników (tymczasowo)
- ✅ Autoryzacja (email + hasło)
- ✅ Responsywny design

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS + Headless UI
- **Database:** PostgreSQL (Neon/Supabase)
- **ORM:** Prisma
- **Auth:** NextAuth.js v5
- **Payments:** Stripe (integracja w trakcie)
- **Email:** Resend

## 📦 Instalacja

### 1. Sklonuj repozytorium

```bash
git clone https://github.com/yourusername/timewizard.git
cd timewizard
```

### 2. Zainstaluj zależności

```bash
npm install
```

### 3. Skonfiguruj zmienne środowiskowe

```bash
cp .env.example .env
```

Uzupełnij wartości w pliku `.env`:
- `DATABASE_URL` - połączenie z PostgreSQL
- `NEXTAUTH_SECRET` - wygeneruj: `openssl rand -base64 32`

Rozdzielenie środowisk (ważne):
- Lokalnie (`.env`): `NEXTAUTH_URL=http://localhost:3000`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- Produkcja (Vercel): `NEXTAUTH_URL=https://timewizard.vercel.app`, `NEXT_PUBLIC_APP_URL=https://timewizard.vercel.app`
- Nie używaj URL produkcyjnego w lokalnym `.env`, bo callback logowania będzie kierował na złą domenę.

Opcjonalnie (AI priorytetyzacja):
- `AI_PRIORITY_API_URL`, `AI_PRIORITY_API_KEY`, `AI_PRIORITY_MODEL`

Opcjonalnie (monitoring błędów):
- `MONITORING_WEBHOOK_URL`
- `MONITORING_WEBHOOK_HEADERS` (JSON string)

Jeśli zmienne AI nie są ustawione, aplikacja działa dalej na fallbacku regułowym.

### AI na Vercel

Priorytetyzacja działa w modelu hybrydowym:
1. próba wywołania AI (OpenAI-compatible endpoint),
2. timeout/retry,
3. fallback na deterministiczny scoring (zawsze dostępny).

Dzięki temu aplikacja działa stabilnie także po przekroczeniu limitu darmowego API.

### 4. Zainicjuj bazę danych

```bash
npx prisma generate
npx prisma db push
```

### 5. Uruchom serwer deweloperski

```bash
npm run dev
```

Aplikacja będzie dostępna pod `http://localhost:3000`

## 📁 Struktura projektu

```
timewizard/
├── .github/
│   └── workflows/        # GitHub Actions (CI/CD)
├── prisma/
│   └── schema.prisma     # Model bazy danych
├── src/
│   ├── app/
│   │   ├── (auth)/       # Strony logowania/rejestracji
│   │   ├── (dashboard)/  # Główna aplikacja
│   │   └── api/          # API Routes
│   ├── components/
│   │   ├── layout/       # Sidebar, Header
│   │   ├── tasks/        # Komponenty zadań
│   │   └── ui/           # Podstawowe komponenty UI
│   └── lib/
│       ├── auth/         # Konfiguracja NextAuth
│       ├── db/           # Prisma client
│       ├── scheduling/   # Algorytm harmonogramu
│       ├── utils/        # Helpers
│       └── validations/  # Schematy Zod
├── .env.example
├── package.json
└── README.md
```

## 🔧 Skrypty

```bash
npm run dev        # Uruchom serwer deweloperski
npm run build      # Zbuduj produkcję
npm run start      # Uruchom produkcję
npm run lint       # Sprawdź ESLint
npm run typecheck  # Sprawdź typy TypeScript
npm run db:check   # Szybki test połączenia z bazą
npm run test       # Testy flow logiki (Vitest)
npm run test:coverage # Raport pokrycia testów
npm run test:smoke # Smoke-check po deployu (wymaga SMOKE_BASE_URL)
npm run format     # Formatuj kod (Prettier)
```

Przykład smoke-check po deployu:

```bash
SMOKE_BASE_URL=https://twoja-domena.vercel.app npm run test:smoke
```

## 📊 Model bazy danych

Główne tabele:
- `users` - użytkownicy z informacjami o planie
- `categories` - kategorie zadań
- `tasks` - zadania z priorytetami i deadline'ami
- `availability_blocks` - bloki dostępności użytkownika
- `scheduled_tasks` - wygenerowany harmonogram
- `achievements` - odznaki (gamifikacja)

## 🔐 API Endpoints

### Autoryzacja
- `POST /api/auth/*` - NextAuth.js endpoints

### Zadania
- `GET /api/tasks` - lista zadań
- `POST /api/tasks` - dodaj zadanie
- `PUT /api/tasks/:id` - edytuj zadanie
- `DELETE /api/tasks/:id` - usuń zadanie

### Kategorie
- `GET /api/categories` - lista kategorii
- `POST /api/categories` - dodaj kategorię

### Harmonogram
- `GET /api/schedule` - pobierz harmonogram
- `POST /api/schedule` - generuj harmonogram

### Dostępność
- `GET /api/availability` - pobierz bloki
- `PUT /api/availability` - ustaw bloki

### Monitoring
- `POST /api/monitoring/error` - raportowanie błędów klienta/serwera

## 💳 Plany cenowe

Tymczasowo wszyscy użytkownicy mają ten sam zestaw funkcji i brak limitów (do czasu wdrożenia płatności Stripe).

| Funkcja | Free | Pro (39 zł/mies) | Business (79 zł/mies) |
|---------|------|------------------|----------------------|
| Zadania | ∞ | ∞ | ∞ |
| Kategorie | ∞ | ∞ | ∞ |
| Google Calendar | ❌ | ✅ | ✅ |
| AI Scheduling | ❌ | ✅ | ✅ |
| Team Workspaces | ❌ | ❌ | ✅ |

## 🚢 Deployment

### Vercel (Rekomendowane)

1. Połącz repo z Vercel
2. Ustaw zmienne środowiskowe
3. Deploy!

### Docker

```bash
docker build -t timewizard .
docker run -p 3000:3000 timewizard
```

## 📝 Roadmap

- [x] MVP: CRUD zadań + harmonogram + auth
- [ ] v1.1: Drag & drop + email reminders
- [ ] v1.2: Stripe + Google Calendar (w trakcie)
- [ ] v2.0: AI scheduling + Team workspaces

## 📄 Licencja

MIT © 2026 TimeWizard

---

Zbudowane z ❤️ przy użyciu Next.js i TailwindCSS
