# Hero Girls Club - نادي البطلات الصغيرات

A React + Vite + Express web application for a children's educational platform, built with AI features for chat, design, and research.

## Architecture

- **Frontend**: React 19 + Vite + TailwindCSS 4 + React Router
- **Backend**: Express server (`server.ts`) serving as both API and Vite dev middleware
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **AI**: Google Gemini API and/or OpenAI API (whichever key is configured)
- **Email**: Nodemailer via Gmail SMTP

## How it runs

The single `npm run dev` command starts `tsx server.ts`, which:
1. Spins up an Express server on port 5000
2. In development, mounts Vite as middleware for HMR and frontend serving
3. In production (`NODE_ENV=production`), serves the built `dist/` folder

## Environment Variables

Set these as secrets in the Replit environment:

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Recommended | Google Gemini API key for AI features |
| `OPENAI_API_KEY` | Optional | OpenAI API key (used instead of Gemini if set) |
| `OPENAI_MODEL` | Optional | OpenAI model name (default: `gpt-4o-mini`) |
| `EMAIL_USER` | Optional | Gmail address for sending emails |
| `EMAIL_PASS` | Optional | Gmail app password for sending emails |
| `ADMIN_EMAIL` | Optional | Admin email for registration notifications |

## Key Files

- `server.ts` — Express + Vite dev server with all API routes
- `vite.config.ts` — Vite configuration (port 5000, host 0.0.0.0, allowedHosts: true)
- `src/` — React frontend source
- `src/App.tsx` — Root app component with routing
- `src/firebase.ts` — Firebase config
- `api/` — Vercel-style API route files (not used in Replit; Express in server.ts handles routes)
- `firestore.rules` — Firebase security rules

## Design System (Redesigned for Replit)

**Palette (Jewel Tone Dark Theme):**
- Background: `from-fuchsia-950 via-violet-900 to-indigo-950` deep gradient
- Cards: `bg-white/10 backdrop-blur-xl border border-white/15` dark glass
- Headings: `text-white` / `text-white/70` for muted text
- Accents: hot pink (#ec4899), violet (#8b5cf6), gold (#fbbf24), sky blue (#38bdf8), emerald (#10b981)
- Inputs: `bg-white/10 border border-white/20 text-white placeholder:text-white/40`

**Key UI Files:**
- `src/pages/LandingPage.tsx` — Login/registration page (fully redesigned)
- `src/pages/ChildDashboard.tsx` — Main child dashboard (fully redesigned)
- `src/index.css` — Global styles with jewel-tone design tokens
- `src/services/aiService.ts` — Lazy Gemini client initialization (prevents browser crash when key absent)

## Replit Migration Notes

- Port changed from 3000 → 5000 (Replit webview requirement)
- Vite server set to `host: '0.0.0.0'` and `allowedHosts: true` for Replit proxy
- Hardcoded email credentials removed; now read exclusively from environment variables
- OpenAI client is lazily initialized only when `OPENAI_API_KEY` is set
- Gemini client (aiService.ts) is also lazily initialized to prevent browser-side crash on load
