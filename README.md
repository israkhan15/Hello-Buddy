# Hello Buddy App Prototype

A wellness and personal growth app with study tools, speech practice, mindfulness features, and community support.

**Live site:** https://israkhan15.github.io/Hello-buddy-app/

Originally exported from Figma Make: https://www.figma.com/design/Bo9AnhHZXiDzszF9Duk58T/Hello-Buddy-App-Prototype

---

## Features

### 🏠 Dashboard
Quick access to all sections, a daily motivational quote, and an activity summary (streak, level, activities logged) pulled from your real usage.

### 📚 Study Mode
- **Study Planner** — add, prioritize, and complete tasks
- **Focus Mode** — Pomodoro-style focus timer
- **Reminders** — set recurring reminders by time and day. When one fires, a full-screen popup with a looping ringtone appears and stays on screen until you tap **Decline**.

### 💬 Communication Booster
- **Speech Analysis** — uses your microphone with live browser speech recognition. Shows a live transcript, real-time volume meter, and word count as you speak. After stopping, you get a full breakdown: clarity score, pace (WPM), filler word count and breakdown, pause detection, and speech-recognition confidence. Falls back to a typing mode if your browser doesn't support live recognition or mic access is denied.
- **Role-Play** — practice scenarios (job interviews, public speaking, conflict resolution, etc.) with guided videos
- **Voice Training** — curated videos on speaking clarity, confidence, and fluency

### 🌸 Emotional Wellness
- **Mindfulness** — breath-holding challenge, calming music
- **CBT Tools** — thought/reframe journal with mood tracking
- **Sleep** — sleep tracker and sleep sounds/timer
- **Activity** — guided exercises and stretching
- **Community** — peer support chat rooms, forum, crisis support directory

### 👤 Profile
All stats (streak, level, badges, activity counts) are derived from what you've actually done in the app — not placeholder numbers. Tracked locally in your browser.

---

## Tech Stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS v4
- Radix UI / shadcn-style components
- Web Speech API + Web Audio API (speech analysis, volume detection, reminder ringtone)
- localStorage (usage stats, reminders, theme preference — no backend/database)

---

## Running Locally

**Requirements:** [Node.js](https://nodejs.org) installed.

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`) in **Chrome** — Chrome has the best support for the Web Speech API used in the Speech Analysis feature.

To build a production bundle:
```bash
npm run build
```
Output goes to the `dist/` folder.

---

## Deploying to GitHub Pages

This repo is already configured for GitHub Pages via the `gh-pages` package.

```bash
npm run deploy
```

This builds the app and pushes `dist/` to the `gh-pages` branch. GitHub Pages is set to serve from that branch (Settings → Pages → Source: `gh-pages` / root).

**Note:** if you fork or rename this repo, update the `base` path in `vite.config.ts` to match your new repo name exactly, or the deployed site will show a blank page:
```ts
export default defineConfig({
  base: '/your-repo-name/',
  // ...
})
```

Pushing to `main` and deploying to Pages are separate steps — `git push` only updates the source code on GitHub, it does **not** update the live site. Run `npm run deploy` after any change you want visitors to see.

---

## Browser Support

| Feature | Requirement |
|---|---|
| Speech Analysis (live) | Chrome, Edge, or Safari 14.5+ (needs mic permission) |
| Reminder ringtone | Any modern browser (Web Audio API) |
| Everything else | Any modern browser |

If live speech recognition isn't supported, Speech Analysis automatically falls back to a "type instead" mode so you can still get a full metrics breakdown.

---

## Data & Privacy

This is a client-only prototype — there is no backend or database. All data (tasks, reminders, CBT entries, sleep logs, usage stats, theme preference) is stored in your browser's `localStorage`, scoped to whichever browser and device you're using. Clearing site data/cookies for this site will reset your progress.

---

## Project Structure

```
src/
  app/
    App.tsx                 — screen routing, theme, nav
    components/
      Dashboard.tsx
      StudyMode.tsx          — planner, focus timer, reminders
      Communication.tsx      — speech analysis, role-play, voice training
      Wellness.tsx            — mindfulness, CBT, sleep, activity, community
      Profile.tsx
      ReminderPopup.tsx       — persistent reminder modal + ringtone
      ui/                     — shared UI primitives (shadcn-style)
    lib/
      appStats.ts             — localStorage-backed usage tracking
      ringtone.ts              — Web Audio reminder tone
  styles/
    globals.css
```

---

## Attributions

See [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) for third-party licenses (shadcn/ui, Unsplash).
