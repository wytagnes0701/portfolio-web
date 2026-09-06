# Agnes Portfolio website

Personal portfolio site for Agnes Wong (Hong Kong software engineer; YouTube channel 乾物女-Ting-). It is a **desktop-first website**, not a phone-app clone.

Content for work, education, and projects comes from the same Firebase project as the Android app (`agnes-profile`). The Android repo stays separate and is not part of this codebase.

Site version: **1.0.0**

---

## Stack

| Layer | Choice |
| --- | --- |
| App | Vite 8, React 19, TypeScript |
| Routing | React Router 7 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Data | Firebase Auth, Realtime Database, Storage, Remote Config |
| Other | `qrcode.react` for contact QR codes |

---

## Run locally

```bash
npm install
cp .env.example .env.local
# Fill Firebase Web app values (see Firebase below)
npm run dev
```

Open the URL Vite prints (often `http://localhost:5173`; `5174` if 5173 is already in use).

```bash
npm run build    # tsc -b && vite build
npm run preview  # serve the production build
npm run lint     # oxlint
```

`.env.local` is gitignored. Do not commit API keys or the AES key.

---

## Firebase

Create a **Web** app in Firebase Console for project `agnes-profile` and put the config in `.env.local`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL` — `https://agnes-profile-default-rtdb.firebaseio.com`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID` — Web app id, not the Android id
- `VITE_AES_KEY` — same value as the Android AES key

Also add `localhost` under **Authentication → Settings → Authorized domains**.

### What the site reads

| Source | Keys / paths | Used for |
| --- | --- | --- |
| Auth | email / password | Login gate |
| Remote Config | `master_login`, `master_account_info` | Master fill + developer contact (AES-CBC, zero IV, UTF-8 key) |
| Realtime Database | `WorkingExperience`, `Education`, `Portfolio` | Experience, studies, projects |
| Storage | cover / gallery paths | Project images |

YouTube videos, tags, and social links are **static** in `src/data/youtube.ts`, not Firebase.

---

## Features

### Auth and session

- Splash (`/`) signs out, fetches Remote Config, then goes to login.
- Login (`/login`) is email + password (8+ characters). No biometrics.
- **Master** opens a passcode dialog. A valid code fills the stored master credentials and signs in. Login always fetches config first so a refresh on `/login` still works.
- Logged-in pages sit behind `ProtectedLayout`. Missing session redirects to `/login`.
- Footer shows the signed-in email and a logout confirm dialog.

### Home (`/home`)

Single long page with hash sections. Top nav jumps to these anchors:

| Hash | Section |
| --- | --- |
| `#about` | Polaroid + about copy |
| `#work` | Featured projects (first 6) |
| `#experience` | Working experience (tabbed by category) |
| `#education` | Education list |
| `#videos` | YouTube channel card, tags, latest videos |
| `#contact` | Developer and YouTuber contact columns |

Hero is a notebook spread: name, tagline, CTAs (work / experience / education / channel), and stats for **projects / roles / studies** (not subscriber counts).

### Portfolio

- `/projects` — overlay cards, filter by year and project type, removable filter chips, empty state.
- `/project/:itemId` — description, further info, skill icons, embedded YouTube, gallery + icon-list dialogs.
- `/gallery/:itemId` — thumbnail grid; tap to enlarge.

Working experience is sorted **newest first**, including roles inside the same company (`src/data/experience.ts`). Category labels come from `EXPERIENCE_TABS` (`fintech`, `music education`, `event`, `media`).

### YouTube

- Channel card: avatar, handle `@TING.CHANNEL.777`, description, subscriber / video / view / joined stats.
- **熱門標籤** are display-only (no filtering).
- `/youtube` plays videos in an overlay player, plus social and collab rows.
- Collab email: `ting.channel.777@gmail.com`.

### Contact

Two groups, shared data in `src/data/contacts.ts`:

- **Developer** (from Remote Config account info): email, WhatsApp, LinkedIn, Web CV.
- **YouTuber**: YouTube, collab email, Instagram, Facebook.

On `/contact`, LinkedIn and Web CV offer **QR code** or **open in browser**.

### Navigation behaviour

- New route with no hash: scroll to the top of the page.
- Home hashes (`/home#education`, etc.): smooth-scroll to that section.

---

## Design

Website look: cream desk, notebook hero, gold pills, overlay media cards. Typography and gold are aligned with a stationery / 手帳 feel, not a phone UI.

