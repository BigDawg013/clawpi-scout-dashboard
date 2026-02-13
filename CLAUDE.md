# ClawPi Scout Dashboard

Real-time system monitoring dashboard for the ClawPi ecosystem — 3 machines pushing stats to Upstash Redis, rendered with a glassmorphism dark UI.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript (strict)
- **Styling**: Tailwind CSS v4 (CSS-first config in `globals.css` via `@theme inline`)
- **Charts**: Recharts (AreaChart with gradient fills)
- **Data Fetching**: SWR (30s auto-refresh)
- **Animations**: Framer Motion (collapsible sections, entrance animations, stagger)
- **Storage**: Upstash Redis (free tier, accessed via `@upstash/redis`)
- **Hosting**: Vercel (auto-deploys from GitHub `main` branch)

## Architecture

```
3 Machines (push every 60s)          Vercel
  clawpiscout (8GB Pi)    POST       /api/stats (validate Bearer key)
  clawpi (4GB Pi)       -------->    Store in Upstash Redis
  macmini (Mac Mini M4)
                                     GET /api/stats (public)
                                     Dashboard reads current + 24h history
```

## Code Conventions

- **Styling**: Tailwind classes only. Use `style={}` only for dynamic computed values (colors, widths).
- **Typography**: Geist Sans for UI labels/headings, Geist Mono (`font-mono`) for data values (temps, percentages, timestamps).
- **Components**: All dashboard components are client components (`"use client"`). Keep them in `app/components/`.
- **Types**: All interfaces in `lib/types.ts`. Import with `@/lib/types`.
- **Card pattern**: Use `card-base card-glow-top rounded-xl px-4 py-3` classes for all card containers.
- **Collapsible sections**: Use `useState` + `AnimatePresence` + `motion.div` with height/opacity animation. Button heading with chevron SVG.
- **Animations**: Use `motion.div` from framer-motion for entrance animations. Stagger children in grids with `staggerChildren: 0.06`.

## Key Files

| Path | Purpose |
|------|---------|
| `app/globals.css` | Theme variables, card/status/scrollbar utility classes, keyframes |
| `app/layout.tsx` | Root layout, font loading (Geist Sans + Mono), metadata |
| `app/api/stats/route.ts` | GET (public read) + POST (auth write) API handler |
| `app/components/dashboard-shell.tsx` | Main orchestrator, SWR data fetch, layout, footer |
| `app/components/status-header.tsx` | Title + color-coded status banner (active/warning/down) |
| `app/components/machine-section.tsx` | Collapsible per-machine section with staggered card grid |
| `app/components/vitals-card.tsx` | CPU temp, memory, disk, load + inline gateway status + health score |
| `app/components/sensor-card.tsx` | DHT11 temp/humidity, LED state, matrix pattern |
| `app/components/history-chart.tsx` | Collapsible 24h CPU temperature AreaChart with gradient fills |
| `app/components/alerts-list.tsx` | Collapsible scrollable recent alerts with accent bars |
| `lib/types.ts` | All TypeScript interfaces and machine metadata (MACHINE_META) |
| `lib/redis.ts` | Upstash Redis client (uses `KV_REST_API_URL` / `KV_REST_API_TOKEN`) |
| `lib/utils.ts` | Formatters: uptime, relative time, temperature, memory |
| `hooks/use-stats.ts` | SWR hook for `/api/stats` with 30s refresh |
| `agent/stats_agent.py` | Universal stats agent (Python, stdlib only, Linux + macOS) |

## UI Structure

```
StatusHeader           — Title + status banner pill (green/amber/red)
MachineSection x3      — Collapsible, first open by default
  VitalsCard           — Gateway status (Scout Pi only) + system metrics
  SensorCard           — Environment data (if sensor present)
HistoryChart           — Collapsible CPU temp chart
AlertsList             — Collapsible alert feed
Footer                 — Links to source, dashboard repo, author, OpenClaw
```

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `KV_REST_API_URL` | Vercel | Upstash Redis REST URL |
| `KV_REST_API_TOKEN` | Vercel | Upstash Redis REST token |
| `SCOUT_API_KEY` | Vercel + agents | Shared secret for POST auth |

## Commands

```bash
npm run dev          # Local development server
npm run build        # Production build (run before committing)
npm run lint         # ESLint check
```

## Git Workflow

Never push directly to `main`. Always:
1. Create a feature branch (`git checkout -b feat/description`)
2. Commit changes
3. Open a PR (`gh pr create`)
4. Merge via PR (`gh pr merge --squash --delete-branch`)

Vercel auto-deploys `main` on merge.

## Machines

| ID | Label | Description | Agent |
|----|-------|-------------|-------|
| `clawpiscout` | Scout Pi | 8GB Pi — AI watchdog & monitor | Built-in `stats_pusher.py` |
| `clawpi` | Claw Pi | 4GB Pi — AI inference node | `stats_agent.py` via systemd |
| `macmini` | Mac Mini | M4 — neural orchestration hub | `stats_agent.py` via launchd |
