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
- `src/pages/HeroHouse.tsx` — Interactive hero house with 4 rooms, 35+ furniture items, wardrobe panel, auto-save
- `src/index.css` — Global styles with jewel-tone design tokens
- `src/services/aiService.ts` — Lazy Gemini client initialization (prevents browser crash when key absent)

## HeroHouse Features (بيت البطلة)

- **4 Rooms**: bedroom, living room, garden, kitchen — each with unique wallpaper/floor defaults
- **35+ Furniture items** organized in 5 categories (bedroom, living, garden, kitchen, toys)
- **8 wallpaper + 8 floor** options per room, saved per room in Firestore
- **Wardrobe panel**: 4 tabs (dresses 10, hair 8, accessories 8, skin colors 6), live avatar preview, save to Firestore
- **Drag & resize furniture**: drag to position, scale up/down, rotate, delete with hover controls
- **Debounced auto-save**: 2000ms (2s) debounce coalesces rapid furniture changes into one Firestore write; "✅ تم الحفظ" flash indicator on commit
- **Magic Decorate**: AI-powered room decoration using Gemini API
- **Action bar**: 10 fun social actions (tea, music, dance, heart, etc.)
- **Group chat widget** (`house_chat` Firestore collection): real-time shared chat for ALL visitors in the same house (replaces per-visit chat). Shows visitor count badge and avatar strip
- **Tic-tac-toe** game for social visits
- **📺 TV (YouTube embed)**: Click any 📺 furniture item to open the magic TV panel; host sets a YouTube URL, visitors watch the video
- **🎵 Background music**: Host sets a YouTube URL for background music; music toggle button (🔊/🔇) appears for all visitors
- **Group visitor avatars**: All active visitors shown as character dolls in the room simultaneously
- **🎥 Jitsi group video/audio call**: Host clicks Video button → `house_sessions.callActive = true` → Jitsi iframe embeds at `meet.jit.si/NadiBatlat-{hostUid}`; all visitors see pulsing join button; host ends call for everyone
- **👥 Multi-invite panel**: Host selects multiple friends from their friends list and sends parallel visit_requests to all selected friends at once
- **Auto-house at registration**: `houseConfig` is created at signup in LandingPage + ParentDashboard so every user has a house from day one
- **Auto-initialize existing users**: HeroHouse detects missing `houseConfig` and silently writes defaults on first visit
- **Data model**:
  - Room data (furniture, wallpaper, floor) saved to `children_profiles/{hostUid}.houseConfig.rooms.{roomId}.*`
  - Avatar/wardrobe data saved to `children_profiles/{activeChildUid}.avatar`
  - `houseConfig.tvUrl` — YouTube URL/ID for the in-room TV
  - `houseConfig.bgMusic` — YouTube URL/ID for background ambient music
  - `house_sessions/{hostUid}` — live session: hostUid, hostHeroName, hostAvatar, `visitors: Record<uid, HouseVisitor>`, `callActive: boolean`, `updatedAt`
  - `house_chat/{auto}` — group chat: houseId, senderId, senderHeroName, senderAvatar, text, timestamp
  - Note: legacy `houseConfig.{furniture,theme,wallpaper,floor}` fields are preserved for backward compat; new code reads exclusively from `houseConfig.rooms.*`
  - Profiles without `houseConfig.rooms` fall back to room-specific CSS defaults automatically

## مدينة البطلات — City View (VillageView.tsx)

- Real-time grid of all approved children's houses
- Loads `children_profiles` + `house_sessions` for live visitor counts and call indicators
- Online badges (via `online_status` collection)
- Click any house → navigate to `/house/view_{uid}` to visit
- Own house banner shows visitor count + avatar chips when guests are present

## عالم الألعاب — Games

### KidsGamesPage (`/games`)
19-game card grid with gradient icons, Arabic titles, badge labels (skill/speed/logic…).
All games are either local React-built games or MIT-licensed HTML5 games served from `public/games/`.

### MariaGamesView (`/maria-games`)
Poki-style dark grid interface with category tabs (أكشن، مغامرات، سيارات، بنات، ألغاز، ذكاء…) and search.
Clicking a game navigates to its React route (no iframe modal). Shows 19 real games.

### Transferred MIT Games (all in `public/games/`)
| Folder | Game | Source |
|--------|------|--------|
| `snake/` | الثعبان الجائع | RabiRoshan/snake_game |
| `tetris/` | تتريس | llop/classic-tetris-js |
| `flappy/` | الطائر الرشيق | Antonious-Awad/flappy-bird |
| `2048/` | لعبة 2048 | Gamesflow/2048-game |
| `breakout/` | تكسير الطوب | igameproject/Breakout |
| `whack/` | اضرب الخلد! | Anantram-developer/Whack-A-Mole- |
| `pong/` | بينج بونج | ramazancetinkaya/ping-pong-game |
| `racer/` | سباق السيارات | Steve-IX/Speed_Racer_Game |
| `platformer/` | مغامرة البطلة | ZeroDayArcade/HTML5_Platformer |
| `minesweeper/` | كاشفة الألغام | mayankrajendrat/minesweeper |
| `shooter/` | الطائرة المقاتلة | mikkun/evade-and-destroy |
All HTML files arabized (lang=ar, Arabic titles/UI text).

### GameIframe.tsx (`src/pages/GameIframe.tsx`)
Generic iframe wrapper used by all 11 MIT games. Props: title, subtitle, emoji, src, bgFrom, bgTo, headerBg, textColor.
Routes: `/games/{snake,tetris,flappy,2048,breakout,whack,pong,racer,platformer,minesweeper,shooter}`

## عالم البطلات الكبير — Zone Fixes

- **"ركن الاكتشاف"** now navigates to `/values?cat=discovery`; ValuesView reads `?cat` URL param and auto-selects the discovery tab with a distinct title/icon
- **"أنشطة المنزل"** now navigates to `/home-activities` — a new page (HomeActivities.tsx) with 12 family activity cards, category filter, progress bar, and point tracking stored in localStorage
- **MagicAcademy**: Auto-seeds 8 default missions (reading, math, art, kindness, etc.) from `DEFAULT_MISSIONS` array when a child has zero missions in Firestore; uses `useRef` to prevent duplicate seeding
- **StarsPage**: Shows current child's points in the header; highlights the child's own row with a gold ring and "أنتِ ✨" badge; shows a separate card if the child is outside top 10

## Replit Migration Notes

- Port changed from 3000 → 5000 (Replit webview requirement)
- Vite server set to `host: '0.0.0.0'` and `allowedHosts: true` for Replit proxy
- Hardcoded email credentials removed; now read exclusively from environment variables
- OpenAI client is lazily initialized only when `OPENAI_API_KEY` is set
- Gemini client (aiService.ts) is also lazily initialized to prevent browser-side crash on load
