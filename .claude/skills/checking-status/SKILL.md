---
description: Check live status of all monitored machines
user_invocable: true
command: status
---

# Check Machine Status

Query the ClawPi Scout Dashboard API and report the health of all monitored machines.

## Steps

1. Fetch current data:
   ```bash
   curl -s https://clawpi-scout-dashboard.vercel.app/api/stats
   ```

2. Parse the JSON response and report for each machine (`clawpiscout`, `clawpi`, `macmini`):
   - **Online/Offline**: Is the timestamp less than 5 minutes old?
   - **Last seen**: How long ago was the last push?
   - **CPU Temp**: Current temperature
   - **Memory**: Used vs total (MB)
   - **Disk**: Usage percentage
   - **Load**: Current load average
   - **Gateway** (clawpiscout only): UP/DOWN status, consecutive OK count, uptime, health score

3. Report any active alerts from the `alerts` array.

4. Summarize overall system health:
   - All active = "All Systems Active"
   - Some down = "Partial Outage" (list which machines are down)
   - All down = "Systems Down"

## Output Format

Present results in a clean table format with status indicators.
