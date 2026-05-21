# Takenlijst

Een persoonlijke takenlijst-app met AI-samenvatting, gebouwd met Next.js, TypeScript en Tailwind CSS.

![status](https://img.shields.io/badge/status-live-brightgreen) ![stack](https://img.shields.io/badge/stack-Next.js%20%2F%20TypeScript%20%2F%20Tailwind-blue)

## Functies

- **Accounts** — registreren en inloggen met e-mail en wachtwoord
- **Taken beheren** — toevoegen, afvinken en verwijderen
- **Urgent markeren** — markeer taken als urgent met één klik
- **Alleen jouw taken** — Row Level Security via Supabase
- **Persistent** — taken blijven bewaard na het sluiten van de browser
- **AI samenvatting** — server-side samenvatting via Claude, met focus-tip

## Stack

| Onderdeel | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) |
| Taal | TypeScript |
| Styling | Tailwind CSS |
| Auth & Database | Supabase |
| AI | Anthropic Claude (claude-sonnet-4) |

## Project structuur

```
app/
├── page.tsx               # redirect naar /login of /dashboard
├── login/page.tsx         # inlog- en registratiepagina
├── dashboard/page.tsx     # takenlijst (server component)
├── api/
│   ├── ai-summary/route.ts  # AI samenvatting endpoint
│   └── auth/route.ts        # auth helpers
components/
└── TaskBoard.tsx          # volledige client-side takenlijst
lib/
├── supabase/client.ts     # browser Supabase client
├── supabase/server.ts     # server Supabase client
└── types.ts               # TypeScript types
```

## Lokaal draaien

```bash
git clone https://github.com/keesvndrhoeven/takenlijst
cd takenlijst
npm install
```

Maak een `.env.local` aan:

```env
NEXT_PUBLIC_SUPABASE_URL=jouw_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=jouw_supabase_anon_key
ANTHROPIC_API_KEY=jouw_anthropic_api_key
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployen naar Vercel

1. Push naar GitHub
2. Ga naar [vercel.com/new](https://vercel.com/new) en importeer de repo
3. Voeg de environment variables toe:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `ANTHROPIC_API_KEY`
4. Klik **Deploy**

## Database

```sql
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  completed boolean default false not null,
  urgent boolean default false not null,
  created_at timestamptz default now() not null
);

alter table public.tasks enable row level security;
```

## Licentie

MIT
