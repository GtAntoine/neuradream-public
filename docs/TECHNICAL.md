# NeuraDream: technical documentation

## Overview

NeuraDream is a web dream journal. A dream is captured (typed or dictated), then analysed by an AI. For each aspect of the dream, the AI proposes 2 to 3 readings, each taking a different angle and carrying an estimated confidence score. The user circles the readings that resonate with them and crosses out the others. These verdicts are sent as personal context to the next analyses: the learning loop the case study describes is actually implemented.

## Stack

| Layer | Choice |
|---|---|
| UI | React 19, TypeScript strict, Tailwind CSS 4, React Router 7 |
| Build | Vite |
| Local data | IndexedDB via Dexie (`dexie-react-hooks` for live queries) |
| AI | Supabase Edge Functions (Deno) → OpenAI (Chat Completions with Structured Outputs, Images API) |
| Hosting | Netlify (static SPA) |

## Data flow

1. **Capture** (`/`). A draft is autosaved to localStorage. Dictation uses the Web Speech API (`useDictation`). Optional tags: lucid, nightmare, recurring, emotion on waking, sleep quality.
2. **Develop.** The dream is saved to IndexedDB, then `runAnalysis` calls `analyze-dream` with the last 24 non-neutral verdicts (`learningContext`). The response (title, mood, symbols, aspects × readings) is stored with `verdict: 'neutral'`. `generate-dream-image` then runs in the background, and the image is stored as a Blob.
3. **Verdict.** `setVerdict` performs an atomic read-modify-write, and the "Ce que NeuraDream a appris de toi" panel recomputes from the journal.
4. **Symbols.** This is a personal dictionary built from keywords (`buildSymbolIndex`). `analyze-theme` explains a symbol and relates it to excerpts from the user's own dreams, and the result is cached in `themes`.
5. **Insights.** Statistics are computed on the client (`computeInsights`). The overall analysis (`analyze-global`, at least 3 analysed dreams) is driven by the verdicts.

## Security and cost

- The OpenAI key exists only as a Supabase secret.
- Rate limiting goes through `ai_usage` and `consume_ai_quota`, with two quotas: per salted IP hash and per day, plus a global daily cap per function. RLS is enabled with no policies, so only the service role can access the table.
- No dream content is ever stored server-side.
- CORS is restricted to `ALLOWED_ORIGINS` and localhost.

## Deploying the backend

```bash
supabase link --project-ref <ref>
supabase db push
supabase secrets set OPENAI_API_KEY=... ALLOWED_ORIGINS=https://<site>.netlify.app RATE_LIMIT_SALT=<random>
supabase functions deploy analyze-dream generate-dream-image analyze-theme analyze-global
```

Then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Netlify.

## Demo

On first visit, `src/demo/seed.ts` installs 9 synthetic dreams that are already analysed, with verdicts. The UI labels this as a demo journal and offers two actions: "Commencer mon journal" removes the demo dreams, and "Restaurer la démo" puts them back. The images are generated once with `scripts/seed-demo-images.mjs`, and their provenance is written to `.impeccable/provenance/`.
