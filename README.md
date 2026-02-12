<p align="center">
  <img src="https://img.shields.io/badge/framework-Next.js%2015-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/storage-Upstash%20Redis-00e9a3?style=flat-square&logo=redis&logoColor=white" alt="Upstash" />
  <img src="https://img.shields.io/badge/deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/data-Raspberry%20Pi-c51a4a?style=flat-square&logo=raspberrypi&logoColor=white" alt="Raspberry Pi" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="MIT License" />
</p>

# clawpi-scout-dashboard

Real-time status dashboard for [clawpi-scout](https://github.com/BigDawg013/clawpi-scout) — a Raspberry Pi watchdog daemon that monitors an OpenClaw AI gateway.

The Pi pushes stats every 60 seconds. The dashboard auto-refreshes every 30 seconds.

---

## How it works

```
Scout Pi                              Vercel
+------------------+  POST /api/stats  +------------------------+
| stats_pusher.py  | ----------------> | Next.js API Route      |
| every 60s        |   Bearer API_KEY  | Store in Upstash Redis |
+------------------+                   +-----------+------------+
                                                   |
                                        GET /api/stats (public)
                                                   |
                                       +-----------v------------+
                                       | Dashboard UI           |
                                       | Auto-refresh 30s       |
                                       | Dark theme, responsive |
                                       +------------------------+
```

---

## Dashboard sections

| Section | Data source | What it shows |
|---------|-------------|---------------|
| **Gateway Status** | Health monitor | UP/DOWN badge, uptime, health score (0-10), streak |
| **Pi Vitals** | System stats | CPU temp, memory, disk usage, load average |
| **Environment** | DHT11 sensor | Temperature + humidity |
| **Health History** | 24h rolling data | Area chart of health score + CPU temp over time |
| **Recent Alerts** | Telegram alerter | Timestamped list of down/recovery alerts |

---

## Setup

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FBigDawg013%2Fclawpi-scout-dashboard)

### 2. Add Upstash Redis

Install [Upstash Redis](https://vercel.com/marketplace/upstash) from the Vercel Marketplace. It auto-sets `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

### 3. Set the API key

Generate a key and add it as a Vercel environment variable:

```bash
openssl rand -hex 32
# Add as SCOUT_API_KEY in Vercel project settings
```

### 4. Configure the scout

Add the dashboard section to `config/scout.yaml` on the Pi:

```yaml
dashboard:
  url: "https://your-project.vercel.app/api/stats"
  api_key: "same-key-from-step-3"
  push_interval: 60
```

Restart the scout:

```bash
sudo systemctl restart clawpi-scout
```

---

## Local development

```bash
npm install
cp .env.example .env.local
# Fill in Upstash Redis credentials and SCOUT_API_KEY
npm run dev
```

Test the API:

```bash
# Push test data
curl -X POST http://localhost:3000/api/stats \
  -H "Authorization: Bearer your-key" \
  -H "Content-Type: application/json" \
  -d '{"ts":1707700000,"gateway":{"status":"up","consecutive_ok":42,"uptime_seconds":86400},"system":{"cpu_temp":47.2,"disk_used_pct":34.5,"mem_total_mb":3792,"mem_available_mb":2100,"load_avg":"0.52"},"sensor":{"temperature":23.0,"humidity":45.0},"dashboard":{"health_score":8,"led_state":"green","matrix_pattern":"smiley"},"alerts":[]}'

# Read stats
curl http://localhost:3000/api/stats
```

---

## Tech stack

- **Next.js 15** — App Router, API routes
- **Tailwind CSS** — Dark theme styling
- **Upstash Redis** — Stats storage (free tier: 10K commands/day)
- **SWR** — Client-side data fetching with 30s polling
- **Recharts** — Health history area chart
- **Vercel** — Hosting (free tier)

---

## Related

- **[clawpi-scout](https://github.com/BigDawg013/clawpi-scout)** — The watchdog daemon that feeds this dashboard
- **[clawpi-ai](https://github.com/BigDawg013/clawpi-ai)** — OpenClaw on a Raspberry Pi (the gateway being monitored)
- **[openclaw-setup](https://github.com/BigDawg013/openclaw-setup)** — Multi-agent AI system on Mac Mini

---

## License

[MIT](LICENSE)
