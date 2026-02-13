<p align="center">
  <img src="https://img.shields.io/badge/framework-Next.js%2016-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/styling-Tailwind%20CSS%20v4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/storage-Upstash%20Redis-00e9a3?style=flat-square&logo=redis&logoColor=white" alt="Upstash" />
  <img src="https://img.shields.io/badge/deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/data-Raspberry%20Pi-c51a4a?style=flat-square&logo=raspberrypi&logoColor=white" alt="Raspberry Pi" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License" />
</p>

# ClawPi Scout Dashboard

Real-time system monitoring dashboard for the ClawPi ecosystem — three machines pushing stats every 60 seconds, visualized with a glassmorphism dark UI.

**Live:** [clawpi-scout-dashboard.vercel.app](https://clawpi-scout-dashboard.vercel.app)

---

## Machines

| Machine | Hardware | Role |
|---------|----------|------|
| **Scout Pi** | 8GB Raspberry Pi | AI watchdog & monitor |
| **Claw Pi** | 4GB Raspberry Pi | AI inference node |
| **Mac Mini** | M4 | Neural orchestration hub |

---

## How it works

```
3 Machines (push every 60s)            Vercel
  Scout Pi (8GB)                       /api/stats
  Claw Pi (4GB)        POST -------->  Validate Bearer key
  Mac Mini (M4)        Bearer token    Store in Upstash Redis

                                       GET /api/stats (public)
                                       Dashboard reads current + 24h history
```

---

## Dashboard sections

| Section | What it shows |
|---------|---------------|
| **Status Banner** | Color-coded system health — green (active), amber (partial outage), red (down) |
| **System Vitals** | CPU temp, memory, disk, load avg with gradient progress bars. Gateway status + health score (Scout Pi only) |
| **Environment** | DHT11 temperature + humidity, LED state, matrix pattern |
| **CPU Temperature History** | 24h area chart with per-machine gradient fills |
| **Recent Alerts** | Timestamped list of down/recovery alerts |

All sections are collapsible dropdowns. First machine expanded by default.

---

## Setup

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FBigDawg013%2Fclawpi-scout-dashboard)

### 2. Add Upstash Redis

Install [Upstash Redis](https://vercel.com/marketplace/upstash) from the Vercel Marketplace. It auto-sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`.

### 3. Set the API key

```bash
openssl rand -hex 32
# Add as SCOUT_API_KEY in Vercel project settings
```

### 4. Deploy a stats agent

Copy `agent/stats_agent.py` to each machine and configure:

```bash
export DASHBOARD_URL="https://your-project.vercel.app/api/stats"
export DASHBOARD_API_KEY="same-key-from-step-3"
export MACHINE_ID="clawpi"  # clawpiscout | clawpi | macmini
python3 stats_agent.py
```

Or use `agent/agent.yaml.example` as a config template. Service files are provided for systemd (Linux) and launchd (macOS).

---

## Local development

```bash
npm install
cp .env.example .env.local
# Fill in KV_REST_API_URL, KV_REST_API_TOKEN, SCOUT_API_KEY
npm run dev
```

Test the API:

```bash
# Push test data
curl -X POST http://localhost:3000/api/stats \
  -H "Authorization: Bearer your-key" \
  -H "Content-Type: application/json" \
  -d '{"ts":1707700000,"machine":"clawpiscout","gateway":{"status":"up","consecutive_ok":42,"uptime_seconds":86400},"system":{"cpu_temp":47.2,"disk_used_pct":34.5,"mem_total_mb":3792,"mem_available_mb":2100,"load_avg":"0.52"},"sensor":{"temperature":23.0,"humidity":45.0},"dashboard":{"health_score":8,"led_state":"green","matrix_pattern":"smiley"},"alerts":[]}'

# Read stats
curl http://localhost:3000/api/stats
```

---

## Tech stack

- **Next.js 16** — App Router, API routes, TypeScript strict
- **Tailwind CSS v4** — CSS-first config, glassmorphism dark theme
- **Framer Motion** — Collapsible sections, entrance animations, staggered cards
- **Recharts** — CPU temperature area chart with gradient fills
- **SWR** — Client-side data fetching with 30s polling
- **Upstash Redis** — Stats storage (free tier)
- **Vercel** — Hosting with auto-deploy on merge to main

---

## Related

- **[clawpi-scout](https://github.com/BigDawg013/clawpi-scout)** — The watchdog daemon that feeds this dashboard
- **[OpenClaw](https://openclaw.ai)** — The AI platform being monitored

---

## Author

Built by [RChursin](https://github.com/RChursin)

## License

[MIT](LICENSE)