### Tokens (`src/index.css`)

| Token | Value | Use |
| --- | --- | --- |
| Paper | `#faf8f5` | Page / header frost |
| Desk | `#f3eee6` | Background |
| Gold | `#c4a882` | Primary pills, name, contact values |
| Ink | `#3d3d3d` | Body text |
| Nav | `#7d8e95` | Secondary text, ghost pills |
| Techo blue / purple | `#d2e5ee` / `#a59aca` | Muted buttons, chips |
| Morandi pink / sage / yellow | tape accents on notebook and about card |

**Type:** Caveat (eyebrows), Zen Kaku Gothic New (headings), Noto Sans TC (body).

**Chrome:** sticky frosted header, `site-card` cream cards with soft shadow, gold/ghost/soft pill buttons, polaroid photo, washi corners, notebook gutter line.

### UI kit

Pages compose shared pieces instead of one-off markup.

**Primitives** (`src/components/ui.tsx`): `Card`, `Pill`, `Badge`, `Field`, `Select`, `Tabs`, `Stat` / `StatRow`, `Tag` / `TagList`, `Polaroid`, `MediaCard` / `MediaGrid`, `ContactGroup`, `TimelineCard`, `Overlay`, `SkillIcon`, and related layout helpers.

**Blocks** (`src/components/sections.tsx`): `Notebook`, `AboutCard`, `ExperiencePanel`, `EducationList`, `ChannelCard`, `VideoPlayer`.

Dialogs (`TechoDialog`, `PassCodeDialog`, `LoadingOverlay`) reuse `Overlay` + `Card`.

---

## Source layout

```
src/
  App.tsx
  components/     Layout, header/footer, dialogs, ui kit, page blocks
  data/           Firebase, snapshot, strings, skills, YouTube, contacts, experience sort
  hooks/          ScrollOnRouteChange
  lib/            class names + mailto / WhatsApp / https helpers
  pages/          splash, login, home, projects, detail, gallery, experience, education, youtube, about, contact
public/           icons, images, favicon
```

Copy lives in `src/data/strings.ts`. Skill icons live in `public/icons/`; a few raster marks are in `public/images/`.

---

## Routes

| Path | Page |
| --- | --- |
| `/` | Splash |
| `/login` | Login |
| `/home` | Home (hash sections) |
| `/projects` | Project list |
| `/project/:itemId` | Project detail |
| `/gallery/:itemId` | Gallery |
| `/experience` | Working experience |
| `/education` | Education |
| `/youtube` | Channel + videos |
| `/about` | About |
| `/contact` | Contact |
| `/more` | Menu (about / contact) |
| `*` | Redirect to splash |

---

## Changes

Product and UI decisions since the site was scaffolded:

1. **Website, not a phone shell** — top nav, desk background, notebook hero. Login gate kept; biometrics not ported.
2. **Stationery look** — cream desk, gold `#c4a882`, Caveat eyebrows, Noto Sans TC / Zen Kaku Gothic New, overlay project cards, gold pills. Hero decoration is washi strips only (no travel stamps or sakura on the notebook).
3. **Home is the full story** — About, Portfolio, Working Experience, Education, YouTube, and Contact are in the nav and on `/home`.
4. **Two contact identities** — Developer (Firebase account info) vs YouTuber (channel, Instagram, Facebook, collab email).
5. **Hero stats** — projects / roles / studies, not YouTube subscriber counts. Education and Channel CTAs on the notebook; no gold YouTube pill in the header.
6. **Experience order** — descending by month/year, including multiple roles at one company.
7. **YouTube tags** — moved into the channel card; display-only (no filter). Heart glyphs removed (section titles, polaroid, footer now “Made from Hong Kong”).
8. **UI consolidation** — repeated cards, pills, stats, contacts, timelines, and media grids extracted into `ui.tsx` / `sections.tsx`. Unused sticker/sticky-note components removed.
9. **Login passcode** — visiting `/login` after refresh fetches Remote Config before validating; decrypt result is trimmed; missing config is distinct from a wrong code.
10. **Icon list** — Material-style white glyphs (Android, web, video, live TV) retinted to ink so they show on cream cards.
11. **Scroll** — entering another page always starts at the top; in-page home hashes still scroll to the section.

---

## Notes

- This repo does not modify the Android app.
- Remote Config and RTDB payloads are treated as untrusted JSON and parsed in `PortfolioContext`.
- Do not commit `.env.local` or paste production secrets into issues or docs.
