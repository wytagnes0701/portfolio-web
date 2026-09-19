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
# Optional: VITE_YOUTUBE_API_KEY for live channel stats / uploads
npm run dev
```

Open the URL Vite prints (often `http://localhost:5173`; `5174` if 5173 is already in use).

```bash
npm run build    # tsc -b && vite build
npm run preview  # serve the production build
npm run lint     # oxlint
```

`.env.local` is gitignored. Do not commit API keys or the AES key. If you set `VITE_YOUTUBE_API_KEY`, restrict that key to HTTP referrers for `localhost` and the production host.

---

## GitHub Pages

GitHub Actions **does not host an interactive `npm run dev` server**. It builds the static site. A live URL needs **GitHub Pages**.

Intended URL: https://wytagnes0701.github.io/portfolio-web/

This repo is **private**. Free GitHub accounts cannot use Pages on private repos, so deploy will stay unavailable until you either:

- **Settings → General → Danger Zone → Change repository visibility → Public**, then re-run the workflow, or
- upgrade to GitHub Pro.

### Try the build on GitHub (works on a private repo)

1. Open **Actions → Build and deploy Pages** (https://github.com/wytagnes0701/portfolio-web/actions).
2. Open the latest run. When **build** is green, download the **site** artifact (zip of `dist`) and unzip, then `npx vite preview` is not needed — you can also run locally with `npm run preview` after `npm run build`.
3. Optional: **Run workflow** (workflow_dispatch) to rebuild without a new commit.

### After Pages is enabled (public repo or Pro)

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Re-run the workflow. Open the Pages URL from the deploy job.
3. Firebase Console → **Authentication → Settings → Authorized domains** → add `wytagnes0701.github.io`.
4. Restrict `VITE_YOUTUBE_API_KEY` HTTP referrers to include `https://wytagnes0701.github.io/*`.

Workflow: [`.github/workflows/pages.yml`](.github/workflows/pages.yml). Build-time `VITE_*` values come from **Settings → Secrets and variables → Actions**. `VITE_*` is baked into the public JS bundle (same as a local production build).

SPA routes (`/home`, `/youtube`, …) work on Pages because the workflow copies `index.html` to `404.html`.

`public/` files (`/icons/…`, `/images/…`) are resolved with `import.meta.env.BASE_URL`, so they load under `/portfolio-web/` instead of the github.io site root.

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
- `VITE_YOUTUBE_API_KEY` — optional YouTube Data API key (HTTP-referrer restricted). Blank skips live overlay

Also add `localhost` and, for GitHub Pages, `wytagnes0701.github.io` under **Authentication → Settings → Authorized domains**.

### What the site reads

| Source | Keys / paths | Used for |
| --- | --- | --- |
| Auth | email / password | Login gate |
| Remote Config | `master_login`, `youtube_social` | Master fill (AES-CBC, zero IV, UTF-8 key) + YouTube / Instagram / Facebook URLs and handles |
| Realtime Database | `WorkingExperience`, `Education`, `Portfolio`, `YoutubeChannel`, `Contact` | Experience, studies, projects, channel copy, developer contact |
| Storage | cover / gallery paths | Project images |
| YouTube Data API | `VITE_YOUTUBE_API_KEY` | Live subscriber / video / view counts and long-form uploads (Shorts dropped). Blank or failed request uses RTDB fallbacks |

Firebase Console string fields are single-line. Typed `\n` (or JSON `"line1\nline2"`) is decoded into line breaks.

Stop using Remote Config `master_account_info`; developer contact is RTDB `Contact`.

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
| `#videos` | YouTube channel card, pillars + 熱門標籤, latest videos, **更多** to `/youtube` |
| `#contact` | Developer and YouTuber contact columns (icon + label on every method) |

Hero is a notebook spread: name, tagline, CTAs (work / experience / education / channel), and stats for **projects / roles / studies** (not subscriber counts).

### Portfolio

- `/projects` — overlay cards, filter by year and project type, removable filter chips, empty state.
- `/project/:itemId` — description, further info, skill icons, embedded YouTube, gallery + icon-list dialogs.
- `/gallery/:itemId` — thumbnail grid; tap to enlarge.

Working experience is sorted **newest first**, including roles inside the same company (`src/data/experience.ts`). Category labels come from `EXPERIENCE_TABS` (`fintech`, `music education`, `event`, `media`).

### YouTube

- Channel `site-card`: Android channel avatar (`public/images/youtube_icon.png`), Firebase `YoutubeChannel` name / handle / slogan / description, live-or-fallback subscriber / video / view / joined stats.
- Two tag styles (not the same chip):
  - **Pillars** (`行程規劃`, `住宿評測`, `交通攻略`, `旅費分析`) — rounded rectangles, techo blue. Display-only.
  - **熱門標籤** — price-tag shape (pointed left + punch hole), morandi pink; selected on `/youtube` is washi coral.
- Home `#videos` tags are display-only. `/youtube` price tags filter the merged video list (toggle off to show all). Empty tag: `呢個標籤暫時未有對應影片`.
- Under **Latest videos**, the CTA is **更多** (`/youtube`). The **前往頻道** pill stays only inside the channel `site-card` (opens the YouTube URL).
- Live overlay (optional API key): newest long-form uploads first (up to 50), Shorts ≤ 3 minutes dropped. Matching RTDB video IDs keep tags; new uploads appear in the unfiltered list. Missing key or API miss → RTDB `Videos` and fallback counts. Hidden subscribers keep the RTDB count.
- `/youtube` overlay player, social rows from `youtube_social`, collab invite + `YoutubeChannel.CollabEmail` + `Contact.WhatsApp`.

### Contact

Two groups, shared data in `src/data/contacts.ts`. Every method shows **icon + label** (e.g. envelope + Email), then the value.

- **Developer** (RTDB `Contact`): email, WhatsApp, LinkedIn, Web CV.
- **YouTuber**: YouTube, collab email, Instagram, Facebook (`youtube_social` + `YoutubeChannel.CollabEmail`).
- YouTube collab on `/youtube` also includes WhatsApp from `Contact`.

Contact glyphs that were copied white from Android (`ic_youtube`, `ic_instagram`, `ic_facebook`, `ic_message`, `ic_web`) are retinted to ink `#3d3d3d` so they read on cream cards.

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
| Techo blue / purple | `#d2e5ee` / `#a59aca` | Muted buttons, **pillar tags** |
| Washi coral | `#e2877b` | Selected 熱門標籤 price tags |
| Morandi pink / sage / yellow | tape accents; **price tags** use pink |

**Type:** Caveat (eyebrows), Zen Kaku Gothic New (headings), Noto Sans TC (body).

**Chrome:** sticky frosted header, `site-card` cream cards with soft shadow, gold/ghost/soft pill buttons, polaroid photo, washi corners, notebook gutter line.

### UI kit

Pages compose shared pieces instead of one-off markup.

**Primitives** (`src/components/ui.tsx`): `Card`, `Pill`, `Badge`, `Field`, `Select`, `Tabs`, `Stat` / `StatRow`, `Tag` / `TagList` (`pillar` rounded rect vs `price` hang-tag), `ContactIcon`, `Polaroid`, `MediaCard` / `MediaGrid`, `ContactGroup`, `TimelineCard`, `Overlay`, `SkillIcon`, and related layout helpers.

Price-tag and pillar styles live in `src/index.css` (`.tag-price`, `.tag-pillar`).

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
  lib/            class names, mailto / WhatsApp / https, RTDB newline decode
  pages/          splash, login, home, projects, detail, gallery, experience, education, youtube, about, contact
public/           icons, images (including Android `youtube_icon.png`), favicon
```

Copy lives in `src/data/strings.ts`. Skill and contact icons live in `public/icons/`; raster marks (channel avatar, polaroid, empty state) are in `public/images/`.

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
4. **Two contact identities** — Developer (RTDB `Contact`) vs YouTuber (`youtube_social` + channel collab email).
5. **Hero stats** — projects / roles / studies, not YouTube subscriber counts. Education and Channel CTAs on the notebook; no gold YouTube pill in the header.
6. **Experience order** — descending by month/year, including multiple roles at one company.
7. **YouTube from Firebase** — `YoutubeChannel` + `youtube_social` + live long-form overlay; `/youtube` tag filter; collab WhatsApp from `Contact`. Heart glyphs removed (section titles, polaroid, footer now “Made from Hong Kong”).
8. **UI consolidation** — repeated cards, pills, stats, contacts, timelines, and media grids extracted into `ui.tsx` / `sections.tsx`. Unused sticker/sticky-note components removed.
9. **Login passcode** — visiting `/login` after refresh fetches Remote Config before validating; decrypt result is trimmed; missing config is distinct from a wrong code.
10. **Icon list** — Material-style white glyphs (Android, web, video, live TV) retinted to ink so they show on cream cards.
11. **Scroll** — entering another page always starts at the top; in-page home hashes still scroll to the section.
12. **Channel avatar** — YouTube `site-card` uses the Android drawable `youtube_icon.png`, not the about-me polaroid.
13. **Pillars vs 熱門標籤** — two tag UIs: rounded-rect techo-blue pillars vs price-tag 熱門標籤 (pink / coral when selected).
14. **Contact icons** — every contact method is `icon + label`; social/WhatsApp/Web SVGs retinted to ink.
15. **Latest videos CTA** — Home `#videos` under the grid is **更多** → `/youtube`. **前往頻道** remains only on the channel card.
16. **GitHub Pages** — Actions builds with repo secrets and deploys to `https://wytagnes0701.github.io/portfolio-web/`.

---

## Notes

- This repo does not modify the Android app.
- Remote Config and RTDB payloads are treated as untrusted JSON and parsed in `PortfolioContext`.
- Do not commit `.env.local` or paste production secrets into issues or docs.
