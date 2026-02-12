# ClawPi Scout Dashboard

Real-time system monitoring dashboard for the ClawPi ecosystem.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript (strict)
- **Styling**: Tailwind CSS v4 (CSS-first config in `globals.css` via `@theme inline`)
- **Charts**: Recharts (AreaChart with gradient fills)
- **Data Fetching**: SWR (30s auto-refresh)
- **Animations**: Framer Motion (entrance animations, stagger)
- **Storage**: Upstash Redis (free tier, accessed via `@upstash/redis`)
- **Hosting**: Vercel (auto-deploys from GitHub `main` branch)

## Architecture

```
3 Machines (push every 60s)          Vercel
  clawpiscout (8GB Pi)    POST       /api/stats (validate Bearer key)
  clawpi (4GB Pi)       -------->    Store in Upstash Redis
  macmini (Mac Mini)
                                     GET /api/stats
                                     Dashboard reads current + history
```

## Code Conventions

- **Styling**: Tailwind classes only. Use `style={}` only for dynamic computed values (colors, widths).
- **Typography**: Geist Sans for UI labels/headings, Geist Mono (`font-mono`) for data values (temps, percentages, timestamps).
- **Components**: All dashboard components are client components (`"use client"`). Keep them in `app/components/`.
- **Types**: All interfaces in `lib/types.ts`. Import with `@/lib/types`.
- **Card pattern**: Use `card-base card-glow-top rounded-2xl p-5` classes for all card containers.
- **Animations**: Use `motion.div` from framer-motion for entrance animations. Stagger children in grids.

## Key Files

| Path | Purpose |
|------|---------|
| `app/globals.css` | Theme variables, card/status/scrollbar utility classes, keyframes |
| `app/layout.tsx` | Root layout, font loading (Geist Sans + Mono), metadata |
| `app/api/stats/route.ts` | GET (public read) + POST (auth write) API handler |
| `app/components/dashboard-shell.tsx` | Main orchestrator, SWR data fetch, layout |
| `app/components/status-header.tsx` | Header with title, live indicator, machine badges |
| `app/components/machine-section.tsx` | Per-machine section with staggered card grid |
| `app/components/gateway-card.tsx` | Gateway UP/DOWN status (clawpiscout only) |
| `app/components/vitals-card.tsx` | CPU temp, memory, disk, load with gradient progress bars |
| `app/components/sensor-card.tsx` | DHT11 temp/humidity, LED state, matrix pattern |
| `app/components/history-chart.tsx` | 24h CPU temperature AreaChart with gradient fills |
| `app/components/alerts-list.tsx` | Scrollable recent alerts with accent bars |
| `lib/types.ts` | All TypeScript interfaces and machine metadata |
| `lib/redis.ts` | Upstash Redis client (uses `KV_REST_API_URL` / `KV_REST_API_TOKEN`) |
| `lib/utils.ts` | Formatters: uptime, relative time, temperature, memory |
| `hooks/use-stats.ts` | SWR hook for `/api/stats` with 30s refresh |
| `agent/stats_agent.py` | Universal stats agent (Python, stdlib only, Linux + macOS) |

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
4. Merge via PR (`gh pr merge`)

Vercel auto-deploys `main` on merge.

## Machines

| ID | Label | Description | Agent |
|----|-------|-------------|-------|
| `clawpiscout` | Scout Pi | 8GB Pi, watchdog daemon | Built-in `stats_pusher.py` |
| `clawpi` | ClawPi | 4GB Pi, AI gateway | `stats_agent.py` via systemd |
| `macmini` | Mac Mini | Hub, multi-agent system | `stats_agent.py` via launchd |
